import { blue } from "std/fmt/colors.ts";
import {
  Command,
  Event,
  Order,
  orderDecider,
  Restaurant,
  restaurantDecider,
} from "./domain.ts";
import { Decider, EventSourcingAggregate } from "fmodel";
import { CommandMetadata, DenoEventRepository } from "./infrastructure.ts";
import { ApplicationAggregate } from "./application.ts";
import { commandAndMetadataSchema } from "./schema.ts";

if (import.meta.main) {
  // Example of a command / a JSON string / it can be fetched from the HTTP request body
  const createRestaurantCommandJson = `
    {
        "commandId": "691490bb-c4d3-45b8-99d0-efcf20e353ag",
        "decider": "Restaurant",
        "kind": "CreateRestaurantCommand",
        "id": "691490bb-c4d3-45b8-99d0-efcf20e353ao",
        "name": "Eat at Joes",
        "menu": {
          "menuItems": [
            {"menuItemId": "1", "name": "Salad", "price": "8.99"},
            {"menuItemId": "2", "name": "Soup", "price": "6.99"},
            {"menuItemId": "3", "name": "Steak", "price": "19.99"}
          ],
          "menuId": "34110e19-ca72-45e7-b969-61bebf54da08",
          "cuisine": "SERBIAN"
        }
    }
    `;

  const changeRestaurantMenuCommandJson = `
    {
        "commandId": "691490bb-c4d3-45b8-99d0-efcf20e353ag",
        "decider": "Restaurant",
        "kind": "ChangeRestaurantMenuCommand",
        "id": "691490bb-c4d3-45b8-99d0-efcf20e353ao",
        "menu": {
          "menuItems": [
            {"menuItemId": "1", "name": "Salad", "price": "8.99"},
            {"menuItemId": "2", "name": "Soup", "price": "6.99"},
            {"menuItemId": "3", "name": "Steak", "price": "19.99"}
          ],
          "menuId": "34110e19-ca72-45e7-b969-61bebf54da08",
          "cuisine": "SERBIAN"
        }
    }
    `;

  // Parse the command and metadata from the request / Zod validation/parsing
  const createRestaurantCommand: Command & CommandMetadata =
    commandAndMetadataSchema.parse(
      JSON.parse(createRestaurantCommandJson),
    );
  const changeRestaurantMenuCommand: Command & CommandMetadata =
    commandAndMetadataSchema.parse(
      JSON.parse(changeRestaurantMenuCommandJson),
    );

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
  console.log(blue("Handling command: "), createRestaurantCommand);
  const result = await aggregate.handle(createRestaurantCommand);
  console.log(blue("Result of command handling: "), result);

  console.log(blue("Handling command: "), changeRestaurantMenuCommandJson);
  const result2 = await aggregate.handle(changeRestaurantMenuCommand);
  console.log(blue("Result of command handling: "), result2);
}

// Run the application: `deno run -A --unstable-kv main.ts`
