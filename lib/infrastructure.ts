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
  // key schema: ["streamVersion", "streamId"]
  async versionProvider(event: Event): Promise<StreamVersion | null> {
    const streamVersionKey = ["streamVersion", event.id];
    const version = await this.kv.get(streamVersionKey);
    return version.versionstamp ? { versionstamp: version.versionstamp } : null;
  }

  // Fetch the events from the decider stream
  // key schema: ["events", "streamId", "eventId"]
  async fetch(
    c: Command,
  ): Promise<readonly (Event & StreamVersion & EventMetadata)[]> {
    const streamKeyPrefix = ["events", c.id];
    const eventList = this.kv.list<Event & StreamVersion & EventMetadata>({
      prefix: streamKeyPrefix,
    });

    const events = [];
    for await (const event of eventList) {
      events.push(event.value);
    }
    return events;
  }

  // Save the events
  // key schema: ["streamVersion", "streamId"]
  // key schema: ["events", "streamId", "eventId"]
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
      const streamEventKey = ["events", e.id, eventId];
      const streamVersionKey = ["streamVersion", e.id];
      const eventKey = ["events", eventId];
      const newEvent: Event & EventMetadata = {
        ...e,
        eventId: eventId,
        commandId: commandMetadata.commandId,
      };
      const { versionstamp } = await this.versionProvider(e) ??
        { versionstamp: null };

      atomicOperation
        .check({
          key: streamVersionKey,
          versionstamp: versionstamp,
        }) // Ensure the version of decider stream hasn't changed / optimistic locking
        .set(streamEventKey, newEvent) // Append the event to the concrete stream
        .set(eventKey, newEvent) // Append the event to the one big stream of all events / global stream
        .set(streamVersionKey, eventId); // Update the stream version, with the latest event ID

      // Add the event key to the list of keys that are stored
      keys.push(streamEventKey);
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
