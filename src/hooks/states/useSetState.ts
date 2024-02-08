import { useCallback, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import type { UseSetStateReturn } from "../../types/states.ts";
import { isFunction } from "../../utils/isFunction.ts";
import { merge } from "../../utils/merge.ts";

/**
 * React state hook that creates setState method which
 * works similar to how `this.setState` works in class components.
 * It merges object changes into the current state.
 *
 * ***Note:** This hook requires the state to be an object.*
 *
 * @example
 * ```tsx
 * const [state, setState] = useSetState({ count: 0 });
 *
 * const increment = () => {
 *   setState({ count: state.count + 1 });
 * };
 * ```
 *
 * @param initialState (Optional) The initial state object
 * @returns A tuple containing the state and the setState method
 *
 * @category State
 * @since 0.0.1
 */
export const useSetState = <TState extends {}>(
  initialState: HookStateInitAction<TState> = {} as TState
): UseSetStateReturn<TState> => {
  const [state, updateState] = useState(resolveHookState(initialState));

  const setState = useCallback<UseSetStateReturn<TState>[1]>(patch => {
    updateState(
      prevState =>
        merge(
          prevState,
          isFunction(patch) ? patch(prevState) : patch
        ) as unknown as TState
    );
  }, []);

  return [state, setState];
};
