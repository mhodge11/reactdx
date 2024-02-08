import { useMemo, useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import type { UseArrayActions, UseArrayReturn } from "../../types/states.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";
import { useUpdate } from "../animations/useUpdate.ts";

/**
 * Tracks an array and provides methods to modify it.
 * To cause component re-render you have to use these methods
 * instead of direct interaction with array -
 * it won't cause re-render.
 *
 * You can ensure that actions object and actions itself
 * will not mutate or change between renders,
 * so there is no need to add it to useEffect dependencies
 * and safe to pass them down to children.
 *
 * Returns an array containing the current state and actions to update it:
 * - **`set(newList)`** - Set a new array as the state.
 * - **`push(...items)`** - Add item(s) at the end of array.
 * - **`updateAt(index, item)`** - Replace item at given position. If item at given position not exists it will be set.
 * - **`insertAt(index, item)`** - Insert item at given position, all items to the right will be shifted.
 * - **`update(predicate, newItem)`** - Replace all items that matches predicate with given one.
 * - **`updateFirst(predicate, newItem)`** - Replace first item matching predicate with given one.
 * - **`upsert(predicate, newItem)`** - Like `updateFirst` bit in case of predicate miss - pushes item to the array.
 * - **`sort(comparator?)`** - Sort array with given sorting function.
 * - **`filter(callback, thisArg?)`** - Same as native Array's method.
 * - **`removeAt(index)`** - Removes item at given position. All items to the right from removed will be shifted.
 * - **`clear()`** - Remove all elements from the array.
 * - **`reset()`** - Reset array to initial value.
 *
 * @example
 * ```tsx
 * const [
 *   list,
 *   {
 *     set,
 *     push,
 *     updateAt,
 *     insertAt,
 *     update,
 *     updateFirst,
 *     upsert,
 *     sort,
 *     filter,
 *     removeAt,
 *     clear,
 *     reset
 *   }
 * ] = useArray([1, 2, 3, 4, 5]);
 *
 * return (
 *   <div>
 *     <button onClick={() => set([1, 2, 3])}>
 *       Set to [1, 2, 3]
 *     </button>
 *     <button onClick={() => push(Date.now())}>
 *       Push timestamp
 *     </button>
 *     <button onClick={() => updateAt(1, Date.now())}>
 *       Update value at index 1
 *     </button>
 *     <button onClick={() => removeAt(1)}>
 *       Remove element at index 1
 *     </button>
 *     <button
 *       onClick={() => filter(item => item % 2 === 0)}
 *     >
 *       Filter even values
 *     </button>
 *     <button onClick={() => sort((a, b) => a - b)}>
 *       Sort ascending
 *     </button>
 *     <button onClick={() => sort((a, b) => b - a)}>
 *       Sort descending
 *     </button>
 *     <button onClick={clear}>
 *       Clear
 *     </button>
 *     <button onClick={reset}>
 *       Reset
 *     </button>
 *     <pre>{JSON.stringify(list, null, 2)}</pre>
 *   </div>
 * );
 * ```
 *
 * @param initialState The initial state or a function that returns the initial state
 * @returns A tuple containing the state and the state actions
 *
 * @category State
 * @since 0.0.1
 */
export const useArray = <TArrayElement>(
  initialState: HookStateInitAction<TArrayElement[]> = []
): UseArrayReturn<TArrayElement> => {
  const resolvedInitialState = resolveHookState(initialState);
  const _list = useRef(resolvedInitialState);
  const _initialState = useRef(resolvedInitialState);
  const update = useUpdate();

  return [
    _list.current,
    useMemo<UseArrayActions<TArrayElement>>(() => {
      const set = (newArray: HookStateSetAction<TArrayElement[]>) => {
        runOnlyIfDevMode(() => {
          if (!Array.isArray(newArray)) {
            warn(
              `\`useArray\` set action expected an array, but got ${typeof newArray}`,
              {
                newArray,
              }
            );
          }
        });

        _list.current = resolveHookState(newArray, _list.current);

        update();
      };

      const push = (...items: HookStateInitAction<TArrayElement>[]) => {
        if (items.length) {
          set(curr => [...curr, ...items.map(item => resolveHookState(item))]);
        }
      };

      const updateAt = (
        index: number,
        item: HookStateInitAction<TArrayElement>
      ) => {
        set(curr => {
          const clone = curr.slice();
          clone[index] = resolveHookState(item);
          return clone;
        });
      };

      return {
        set,
        push,
        updateAt,
        insertAt: (index: number, item: HookStateInitAction<TArrayElement>) => {
          set(curr => {
            const clone = curr.slice();
            const rItem = resolveHookState(item);
            if (index > clone.length) {
              clone[index] = rItem;
            } else {
              clone.splice(index, 0, rItem);
            }
            return clone;
          });
        },
        update: (
          predicate: (a: TArrayElement, b: TArrayElement) => boolean,
          newItem: HookStateInitAction<TArrayElement>
        ) => {
          const rNewItem = resolveHookState(newItem);
          set(curr =>
            curr.map(item => (predicate(item, rNewItem) ? rNewItem : item))
          );
        },
        updateFirst: (
          predicate: (a: TArrayElement, b: TArrayElement) => boolean,
          newItem: HookStateInitAction<TArrayElement>
        ) => {
          const rNewItem = resolveHookState(newItem);
          const index = _list.current.findIndex(item =>
            predicate(item, rNewItem)
          );
          if (index >= 0) {
            updateAt(index, rNewItem);
          }
        },
        upsert: (
          predicate: (a: TArrayElement, b: TArrayElement) => boolean,
          newItem: HookStateInitAction<TArrayElement>
        ) => {
          const rNewItem = resolveHookState(newItem);
          const index = _list.current.findIndex(item =>
            predicate(item, rNewItem)
          );
          if (index >= 0) {
            updateAt(index, rNewItem);
          } else {
            push(rNewItem);
          }
        },
        sort: (comparator?: (a: TArrayElement, b: TArrayElement) => number) => {
          set(curr => curr.sort(comparator));
        },
        filter: <S extends TArrayElement>(
          callback: (
            value: TArrayElement,
            index: number,
            array: TArrayElement[]
          ) => value is S,
          thisArg?: unknown
        ) => {
          set(curr => curr.filter(callback, thisArg));
        },
        removeAt: (index: number) => {
          set(curr => {
            const clone = curr.slice();
            clone.splice(index, 1);
            return clone;
          });
        },
        clear: () => {
          set([]);
        },
        reset: () => {
          set(_initialState.current);
        },
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  ];
};
