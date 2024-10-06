import { assert, assertEquals } from "std/assert/mod.ts";
import type { IDecider, IView } from "fmodel";

export type DeciderSpecification<C, E> = {
  given: (events: E[]) => {
    when: (command: C) => {
      then: (expectedEvents: E[]) => void;
      thenThrows: (assertion: (error: Error) => boolean) => void;
    };
  };
};

/**
 * A test specification for deciders.
 *
 * @param decider - The decider of type `IDecider<C, S, E>` to test.
 *
 * @typeParam C - The type of the command.
 * @typeParam S - The type of the state.
 * @typeParam E - The type of the event.
 *
 * @example
 * ```ts
 * DeciderSpecification.for(restaurantDecider)
 *   .given([restaurantCreatedEvent])
 *   .when(changeRestaurantMenuCommand)
 *   .then([restaurantMenuChangedEvent]);
 * ```
 */
export const DeciderSpecification = {
  for: <C, S, E>(
    decider: IDecider<C, S, E>,
  ): DeciderSpecification<C, E> => {
    return {
      given: (events: E[]) => {
        return {
          when: (command: C) => {
            const handle = () => {
              const currentState = events.reduce<S>(
                decider.evolve,
                decider.initialState,
              );
              return decider.decide(command, currentState);
            };

            return {
              // biome-ignore lint/suspicious/noThenProperty: <explanation>
              then: (expectedEvents: E[]) => {
                const resultEvents = handle();
                assertEquals(resultEvents, expectedEvents);
              },
              thenThrows: (check?: (error: Error) => boolean) => {
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
      },
    };
  },
};

export type ViewSpecification<S, E> = {
  given: (events: E[]) => {
    then: (expectedState: S) => void;
    thenThrows: (assertion: (error: Error) => boolean) => void;
  };
};

/**
 * A test specification for views.
 *
 * @param view - The view of type `IView`<S, E>` to test.
 *
 * @typeParam S - The type of the state.
 * @typeParam E - The type of the event.
 *
 * @example
 * ```ts
 * ViewSpecification.for(restaurantView)
 *   .given([restaurantCreatedEvent, restaurantMenuChangedEvent])
 *   .then(restaurantState);
 * ```
 */
export const ViewSpecification = {
  for: <S, E>(
    view: IView<S, E>,
  ): ViewSpecification<S, E> => {
    return {
      given: (events: E[]) => {
        const handle = () => {
          return events.reduce<S>(
            view.evolve,
            view.initialState,
          );
        };
        return {
          // biome-ignore lint/suspicious/noThenProperty: <explanation>
          then: (expectedState: S) => {
            const resultState = handle();
            assertEquals(resultState, expectedState);
          },
          thenThrows: (check?: (error: Error) => boolean) => {
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
  },
};
