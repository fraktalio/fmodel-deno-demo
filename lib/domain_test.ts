import { restaurantDecider, restaurantView } from "./domain.ts";
import {
  restaurantCommandSchema,
  restaurantEventSchema,
} from "./api_schema.ts";
import { ViewSpecification } from "../test_specification.ts";
import { DeciderSpecification } from "../test_specification.ts";
import type { RestaurantCommand, RestaurantEvent } from "./api.ts";

// A convinient testing specififcation for the Decider - GIVEN / WHEN / THEN

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
            {"menuItemId": "1", "name": "Salad2", "price": "18.59"},
            {"menuItemId": "2", "name": "Soup2", "price": "16.94"},
            {"menuItemId": "3", "name": "Steak2", "price": "19.89"}
          ],
          "menuId": "34110e19-ca72-45e7-b969-61bebf54da08",
          "cuisine": "SERBIAN"
        }
    }
    `;

const placeOrderCommandJson = `
    {
        "commandId": "691490bb-c4d3-45b8-99d0-efcf20e353ag",
        "decider": "Restaurant",
        "kind": "PlaceOrderCommand",
        "id": "691490bb-c4d3-45b8-99d0-efcf20e353ao",
        "orderId": "691490bb-c4d3-45b8-99d0-efcf20e353ag",
        "menuItems": [
          {"menuItemId": "1", "name": "Salad2", "price": "18.59"},
          {"menuItemId": "2", "name": "Soup2", "price": "16.94"},
          {"menuItemId": "3", "name": "Steak2", "price": "19.89"}
        ]
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
          {"menuItemId": "1", "name": "Salad2", "price": "18.59"},
          {"menuItemId": "2", "name": "Soup2", "price": "16.94"},
          {"menuItemId": "3", "name": "Steak2", "price": "19.89"}
        ],
        "menuId": "34110e19-ca72-45e7-b969-61bebf54da08",
        "cuisine": "SERBIAN"
      },
      "final": false
  }
  `;

const restaurantOrderPlacedEventJson = `
  {
      "version": 1,
      "decider": "Restaurant",
      "kind": "RestaurantOrderPlacedEvent",
      "id": "691490bb-c4d3-45b8-99d0-efcf20e353ao",
      "orderId": "691490bb-c4d3-45b8-99d0-efcf20e353ag",
       "menuItems": [
          {"menuItemId": "1", "name": "Salad2", "price": "18.59"},
          {"menuItemId": "2", "name": "Soup2", "price": "16.94"},
          {"menuItemId": "3", "name": "Steak2", "price": "19.89"}
        ],
      "final": false
  }
  `;
const restaurantOrderNotPlacedEventJson = `
  {
      "version": 1,
      "decider": "Restaurant",
      "kind": "RestaurantOrderNotPlacedEvent",
      "id": "691490bb-c4d3-45b8-99d0-efcf20e353ao",
      "orderId": "691490bb-c4d3-45b8-99d0-efcf20e353ag",
       "menuItems": [
          {"menuItemId": "1", "name": "Salad2", "price": "18.59"},
          {"menuItemId": "2", "name": "Soup2", "price": "16.94"},
          {"menuItemId": "3", "name": "Steak2", "price": "19.89"}
        ],
      "final": false,
      "reason": "Restaurant does not exist!"
  }
  `;

// The Decider test for the restaurant create command
Deno.test(function createRestaurantDeciderTest() {
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
  DeciderSpecification.for(restaurantDecider)
    .given([])
    .when(createRestaurantCommand)
    .then([restaurantCreatedEvent]);
});

// The Decider test for the restaurant change menu command
Deno.test(function changeRestaurantMenuDeciderTest() {
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
  DeciderSpecification.for(restaurantDecider)
    .given([restaurantCreatedEvent])
    .when(changeRestaurantMenuCommand)
    .then([restaurantMenuChangedEvent]);
});

// The Decider test for the restaurant place order command
Deno.test(function placeOrderAtRestaurantDeciderTest() {
  // Parse the restaurant command from the request / Zod validation/parsing
  const placeOrderCommand: RestaurantCommand = restaurantCommandSchema
    .parse(
      JSON.parse(placeOrderCommandJson),
    );

  // Parse the restaurant event.
  const restaurantCreatedEvent: RestaurantEvent = restaurantEventSchema
    .parse(
      JSON.parse(restaurantCreatedEventJson),
    );

  // Parse the restaurant event.
  const restaurantOrderPlacedEvent: RestaurantEvent = restaurantEventSchema
    .parse(
      JSON.parse(restaurantOrderPlacedEventJson),
    );

  // Run the second test specification for the restaurant decider
  DeciderSpecification.for(restaurantDecider)
    .given([restaurantCreatedEvent])
    .when(placeOrderCommand)
    .then([restaurantOrderPlacedEvent]);
});

// The Decider test for the restaurant place order command
Deno.test(function placeOrderAtRestaurantWithErrorDeciderTest() {
  // Parse the restaurant command from the request / Zod validation/parsing
  const placeOrderCommand: RestaurantCommand = restaurantCommandSchema
    .parse(
      JSON.parse(placeOrderCommandJson),
    );

  // Parse the restaurant event.
  const restaurantOrderNotPlacedEvent: RestaurantEvent = restaurantEventSchema
    .parse(
      JSON.parse(restaurantOrderNotPlacedEventJson),
    );

  // Run the second test specification for the restaurant decider
  DeciderSpecification.for(restaurantDecider)
    // Given NO restaurant previously created!!!
    .given([])
    .when(placeOrderCommand)
    .then([restaurantOrderNotPlacedEvent]);
});

Deno.test(function reastaurantCreatedViewTest() {
  // Parse the restaurant event.
  const restaurantCreatedEvent: RestaurantEvent = restaurantEventSchema
    .parse(
      JSON.parse(restaurantCreatedEventJson),
    );

  ViewSpecification.for(restaurantView)
    .given([restaurantCreatedEvent])
    .then({
      restaurantId: "691490bb-c4d3-45b8-99d0-efcf20e353ao",
      name: "Eat at Joes",
      menu: {
        menuItems: [
          { menuItemId: "1", name: "Salad", price: "8.99" },
          { menuItemId: "2", name: "Soup", price: "6.99" },
          { menuItemId: "3", name: "Steak", price: "19.99" },
        ],
        menuId: "34110e19-ca72-45e7-b969-61bebf54da08",
        cuisine: "SERBIAN",
      },
    });
});

Deno.test(function restaurantMenuChangedViewTest() {
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

  ViewSpecification.for(restaurantView)
    .given([restaurantCreatedEvent, restaurantMenuChangedEvent])
    .then({
      restaurantId: "691490bb-c4d3-45b8-99d0-efcf20e353ao",
      name: "Eat at Joes",
      menu: {
        menuItems: [
          { menuItemId: "1", name: "Salad2", price: "18.59" },
          { menuItemId: "2", name: "Soup2", price: "16.94" },
          { menuItemId: "3", name: "Steak2", price: "19.89" },
        ],
        menuId: "34110e19-ca72-45e7-b969-61bebf54da08",
        cuisine: "SERBIAN",
      },
    });
});

// Run the tests: `deno test`
