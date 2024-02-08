import { useMemo, useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import type { UseQueueActions, UseQueueReturn } from "../../types/states.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";
import { useUpdate } from "../animations/useUpdate.ts";

/**
 * React state hook that implements simple FIFO queue.
 *
 * Returns an array containing the current state and actions to update it:
 * - **`set(newQueue)`** - Set a new queue as the state.
 * - **`add(item)`** - Add an item to the end of the queue.
 * - **`remove()`** - Remove the first item from the queue.
 * - **`clear()`** - Clear the queue.
 * - **`reset()`** - Reset the queue to the initial value.
 * - **`first`** - Get the first item in the queue.
 * - **`last`** - Get the last item in the queue.
 * - **`size`** - Get the size of the queue.
 *
 * @example
 * ```tsx
 * const [
 *   queue,
 *   {
 *     set,
 *     add,
 *     remove,
 *     clear,
 *     reset,
 *     first,
 *     last,
 *     size
 *   }
 * ] = useQueue();
 *
 * return (
 *   <div>
 *     <ul>
 *       <li>first: {first}</li>
 *       <li>last: {last}</li>
 *       <li>size: {size}</li>
 *     </ul>
 *     <button onClick={() => set([1, 2, 3])}>
 *       Set
 *     </button>
 *     <button onClick={() => add((last ?? 0) + 1)}>
 *       Add
 *     </button>
 *     <button onClick={remove}>Remove</button>
 *     <button onClick={clear}>Clear</button>
 *     <button onClick={reset}>Reset</button>
 *     <pre>{JSON.stringify(queue, null, 2)}</pre>
 *   </div>
 * );
 * ```
 *
 * @param initialValue The initial state or a function that returns the initial state
 * @returns A tuple containing the state and the queue actions
 *
 * @category State
 * @since 0.0.1
 */
export const useQueue = <TQueueElement>(
  initialState: HookStateInitAction<TQueueElement[]> = []
): UseQueueReturn<TQueueElement> => {
  const resolvedInitialState = resolveHookState(initialState);

  runOnlyIfDevMode(() => {
    if (!Array.isArray(resolvedInitialState)) {
      warn(
        `\`useQueue\` initial state must be an array but got ${typeof resolvedInitialState}.`,
        {
          initialState,
        }
      );
    }
  });

  const _queue = useRef(resolvedInitialState);
  const _initialState = useRef(resolvedInitialState);
  const update = useUpdate();

  const actions = useMemo(() => {
    const set = (newQueue: HookStateSetAction<TQueueElement[]>) => {
      const rNewQueue = resolveHookState(newQueue, _queue.current);

      runOnlyIfDevMode(() => {
        if (!Array.isArray(rNewQueue)) {
          warn(
            `\`useQueue\` set newQueue arg must be an array but got ${typeof rNewQueue}.`,
            {
              newQueue,
            }
          );
        }
      });

      _queue.current = rNewQueue;

      update();
    };

    return {
      set,
      add: (newItem: HookStateInitAction<TQueueElement>) => {
        set(prevQueue => [...prevQueue, resolveHookState(newItem)]);
      },
      remove: (): TQueueElement | undefined => {
        const [first, ...rest] = _queue.current;
        set(rest);
        return first;
      },
      clear: () => {
        set([]);
      },
      reset: () => {
        const rValue = resolveHookState(_initialState.current, _queue.current);
        set(rValue);
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  Object.defineProperties(actions, {
    first: {
      enumerable: true,
      get: () => _queue.current[0],
    },
    last: {
      enumerable: true,
      get: () => _queue.current[_queue.current.length - 1],
    },
    size: {
      enumerable: true,
      get: () => _queue.current.length,
    },
  });

  return [_queue.current, actions as UseQueueActions<TQueueElement>];
};
