import type {
  EventSourcingOrchestratingAggregate,
  MaterializedView,
} from "fmodel";
import type { Order, Restaurant, RestaurantView } from "./domain.ts";
import type { StreamVersion } from "./infrastructure.ts";
import type { CommandMetadata } from "./infrastructure.ts";
import type { EventMetadata } from "./infrastructure.ts";
import type { OrderView } from "./domain.ts";
import type { Command, Event } from "./api.ts";

/**
 * An aggregate that handles the command and produces new events / A convenient type alias for the Fmodel's `EventSourcingLockingAggregate`
 * @param command of type Command
 * @param state of type `Restaurant | null`
 * @param event of type Event
 * @param stream_version of type StreamVersion
 * @param commandMetadata of type CommandMetadata
 * @param eventMetadata of type EventMetadata
 */
export type ApplicationAggregate = EventSourcingOrchestratingAggregate<
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
