import { assert, assertEquals } from "std/assert/mod.ts";
import {
  RestaurantCommand,
  restaurantDecider,
  RestaurantEvent,
} from "./domain.ts";
import {
  restaurantCommandSchema,
  restaurantEventSchema,
} from "./api-schema.ts";

// A convinient testing specififcation for the Decider - GIVEN / WHEN / THEN
export type DeciderSpecfication<Command, Event> = (
  givenEvents: Event[],
) => {
  when: (command: Command) => {
    then: (expectedEvents: Event[]) => void;
    thenThrows: <Error>(assert: (error: Error) => boolean) => void;
  };
};

export const DeciderSpecification = {
  for: <Command, Event, State>(decider: {
    decide: (command: Command, state: State) => readonly Event[];
    evolve: (state: State, event: Event) => State;
    initialState: State;
  }): DeciderSpecfication<Command, Event> => {
    {
      return (givenEvents: Event[]) => {
        return {
          when: (command: Command) => {
            const handle = () => {
              const existingEvents = Array.isArray(givenEvents)
                ? givenEvents
                : [givenEvents];

              const currentState = existingEvents.reduce<State>(
                decider.evolve,
                decider.initialState,
              );

              return decider.decide(command, currentState);
            };

            return {
              then: (expectedEvents: Event | Event[]): void => {
                const resultEvents = handle();

                const resultEventsArray = Array.isArray(resultEvents)
                  ? resultEvents
                  : [resultEvents];

                const expectedEventsArray = Array.isArray(expectedEvents)
                  ? expectedEvents
                  : [expectedEvents];

                assertEquals(resultEventsArray, expectedEventsArray);
              },
              thenThrows: <Error>(check?: (error: Error) => boolean): void => {
                try {
                  handle();
                  throw new Error("Handler did not fail as expected");
                } catch (error) {
                  if (check) assert(check(error as Error) === true);
                }
              },
            };
          },
        };
      };
    }
  },
};

// Json representation of the command
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
// Json representation of the expected event(s)
const restaurantCreatedEventJson = `
 {
     "version": 1,
     "decider": "Restaurant",
     "kind": "RestaurantCreatedEvent",
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
     },
     "final": false
 }
 `;

// Json representation of the command
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

// Json representation of the expected event(s)
const restaurantMenuChangedEventJson = `
  {
      "version": 1,
      "decider": "Restaurant",
      "kind": "RestaurantMenuChangedEvent",
      "id": "691490bb-c4d3-45b8-99d0-efcf20e353ao",
      "menu": {
        "menuItems": [
          {"menuItemId": "1", "name": "Salad", "price": "8.99"},
          {"menuItemId": "2", "name": "Soup", "price": "6.99"},
          {"menuItemId": "3", "name": "Steak", "price": "19.99"}
        ],
        "menuId": "34110e19-ca72-45e7-b969-61bebf54da08",
        "cuisine": "SERBIAN"
      },
      "final": false
  }
  `;

// The test for the restaurant create command
Deno.test(function createRestaurantTest() {
  // Parse the restaurant command from the request / Zod validation/parsing
  const createRestaurantCommand: RestaurantCommand = restaurantCommandSchema
    .parse(
      JSON.parse(createRestaurantCommandJson),
    );

  // Parse the restaurant event.
  const restaurantCreatedEvent: RestaurantEvent = restaurantEventSchema
    .parse(
      JSON.parse(restaurantCreatedEventJson),
    );

  // Run the test specification for the restaurant decider
  DeciderSpecification.for(restaurantDecider)([] /* givenEvents */)
    .when(createRestaurantCommand)
    .then([restaurantCreatedEvent]);
});

// The test for the restaurant change menu command
Deno.test(function changeRestaurantMenuTest() {
  // Parse the restaurant command from the request / Zod validation/parsing
  const changeRestaurantMenuCommand: RestaurantCommand = restaurantCommandSchema
    .parse(
      JSON.parse(changeRestaurantMenuCommandJson),
    );

  // Parse the restaurant event.
  const restaurantCreatedEvent: RestaurantEvent = restaurantEventSchema
    .parse(
      JSON.parse(restaurantCreatedEventJson),
    );

  // Parse the restaurant event.
  const restaurantMenuChangedEvent: RestaurantEvent = restaurantEventSchema
    .parse(
      JSON.parse(restaurantMenuChangedEventJson),
    );

  // Run the second test specification for the restaurant decider
  DeciderSpecification.for(restaurantDecider)([
    restaurantCreatedEvent, /* givenEvents */
  ])
    .when(changeRestaurantMenuCommand)
    .then([restaurantMenuChangedEvent]);
});

// Run the tests: `deno test`
