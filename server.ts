import { blue, red } from "std/fmt/colors.ts";
import {
  type Order,
  orderDecider,
  orderView,
  type Restaurant,
  restaurantDecider,
  restaurantView,
} from "./lib/domain.ts";
import { type Decider, EventSourcingAggregate, MaterializedView } from "fmodel";
import {
  type CommandMetadata,
  DenoEventRepository,
  DenoViewStateRepository,
  type EventMetadata,
} from "./lib/infrastructure.ts";
import type {
  ApplicationAggregate,
  ApplicationMaterializedView,
} from "./lib/application.ts";
import {
  commandAndMetadataSchema,
  eventAndMetadataSchema,
} from "./lib/api_schema.ts";
import type { Command, Event } from "./lib/api.ts";

// Open the key-value store
const kv = await Deno.openKv("./db.sqlite3");

// Listen to events from kv queue and apply them to the materialized view
// retry policy can specified on kv.enqueue method (optionally enabled in the DenoEventRepository)
kv.listenQueue(async (raw) => {
  try {
    // Parse the event and metadata from the raw data / Zod validation/parsing
    const event: Event & EventMetadata = eventAndMetadataSchema.parse(raw);
    console.log(blue("Handling event: "), event);
    // Combine views to create a new view that can handle both restaurant and order events
    const view = restaurantView.combine(orderView);
    // Create a repository for the view state / a Deno implementation of the IViewStateRepository
    const readRepository = new DenoViewStateRepository(kv);
    // Create a materialized view to handle the events of all types / MaterializedView is composed of a view and a read repository
    const materializedView: ApplicationMaterializedView = new MaterializedView(
      view,
      readRepository,
    );
    // Handle the events of all types
    const result = await materializedView.handle(event);
    console.log(blue("Result of event handling: "), result);
  } catch (error) {
    // Catch & no throw to prevent queue retries
    console.log(red("Error of event handling: "), error);
  }
});

// A simple HTTP server that handles commands of all types
Deno.serve(async (request: Request) => {
  try {
    // Parse the command and metadata from the request / Zod validation/parsing
    const command: Command & CommandMetadata = commandAndMetadataSchema.parse(
      await request.json(),
    );

    console.log(blue("Handling command: "), command);

    // Combine deciders to create a new decider that can handle both restaurant and order commands
    const decider: Decider<Command, (Order & Restaurant) | null, Event> =
      restaurantDecider.combine(orderDecider);
    // Create a repository for the events / a Deno implementation of the IEventRepository and optionally enable event enqueueing
    const eventRepository = new DenoEventRepository(kv, true);
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
    return new Response((error as Error)?.message ?? error, {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
// Run the application server : `deno run --unstable-kv --allow-net --allow-read --allow-write server.ts`
