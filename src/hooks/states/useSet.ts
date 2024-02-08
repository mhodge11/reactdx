import { useMemo, useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import type { UseSetActions, UseSetReturn } from "../../types/states.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";
import { useUpdate } from "../animations/useUpdate.ts";

/**
 * React state hook that tracks a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
 *
 * Returns a Set containing the current state and actions to update it:
 * - **`set(newState)`** - Set a new Set as the state.
 * - **`add(value)`** - Add a value to the Set.
 * - **`remove(value)`** - Remove a value from the Set.
 * - **`toggle(value)`** - Toggle a value in the Set. Adds the value if it doesn't exist, otherwise it removes it.
 * - **`has(value)`** - Check if a value exists in the Set.
 * - **`clear()`** - Clear the state Set.
 * - **`reset()`** - Reset the state Set to the initial value.
 *
 * @example
 * ```tsx
 * const [
 *   set,
 *   {
 *     set,
 *     add,
 *     has,
 *     remove,
 *     toggle,
 *     reset,
 *     clear
 *   }
 * ] = useSet(new Set(['hello']));
 *
 * return (
 *   <div>
 *     <button
 *       onClick={() => set(new Set(['hello', 'world']))}
 *     >
 *       Set state to a Set with 'hello' and 'world'
 *     </button>
 *     <button onClick={() => add(String(Date.now()))}>
 *       Add
 *     </button>
 *     <button onClick={() => reset()}>Reset</button>
 *     <button onClick={() => clear()}>Clear</button>
 *     <button
 *       onClick={() => remove('hello')}
 *       disabled={!has('hello')}
 *     >
 *       Remove 'hello'
 *     </button>
 *     <button onClick={() => toggle('hello')}>
 *       Toggle hello
 *     </button>
 *     <pre>{JSON.stringify(Array.from(set), null, 2)}</pre>
 *   </div>
 * );
 * ```
 *
 * @param initialState The initial state or a function that returns the initial state
 * @returns A tuple containing the state and the set actions
 *
 * @category State
 * @since 0.0.1
 */
export const useSet = <TSetElement>(
  initialState: HookStateInitAction<Set<TSetElement>> = new Set<TSetElement>()
): UseSetReturn<TSetElement> => {
  const resolvedInitialState = resolveHookState(initialState);
  const _set = useRef(resolvedInitialState);
  const _initialState = useRef(resolvedInitialState);

  const update = useUpdate();

  return [
    _set.current,
    useMemo<UseSetActions<TSetElement>>(() => {
      const set = (newState: HookStateSetAction<Set<TSetElement>>) => {
        const rState = resolveHookState(newState, _set.current);

        runOnlyIfDevMode(() => {
          if (!(newState instanceof Set)) {
            warn(`\`set\` newState must be a Set but got ${typeof rState}.`, {
              newState,
            });
          }
        });

        _set.current = resolveHookState(newState, _set.current);

        update();
      };

      return {
        set,
        add: (value: HookStateInitAction<TSetElement>) => {
          const newSet = new Set([..._set.current]);
          newSet.add(resolveHookState(value));
          set(curr => {
            const newSet = new Set([...curr]);
            newSet.add(resolveHookState(value));
            return newSet;
          });
        },
        remove: (value: HookStateInitAction<TSetElement>) => {
          set(curr => {
            const newSet = new Set([...curr]);
            newSet.delete(resolveHookState(value));
            return newSet;
          });
        },
        toggle: (value: HookStateInitAction<TSetElement>) => {
          set(curr => {
            const newSet = new Set([...curr]);
            const rValue = resolveHookState(value);
            if (newSet.has(rValue)) {
              newSet.delete(rValue);
            } else {
              newSet.add(rValue);
            }
            return newSet;
          });
        },
        has: (value: HookStateInitAction<TSetElement>) =>
          _set.current.has(resolveHookState(value)),
        clear: () => {
          set(new Set<TSetElement>());
        },
        reset: () => {
          set(_initialState.current);
        },
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  ];
};
