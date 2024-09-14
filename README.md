# fmodel-deno-demo

> TECHNOLOGY: Fmodel, TypeScript, Deno, Deno KV, Deno Deploy

A demo/example project for the imaginary restaurant and order management.

It demonstrates how to run our unique domain and orchestrate it in an
EventSourced/EventDriven way.

![event model image](.assets/restaurant-model.jpg) _this blueprint is an outcome
of the [event-modeling](https://eventmodeling.org/posts/what-is-event-modeling/)
process_

## Fmodel

This project is using [Fmodel](https://github.com/fraktalio/fmodel-ts) -
TypeScript library.

**Fmodel** is:

- enabling functional, algebraic and reactive domain modeling with Typescript
  programming language.
- inspired by DDD, EventSourcing and Functional programming communities, yet
  implements these ideas and concepts in idiomatic TypeScript, which in turn
  makes our code
  - less error-prone,
  - easier to understand,
  - easier to test,
  - and type-safe.
- enabling illustrating requirements using examples
  - the requirements are presented as scenarios.
  - a scenario is an example of the system’s behavior from the users’
    perspective,
  - and they are specified using the Given-When-Then structure to create a
    testable/runnable specification
    - Given `< some precondition(s) / events >`
    - When `< an action/trigger occurs / commands>`
    - Then `< some post condition / events >`

## First steps

- [https://docs.deno.com/runtime/manual/getting_started/first_steps](https://docs.deno.com/runtime/manual/getting_started/first_steps)
- [https://docs.deno.com/deploy/kv/manual/](https://docs.deno.com/deploy/kv/manual/)

## Run the tests

We are using the `Given`-`When`-`Then` [structure](test_specification.ts) to
create a [testable specification](lib/domain_test.ts):

- Given < some precondition(s) >
- When < an action/trigger occurs >
- Then < some post condition >

```shell
deno test
```

## Run the application (HTTP Server)

```shell
deno run --unstable-kv --allow-net server.ts
```

## Run the client

> This is a simple client that sends a create restaurant command and a change
> restaurant menu command to the server.

```shell
deno run --allow-net client.ts
```

## Deno KV as an event store

[Deno KV](https://docs.deno.com/deploy/kv/manual/) is a key-value database built
directly into the [Deno runtime](https://deno.com/), available in the Deno.Kv
namespace. It can be used for many kinds of data storage use cases. Deno KV is
available in the Deno CLI and on [Deno Deploy](https://deno.com/deploy)
(Hassle-free platform for serverless JavaScript/TypeScript applications).

Deno KV is built on
[FoundationDB](https://apple.github.io/foundationdb/index.html), capable of
handling millions of operations per second. You know what else is built on
FoundationDB? iCloud, Snowflake, and more.

### Modeling event sourcing

To model event sourcing in Deno KV properlly, we are going to use a very simple
Key schema `events.<streamId>.<eventId>` for our Events.

- In this approach, each event is uniquely identified by a combination of a
  stream ID and an event ID. The stream ID represents the stream or
  aggregate/decider to which the event belongs, while the event ID is a unique
  identifier for the event within that stream.
- This format allows events to be grouped by stream and ordered within each
  stream based on the event ID.

#### Optimistic locking

Optimistic locking is a concurrency control mechanism used to prevent conflicts
between multiple processes that are attempting to modify the same data
concurrently. In the context of event sourcing, optimistic locking ensures that
updates to an aggregate (or stream) are performed atomically and consistently,
even in the presence of concurrent writes.

The Deno KV store utilizes
[optimistic concurrency control transactions](https://docs.deno.com/deploy/kv/manual/transactions)
rather than interactive transactions like many SQL systems like PostgreSQL or
MySQL. This approach employs versionstamps, which represent the current version
of a value for a given key, to manage concurrent access to shared resources
without using locks. When a read operation occurs, the system returns a
versionstamp for the associated key in addition to the value.

When introducing a new key schema like `streamVersion.<streamId>`, you can
leverage it to implement optimistic locking by tracking the version of each
stream. Here's how you can do it:

1. Incrementing Stream Version:

- Each time an event is appended to a stream, the version of that stream is
  incremented. This version represents `the number of events` that have been
  appended to the stream / or the last `eventId` that have been appended to the
  stream. Whatever you prefer.
- When appending a new event to a stream, you include the current version of the
  stream in the event's metadata.

2. Checking Stream Version during Update:

- When updating a stream, you retrieve the current version of the stream from
  the event store.
- Before appending a new event to the stream, you compare the retrieved version
  with the version included in the event to be appended.
- If the versions match, it indicates that no other updates have occurred since
  the version was retrieved, and it's safe to append the event.
- If the versions don't match, it indicates that another update has occurred
  concurrently, and you may need to handle the conflict (e.g., by retrying the
  operation, merging changes, or notifying the user).

### Modeling event streaming

When appending events to the event store, in addition to appending them to their
respective streams (`events.<streamId>.<eventId>`), you can also append them to
the `global stream`. The Key schema for the global stream might look like this:
`events.<eventId>`. To read all events ordered by event ID, you simply query the
global stream. As all events are appended to this stream, you get a
comprehensive view of all events in the system.

1. Advantages:

- Simplified Querying: You can query events across all streams in a single
  operation, simplifying event retrieval and processing.
- Comprehensive View: The global stream provides a comprehensive view of all
  events in the system, facilitating analysis and reporting.

2. Considerations:

- Storage Overhead: Maintaining a global stream requires additional storage
  space to store redundant copies of events.
- Consistency: Ensuring consistency between individual streams and the global
  stream may require additional synchronization mechanisms to prevent data
  inconsistencies.

---

Created with :heart: by [Fraktalio](https://fraktalio.com/)

Excited to launch your next IT project with us? Let's get started! Reach out to
our team at `info@fraktalio.com` to begin the journey to success.
