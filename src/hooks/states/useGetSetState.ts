import { useCallback, useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import type { UseGetSetStateReturn } from "../../types/states.ts";
import { isFunction } from "../../utils/isFunction.ts";
import { isObjectType } from "../../utils/isObject.ts";
import { merge } from "../../utils/merge.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";
import { useUpdate } from "../animations/useUpdate.ts";

/**
 * React state hook that returns a function that
 * returns the current state value. It is useful
 * when you need to get the latest state value
 * inside a callback.
 *
 * This is a mix of `{@link useGetSet}` and `{@link useSetState}`.
 *
 * @example
 * ```tsx
 * const [get, setState] = useGetSetState({ count: 0 });
 *
 * const increment = () => {
 *   setTimeout(() => {
 *     setState({ count: get().count + 1 });
 *   }, 1000)
 * };
 *
 * return <button onClick={increment}>{get().count}</button>;
 * ```
 *
 * @param initialState The initial state or a function that returns the initial state
 * @returns A tuple containing the state getter and the state setter
 *
 * @category State
 * @since 0.0.1
 */
export const useGetSetState = <TState extends {}>(
  initialState: HookStateInitAction<TState>
): UseGetSetStateReturn<TState> => {
  const resolvedInitialState = resolveHookState(initialState);

  runOnlyIfDevMode(() => {
    if (!isObjectType(resolvedInitialState)) {
      warn("`useGetSetState` initial state must be an object.", {
        initialState: resolvedInitialState,
      });
    }
  });

  const update = useUpdate();
  const _state = useRef(resolvedInitialState);

  const get = useCallback<UseGetSetStateReturn<TState>[0]>(
    () => _state.current,
    []
  );

  const set = useCallback<UseGetSetStateReturn<TState>[1]>(patch => {
    const resolvedPatch = isFunction(patch) ? patch(_state.current) : patch;

    runOnlyIfDevMode(() => {
      if (!isObjectType(resolvedPatch)) {
        warn(
          "`useGetSetState` set callback must return an object or a function that returns an object."
        );
      }
    });

    if (!resolvedPatch) {
      return;
    }

    _state.current = merge(
      {},
      _state.current,
      resolvedPatch
    ) as unknown as TState;

    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [get, set];
};
