import { blue } from "std/fmt/colors.ts";
import {
  type Order,
  orderDecider,
  type Restaurant,
  restaurantDecider,
} from "./lib/domain.ts";
import { type Decider, EventSourcingAggregate } from "fmodel";
import {
  type CommandMetadata,
  DenoEventRepository,
} from "./lib/infrastructure.ts";
import type { ApplicationAggregate } from "./lib/application.ts";
import { commandAndMetadataSchema } from "./lib/api_schema.ts";
import type { Command, Event } from "./lib/api.ts";

// A simple HTTP server that handles commands of all types
Deno.serve(async (request: Request) => {
  try {
    // Parse the command and metadata from the request / Zod validation/parsing
    const command: Command & CommandMetadata = commandAndMetadataSchema.parse(
      await request.json(),
    );

    console.log(blue("Handling command: "), command);

    // Open the key-value store
    const kv = await Deno.openKv();
    // Combine deciders to create a new decider that can handle both restaurant and order commands
    const decider: Decider<Command, (Order & Restaurant) | null, Event> =
      restaurantDecider.combine(orderDecider);
    // Create a repository for the events / a Deno implementation of the IEventRepository
    const eventRepository = new DenoEventRepository(kv);
    // Create an aggregate to handle the commands of all types / Aggregate is composed of a decider and an event repository
    const aggregate: ApplicationAggregate = new EventSourcingAggregate(
      decider,
      eventRepository,
    );
    // Handle the commands of all types
    const result = await aggregate.handle(command);
    console.log(blue("Result of command handling: "), result);
    return new Response(JSON.stringify(result, null, 4), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error of command handling: ", error);
    return new Response(error?.message ?? error, {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
// Run the application server : `deno run --unstable-kv --allow-net server.ts`
