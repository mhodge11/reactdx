import { useMemo, useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import type { UseGetSetReturn } from "../../types/states.ts";
import { useUpdate } from "../animations/useUpdate.ts";

/**
 * React state hook that returns state getter function
 * instead of raw state itself, this prevents subtle bugs
 * when state is used in nested functions.
 *
 * If you would do the below example in a naive way
 * using regular useState hook, the counter would not
 * increment correctly if you click fast multiple times.
 *
 * @example
 * ```tsx
 * const [get, set] = useGetSet(0);
 *
 * const onClick = () => {
 *   setTimeout(() => {
 *     set(get() + 1);
 *   }, 1000)
 * }
 *
 * return <button onClick={onClick}>{get()}</button>;
 * ```
 *
 * @param initialState The initial state or a function that returns the initial state
 * @returns A tuple containing the state getter and the state setter
 */
export const useGetSet = <TState>(
  initialState: HookStateInitAction<TState>
): UseGetSetReturn<TState> => {
  const _state = useRef(resolveHookState(initialState));
  const update = useUpdate();

  return useMemo(
    () => [
      () => _state.current,
      (newState: HookStateSetAction<TState>) => {
        _state.current = resolveHookState(newState, _state.current);
        update();
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
};
