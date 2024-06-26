import { EventSourcingAggregate, MaterializedView } from "fmodel";
import { Command, Event, Order, Restaurant, RestaurantView } from "./domain.ts";
import { StreamVersion } from "./infrastructure.ts";
import { CommandMetadata } from "./infrastructure.ts";
import { EventMetadata } from "./infrastructure.ts";
import { OrderView } from "./domain.ts";

/**
 * An aggregate that handles the command and produces new events / A convenient type alias for the Fmodel's `EventSourcingLockingAggregate`
 * @param command of type Command
 * @param state of type `Restaurant | null`
 * @param event of type Event
 * @param stream_version of type StreamVersion
 * @param commandMetadata of type CommandMetadata
 * @param eventMetadata of type EventMetadata
 */
export type ApplicationAggregate = EventSourcingAggregate<
  Command,
  (Restaurant & Order) | null,
  Event,
  StreamVersion,
  CommandMetadata,
  EventMetadata
>;

/**
 * A convenient type alias for the MaterializedView
 * @param state of type `RestaurantView & OrderView | null`
 * @param event of type Event
 * @param stream_version of type StreamVersion
 * @param eventMetadata of type EventMetadata
 */
export type ApplicationMaterializedView = MaterializedView<
  (RestaurantView & OrderView) | null,
  Event,
  StreamVersion,
  EventMetadata
>;
