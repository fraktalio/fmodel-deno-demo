import { Decider, View } from "fmodel";
import type {
  MenuItem,
  OrderCommand,
  OrderEvent,
  OrderId,
  OrderStatus,
  RestaurantCommand,
  RestaurantEvent,
  RestaurantId,
  RestaurantMenu,
  RestaurantName,
} from "./api.ts";

/**
 * Restaurant state / a data type that represents the current state of the Restaurant
 */
export type Restaurant = {
  readonly restaurantId: RestaurantId;
  readonly name: RestaurantName;
  readonly menu: RestaurantMenu;
};

// ####################  Restaurant Decider / Command Handler ########################

/**
 * Restaurant `pure` event-sourced command handler / a decision-making component
 * ___
 * A pure command handling algorithm, responsible for evolving the state of the restaurant.
 * It does not produce any side effects, such as I/O, logging, etc.
 * It utilizes type narrowing to make sure that the command is handled exhaustively.
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
 * ___
 * @param c - command type that is being handled - `RestaurantCommand`
 * @param s - state type that is being evolved - `Restaurant | null`
 * @param e - event type that is being produced / a fact / an outcome of the decision - `RestaurantEvent`
 */
export const restaurantDecider: Decider<
  RestaurantCommand,
  Restaurant | null,
  RestaurantEvent
> = new Decider<RestaurantCommand, Restaurant | null, RestaurantEvent>(
  (command, currentState) => {
    switch (command.kind) {
      case "CreateRestaurantCommand":
        return (currentState === null ||
            currentState.restaurantId === undefined)
          ? [
            {
              version: 1,
              decider: "Restaurant",
              kind: "RestaurantCreatedEvent",
              id: command.id,
              name: command.name,
              menu: command.menu,
              final: false,
            },
          ]
          : [
            {
              version: 1,
              decider: "Restaurant",
              kind: "RestaurantNotCreatedEvent",
              id: command.id,
              name: command.name,
              menu: command.menu,
              reason: "Restaurant already exist!",
              final: false,
            },
          ];
      case "ChangeRestaurantMenuCommand":
        return (currentState !== null &&
            currentState.restaurantId === command.id)
          ? [
            {
              version: 1,
              decider: "Restaurant",
              kind: "RestaurantMenuChangedEvent",
              id: currentState.restaurantId,
              menu: command.menu,
              final: false,
            },
          ]
          : [
            {
              version: 1,
              decider: "Restaurant",
              kind: "RestaurantMenuNotChangedEvent",
              id: command.id,
              menu: command.menu,
              reason: "Restaurant does not exist!",
              final: false,
            },
          ];
      case "PlaceOrderCommand":
        return (currentState !== null &&
            currentState.restaurantId === command.id)
          ? [
            {
              version: 1,
              decider: "Restaurant",
              kind: "RestaurantOrderPlacedEvent",
              id: command.id,
              orderId: command.orderId,
              menuItems: command.menuItems,
              final: false,
            },
          ]
          : [
            {
              version: 1,
              decider: "Restaurant",
              kind: "RestaurantOrderNotPlacedEvent",
              id: command.id,
              orderId: command.orderId,
              menuItems: command.menuItems,
              reason: "Restaurant does not exist!",
              final: false,
            },
          ];
      default: {
        // Exhaustive matching of the command type
        const _: never = command;
        return [];
      }
    }
  },
  (currentState, event) => {
    switch (event.kind) {
      case "RestaurantCreatedEvent":
        return { restaurantId: event.id, name: event.name, menu: event.menu };
      case "RestaurantNotCreatedEvent":
        return currentState;
      case "RestaurantMenuChangedEvent":
        return currentState !== null
          ? {
            restaurantId: currentState.restaurantId,
            name: currentState.name,
            menu: event.menu,
          }
          : currentState;
      case "RestaurantMenuNotChangedEvent":
        return currentState;
      case "RestaurantOrderPlacedEvent":
        return currentState;
      case "RestaurantOrderNotPlacedEvent":
        return currentState;
      default: {
        // Exhaustive matching of the event type
        const _: never = event;
        return currentState;
      }
    }
  },
  null,
);

/**
 * Restaurant View state / a data type that represents the current `view` state of the Restaurant.
 */
export type RestaurantView = {
  readonly restaurantId: RestaurantId;
  readonly name: RestaurantName;
  readonly menu: RestaurantMenu;
};

// ####################### Restaurant View / Event Handler ##############################

/**
 * A pure event handling algorithm, responsible for translating the events into denormalized view state, which is more adequate for querying.
 * ___
 * It does not produce any side effects, such as I/O, logging, etc.
 * It utilizes type narrowing to make sure that the event is handled exhaustively.
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
 * ___
 * @param s - a view state that is being evolved out of the events - `RestaurantView | null`
 * @param e - event type that is being handled - `RestaurantEvent`
 */
export const restaurantView: View<RestaurantView | null, RestaurantEvent> =
  new View<RestaurantView | null, RestaurantEvent>(
    (currentState, event) => {
      switch (event.kind) {
        case "RestaurantCreatedEvent":
          return { restaurantId: event.id, name: event.name, menu: event.menu };
        case "RestaurantNotCreatedEvent":
          return currentState;
        case "RestaurantMenuChangedEvent":
          return currentState !== null
            ? {
              restaurantId: currentState.restaurantId,
              name: currentState.name,
              menu: event.menu,
            }
            : currentState;
        case "RestaurantMenuNotChangedEvent":
          return currentState;
        case "RestaurantOrderPlacedEvent":
          return currentState;
        case "RestaurantOrderNotPlacedEvent":
          return currentState;
        default: {
          // Exhaustive matching of the event type
          const _: never = event;
          return currentState;
        }
      }
    },
    null,
  );

/**
 * Order state / a data type that represents the current state of the Order
 */
export type Order = {
  readonly orderId: OrderId;
  readonly restaurantId: RestaurantId;
  readonly menuItems: MenuItem[];
  readonly status: OrderStatus;
};

// ################### Order Decider / Command Handler ########################

/**
 * Order `pure` event-sourced command handler / a decision-making component
 * ___
 * A pure command handling algorithm, responsible for evolving the state of the order.
 * It does not produce any side effects, such as I/O, logging, etc.
 * It utilizes type narrowing to make sure that the command is handled exhaustively.
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
 * ___
 * @param c - command type that is being handled - `OrderCommand`
 * @param s - state type that is being evolved - `Order | null`
 * @param e - event type that is being produced / a fact / an outcome of the decision - `Order`Event`
 */
export const orderDecider: Decider<OrderCommand, Order | null, OrderEvent> =
  new Decider<OrderCommand, Order | null, OrderEvent>(
    (command, currentState) => {
      switch (command.kind) {
        case "CreateOrderCommand":
          return (currentState === null || currentState.orderId === undefined)
            ? [
              {
                version: 1,
                decider: "Order",
                kind: "OrderCreatedEvent",
                id: command.id,
                restaurantId: command.restaurantId,
                menuItems: command.menuItems,
                final: false,
              },
            ]
            : [
              {
                version: 1,
                decider: "Order",
                kind: "OrderNotCreatedEvent",
                id: command.id,
                restaurantId: command.restaurantId,
                menuItems: command.menuItems,
                final: false,
                reason: "Order already exist!",
              },
            ];
        case "MarkOrderAsPreparedCommand":
          return (currentState !== null && currentState.orderId === command.id)
            ? [
              {
                version: 1,
                decider: "Order",
                kind: "OrderPreparedEvent",
                id: currentState.orderId,
                final: false,
              },
            ]
            : [
              {
                version: 1,
                decider: "Order",
                kind: "OrderNotPreparedEvent",
                id: command.id,
                reason: "Order does not exist!",
                final: false,
              },
            ];
        default: {
          // Exhaustive matching of the command type
          const _: never = command;
          return [];
        }
      }
    },
    (currentState, event) => {
      switch (event.kind) {
        case "OrderCreatedEvent":
          return {
            orderId: event.id,
            restaurantId: event.restaurantId,
            menuItems: event.menuItems,
            status: "CREATED",
          };
        case "OrderNotCreatedEvent":
          return currentState;
        case "OrderPreparedEvent":
          return currentState !== null
            ? {
              orderId: currentState.orderId,
              restaurantId: currentState.restaurantId,
              menuItems: currentState.menuItems,
              status: "PREPARED",
            }
            : currentState;
        case "OrderNotPreparedEvent":
          return currentState;
        default: {
          // Exhaustive matching of the event type
          const _: never = event;
          return currentState;
        }
      }
    },
    null,
  );

/**
 * Order view state / a data type that represents the current state of the Order View
 */
export type OrderView = {
  readonly orderId: OrderId;
  readonly restaurantId: RestaurantId;
  readonly menuItems: MenuItem[];
  readonly status: OrderStatus;
};

// ####################### Order View / Event Handler ##############################

/**
 * A pure event handling algorithm, responsible for translating the events into denormalized view state, which is more adequate for querying.
 * ___
 * It does not produce any side effects, such as I/O, logging, etc.
 * It utilizes type narrowing to make sure that the event is handled exhaustively.
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
 * ___
 * @param s - a view state that is being evolved out of the events - `OrderView | null`
 * @param e - event type that is being handled - `OrderEvent`
 */
export const orderView: View<OrderView | null, OrderEvent> = new View<
  OrderView | null,
  OrderEvent
>(
  (currentState, event) => {
    switch (event.kind) {
      case "OrderCreatedEvent":
        return {
          orderId: event.id,
          restaurantId: event.restaurantId,
          menuItems: event.menuItems,
          status: "CREATED",
        };
      case "OrderNotCreatedEvent":
        return currentState;
      case "OrderPreparedEvent":
        return currentState !== null
          ? {
            orderId: currentState.orderId,
            restaurantId: currentState.restaurantId,
            menuItems: currentState.menuItems,
            status: "PREPARED",
          }
          : currentState;
      case "OrderNotPreparedEvent":
        return currentState;
      default: {
        // Exhaustive matching of the event type
        const _: never = event;
        return currentState;
      }
    }
  },
  null,
);
