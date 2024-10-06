/**
 * @fileoverview This file contains the implementation of the fmodel EventRepository class.
 *
 * - EventRepository: Implements the EventLockingRepository interface and provides methods for fetching and saving events.
 *
 * These classes are used in the infrastructure layer of the application.
 */

import type { IEventRepository } from "fmodel";
import type { Command, Event } from "./api.ts";
import { monotonicFactory } from "ulid";

export const LAST_STREAM_EVENT_KEY_PREFIX = "lastStreamEvent";
export const EVENTS_KEY_PREFIX = "events";
export const EVENTS_BY_STREAM_ID_KEY_PREFIX = "eventsByStreamId";

// Be precise and explicit about the types
export type StreamVersion = {
  versionstamp: string;
};

export type CommandMetadata = {
  commandId: string;
};
export type EventMetadata = {
  commandId: string;
  eventId: string; // ULID
};

/**
 * Store and fetch the events - used by the aggregate / command handler
 */
export class DenoEventRepository implements
  IEventRepository<
    Command,
    Event,
    StreamVersion,
    CommandMetadata,
    EventMetadata
  > {
  constructor(
    private readonly kv: Deno.Kv,
  ) {
  }

  // Fetch the version of the decider stream
  // key schema: ["lastStreamEvent", "streamId"]
  async versionProvider(event: Event): Promise<StreamVersion | null> {
    const lastStreamEventKey = [LAST_STREAM_EVENT_KEY_PREFIX, event.id];
    const lastStreamEvent = await this.kv.get(lastStreamEventKey);
    return lastStreamEvent.versionstamp
      ? { versionstamp: lastStreamEvent.versionstamp }
      : null;
  }

  // Fetch the events from the decider stream
  // key schema: ["events", "streamId", "eventId"]
  async fetch(
    c: Command,
  ): Promise<readonly (Event & StreamVersion & EventMetadata)[]> {
    const eventsByStreamIdPrefix = [EVENTS_BY_STREAM_ID_KEY_PREFIX, c.id];
    const eventsByStreamId = this.kv.list<
      Event & StreamVersion & EventMetadata
    >({
      prefix: eventsByStreamIdPrefix,
    });

    const result = [];
    for await (const event of eventsByStreamId) {
      result.push(event.value);
    }
    return result;
  }

  // Save the events
  // key schema: ["lastStreamEvent", "streamId"]
  // key schema: ["eventsByStreamId", "streamId", "eventId"]
  // key schema: ["events", "eventId"]
  async save(
    eList: readonly (Event)[],
    commandMetadata: CommandMetadata,
  ): Promise<readonly (Event & StreamVersion & EventMetadata)[]> {
    // A monotonic Factory to generate a ULID for the event(s)
    const ulid = monotonicFactory();
    // List of keys to store the events
    const keys = [];

    // Atomic operation to ensure consistency of storing the event and updating the decider stream version in the KV store
    const atomicOperation = this.kv.atomic();
    for (const e of eList) {
      const eventId = ulid();
      const eventsByStreamIdKey = [
        EVENTS_BY_STREAM_ID_KEY_PREFIX,
        e.id,
        eventId,
      ];
      const lastStreamEventKey = [LAST_STREAM_EVENT_KEY_PREFIX, e.id];
      const eventsKey = [EVENTS_KEY_PREFIX, eventId];
      const newEvent: Event & EventMetadata = {
        ...e,
        eventId: eventId,
        commandId: commandMetadata.commandId,
      };
      const { versionstamp } = await this.versionProvider(e) ??
        { versionstamp: null };

      atomicOperation
        .check({
          key: lastStreamEventKey,
          versionstamp: versionstamp,
        }) // Ensure the version of decider stream hasn't changed / optimistic locking
        .set(eventsByStreamIdKey, newEvent) // Append the event to the concrete stream
        .set(eventsKey, newEvent) // Append the event to the one big stream of all events / global stream
        .set(lastStreamEventKey, newEvent); // Update the last event in the decider/aggregate stream. This is used for optimistic locking

      // Add the event key to the list of keys that are stored
      keys.push(eventsByStreamIdKey);
    }
    // Commit the transaction
    if (!(await atomicOperation.commit()).ok) {
      throw new Error("Failed to save event");
    }

    // Retrieve newlly stored events with the metadata
    const storedEvents = await this.kv.getMany<(Event & EventMetadata)[]>(keys);

    // Map the stored events to include the versionstamp and return result(s)
    const result = [];
    for (const e of storedEvents) {
      if (e.value === null) {
        throw new Error("Failed to save event properly. Event not found.");
      }
      const version = await this.versionProvider(e.value);
      if (version === null) {
        throw new Error(
          "Failed to save event properly. Versionstamp not found.",
        );
      }
      result.push({ ...e.value, versionstamp: version.versionstamp });
    }
    // Return the events with the metadata
    return result;
  }
}
