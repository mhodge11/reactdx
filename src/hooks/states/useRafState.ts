import { useCallback, useRef, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import type { UseRafStateReturn } from "../../types/states.ts";
import { useOnUnmount } from "../lifecycles/useOnUnmount.ts";

/**
 * React state hook that only updates state
 * in the callback of [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).
 *
 * @example
 * ```tsx
 * const [state, setState] = useRafState({
 *   width: 0,
 *   height: 0,
 * });
 *
 * useMount(() => {
 *   const onResize = () => {
 *     setState({
 *       width: window.clientWidth,
 *       height: window.height,
 *     });
 *   };
 *
 *   window.addEventListener("resize", onResize);
 *
 *   return () => {
 *     window.removeEventListener("resize", onResize);
 *   };
 * });
 *
 * return <pre>{JSON.stringify(state, null, 2)}</pre>;
 * ```
 *
 * @param initialState The initial state or a function that returns the initial state
 * @returns A tuple containing the state and the state setter
 *
 * @category State
 * @since 0.0.1
 */
export const useRafState = <TState>(
  initialState: HookStateInitAction<TState>
): UseRafStateReturn<TState> => {
  const [state, setState] = useState(resolveHookState(initialState));

  const _frame = useRef(0);
  const _state = useRef(state);

  _state.current = state;

  const setRafState = useCallback((newState: HookStateSetAction<TState>) => {
    if (_frame.current) {
      cancelAnimationFrame(_frame.current);
    }

    _frame.current = requestAnimationFrame(() => {
      setState(resolveHookState(newState, _state.current));
    });
  }, []);

  useOnUnmount(() => {
    if (_frame.current) {
      cancelAnimationFrame(_frame.current);
    }
  });

  return [state, setRafState];
};
