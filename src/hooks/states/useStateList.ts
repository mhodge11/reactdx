import { useMemo, useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import type { UseStateListReturn } from "../../types/states.ts";
import { useUpdate } from "../animations/useUpdate.ts";
import { useMountedState } from "../lifecycles/useMountedState.ts";
import { useUpdateEffect } from "../lifecycles/useUpdateEffect.ts";

/**
 * Provides handles for circular iteration over states list.
 * Supports forward and backward iterations
 * and arbitrary position set.
 *
 * If `stateSet` changed, became shorter than before
 * and `currentIndex` is left in shrunk gap -
 * the last element of list will be taken as current.
 *
 * Returns an object containing the current state and actions to update it:
 * - **`state`** - The current state.
 * - **`currentIndex`** = The index of the current state.
 * - **`isFirst`** - Whether the current state is the first value in the list.
 * - **`isLast`** - Whether the current state is the last value in the list.
 * - **`setStateAt(newIndex)`** - Sets the state at a given index.
 * - **`setState(newState)`** - Sets the state to a new value.
 * - **`next()`** - Sets the state to the next value in the list.
 * - **`prev()`** - Sets the state to the previous value in the list.
 *
 * @example
 * ```tsx
 * const stateSet = ['first', 'second', 'third', 'fourth', 'fifth'];
 *
 * const { state, prev, next, setStateAt, setState, currentIndex, isFirst, isLast } = useStateList(stateSet);
 *
 * const indexInput = useRef<HTMLInputElement>(null);
 * const stateInput = useRef<HTMLInputElement>(null);
 *
 * return (
 *   <div>
 *     <pre>
 *       {state}
 *       [index: {currentIndex}],
 *       [isFirst: {isFirst}],
 *       [isLast: {isLast}]
 *     </pre>
 *     <button onClick={prev}>Prev</button>
 *     <br />
 *     <button onClick={next}>Next</button>
 *     <br />
 *     <input ref={indexInput} placeholder="index" />
 *     <button
 *       onClick={
 *         () => setStateAt(Number(indexInput.current?.value))
 *       }
 *     >
 *       Set by index
 *     </button>
 *     <br />
 *     <input ref={stateInput} placeholder="state" />
 *     <button
 *       onClick={
 *         () => setState(stateInput.current?.value)
 *       }
 *     >
 *       Set by state
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @param stateList The list of states to manage
 * @returns A state list object containing the current state and actions to update it
 *
 * @category State
 * @since 0.0.1
 */
export const useStateList = <TState>(
  stateList: HookStateInitAction<TState[]> = []
): UseStateListReturn<TState> => {
  const resolvedStateList = resolveHookState(stateList);

  const mounted = useMountedState();
  const update = useUpdate();
  const _index = useRef(0);

  // If new state list is shorter that before - switch to the last element
  useUpdateEffect(() => {
    if (resolvedStateList.length <= _index.current) {
      _index.current = resolvedStateList.length - 1;
      update();
    }
  }, [resolvedStateList.length]);

  const actions = useMemo(
    () => ({
      setStateAt: (newIndex: number) => {
        if (
          // do nothing on unmounted component
          !mounted() ||
          // do nothing on empty states list
          !resolvedStateList.length ||
          // in case new index is equal current - do nothing
          newIndex === _index.current
        ) {
          return;
        }

        // it gives the ability to travel through the left and right borders.
        // 4ex: if list contains 5 elements, attempt to set index 9 will bring use to 5th element
        // in case of negative index it will start counting from the right, so -17 will bring us to 4th element
        _index.current =
          newIndex >= 0
            ? newIndex % resolvedStateList.length
            : resolvedStateList.length + (newIndex % resolvedStateList.length);

        update();
      },
      setState: (state: HookStateInitAction<TState>) => {
        // do nothing on unmounted component
        if (!mounted()) {
          return;
        }

        const resolvedState = resolveHookState(state);

        const newIndex = resolvedStateList.length
          ? resolvedStateList.indexOf(resolvedState)
          : -1;

        _index.current = newIndex;
        update();
      },
      next: () => actions.setStateAt(_index.current + 1),
      prev: () => actions.setStateAt(_index.current - 1),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedStateList]
  );

  const result = { ...actions };
  Object.defineProperties(result, {
    state: {
      enumerable: true,
      get: () => resolvedStateList[_index.current],
    },
    currentIndex: {
      enumerable: true,
      get: () => _index.current,
    },
    isFirst: {
      enumerable: true,
      get: () => _index.current === 0,
    },
    isLast: {
      enumerable: true,
      get: () => _index.current === resolvedStateList.length - 1,
    },
  });
  return result as UseStateListReturn<TState>;
};
