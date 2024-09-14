// Be precise and explicit about the types
export type SchemaVersion = number;
export type RestaurantId = string;
export type OrderId = string;
export type MenuItemId = string;
export type RestaurantName = string;
export type RestaurantMenuId = string;
export type MenuItemName = string;
export type MenuItemPrice = string;
export type OrderStatus = "NOT_CREATED" | "CREATED" | "PREPARED";
export type Reason =
  | "Restaurant already exist!"
  | "Restaurant does not exist!"
  | "Order already exist!"
  | "Order does not exist!";

export type RestaurantMenuCuisine =
  | "GENERAL"
  | "SERBIAN"
  | "ITALIAN"
  | "MEXICAN"
  | "CHINESE"
  | "INDIAN"
  | "FRENCH";

export type MenuItem = {
  readonly menuItemId: MenuItemId;
  readonly name: MenuItemName;
  readonly price: MenuItemPrice;
};

export type RestaurantMenu = {
  readonly menuItems: MenuItem[];
  readonly menuId: RestaurantMenuId;
  readonly cuisine: RestaurantMenuCuisine;
};

// ###########################################################################
// ########################### Restaurant ####################################
// ###########################################################################

// ########################## API (COMMANDS) #################################

export type RestaurantCommand =
  | CreateRestaurantCommand
  | ChangeRestaurantMenuCommand
  | PlaceOrderCommand;

export type CreateRestaurantCommand = {
  readonly decider: "Restaurant";
  readonly kind: "CreateRestaurantCommand";
  readonly id: RestaurantId;
  readonly name: RestaurantName;
  readonly menu: RestaurantMenu;
};

export type ChangeRestaurantMenuCommand = {
  readonly decider: "Restaurant";
  readonly kind: "ChangeRestaurantMenuCommand";
  readonly id: RestaurantId;
  readonly menu: RestaurantMenu;
};

export type PlaceOrderCommand = {
  readonly decider: "Restaurant";
  readonly kind: "PlaceOrderCommand";
  readonly id: RestaurantId;
  readonly orderId: OrderId;
  readonly menuItems: MenuItem[];
};

// ########################### API (EVENTS) ##################################

export type RestaurantEvent =
  | RestaurantCreatedEvent
  | RestaurantNotCreatedEvent
  | RestaurantMenuChangedEvent
  | RestaurantMenuNotChangedEvent
  | RestaurantOrderPlacedEvent
  | RestaurantOrderNotPlacedEvent;

export type RestaurantCreatedEvent = {
  readonly version: SchemaVersion;
  readonly decider: "Restaurant";
  readonly kind: "RestaurantCreatedEvent";
  readonly id: RestaurantId;
  readonly name: RestaurantName;
  readonly menu: RestaurantMenu;
  readonly final: boolean;
};

export type RestaurantNotCreatedEvent = {
  readonly version: SchemaVersion;
  readonly decider: "Restaurant";
  readonly kind: "RestaurantNotCreatedEvent";
  readonly id: RestaurantId;
  readonly name: RestaurantName;
  readonly menu: RestaurantMenu;
  readonly reason: Reason;
  readonly final: boolean;
};

export type RestaurantMenuChangedEvent = {
  readonly version: SchemaVersion;
  readonly decider: "Restaurant";
  readonly kind: "RestaurantMenuChangedEvent";
  readonly id: RestaurantId;
  readonly menu: RestaurantMenu;
  readonly final: boolean;
};

export type RestaurantMenuNotChangedEvent = {
  readonly version: SchemaVersion;
  readonly decider: "Restaurant";
  readonly kind: "RestaurantMenuNotChangedEvent";
  readonly id: RestaurantId;
  readonly menu: RestaurantMenu;
  readonly reason: Reason;
  readonly final: boolean;
};

export type RestaurantOrderPlacedEvent = {
  readonly version: SchemaVersion;
  readonly decider: "Restaurant";
  readonly kind: "RestaurantOrderPlacedEvent";
  readonly id: RestaurantId;
  readonly orderId: OrderId;
  readonly menuItems: MenuItem[];
  readonly final: boolean;
};

export type RestaurantOrderNotPlacedEvent = {
  readonly version: SchemaVersion;
  readonly decider: "Restaurant";
  readonly kind: "RestaurantOrderNotPlacedEvent";
  readonly id: RestaurantId;
  readonly orderId: OrderId;
  readonly menuItems: MenuItem[];
  readonly reason: Reason;
  readonly final: boolean;
};

// ###########################################################################
// ############################## Order ######################################
// ###########################################################################

// ########################## API (COMMANDS) #################################

export type OrderCommand = CreateOrderCommand | MarkOrderAsPreparedCommand;

export type CreateOrderCommand = {
  readonly decider: "Order";
  readonly kind: "CreateOrderCommand";
  readonly id: OrderId;
  readonly restaurantId: RestaurantId;
  readonly menuItems: MenuItem[];
};

export type MarkOrderAsPreparedCommand = {
  readonly decider: "Order";
  readonly kind: "MarkOrderAsPreparedCommand";
  readonly id: OrderId;
};

// ########################### API (EVENTS) ##################################

export type OrderEvent =
  | OrderCreatedEvent
  | OrderNotCreatedEvent
  | OrderPreparedEvent
  | OrderNotPreparedEvent;

export type OrderCreatedEvent = {
  readonly version: SchemaVersion;
  readonly decider: "Order";
  readonly kind: "OrderCreatedEvent";
  readonly id: OrderId;
  readonly restaurantId: RestaurantId;
  readonly menuItems: MenuItem[];
  readonly final: boolean;
};

export type OrderNotCreatedEvent = {
  readonly version: SchemaVersion;
  readonly decider: "Order";
  readonly kind: "OrderNotCreatedEvent";
  readonly id: OrderId;
  readonly restaurantId: RestaurantId;
  readonly reason: Reason;
  readonly menuItems: MenuItem[];
  final: boolean;
};

export type OrderPreparedEvent = {
  readonly version: SchemaVersion;
  readonly decider: "Order";
  readonly kind: "OrderPreparedEvent";
  readonly id: OrderId;
  readonly final: boolean;
};

export type OrderNotPreparedEvent = {
  readonly version: SchemaVersion;
  readonly decider: "Order";
  readonly kind: "OrderNotPreparedEvent";
  readonly id: OrderId;
  readonly reason: Reason;
  readonly final: boolean;
};

// All variants of commands
export type Command = RestaurantCommand | OrderCommand;
// All variants of events
export type Event = RestaurantEvent | OrderEvent;
