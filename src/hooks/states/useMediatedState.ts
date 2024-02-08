import { useCallback, useRef, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import type {
  StateMediator,
  UseMediatedStateReturn,
} from "../../types/states.ts";

/**
 * React state hook that uses a mediator function to update the state.
 * The mediator function can be used to implement
 * custom state management logic.
 *
 * A lot like the standard useState, but with mediation process.
 *
 * Returns an array containing the current state and a state setter.
 *
 * @example
 * ```tsx
 * const inputMediator = (s) => s.replace(/[\s]+/g, ' ');
 * const [state, setState] = useMediatedState(inputMediator, '');
 *
 * return (
 *   <div>
 *     <div>
 *       You will not be able to enter more than one space
 *     </div>
 *     <input
 *       type="text"
 *       min="0"
 *       max="10"
 *       value={state}
 *       onChange={(ev) => {
 *         setState(ev.target.value);
 *       }}
 *     />
 *   </div>
 * );
 * ```
 *
 * @param mediator The state mediator function
 * @param initialState The initial state
 * @returns A tuple containing the state and the state setter
 *
 * @category State
 * @since 0.0.1
 */
export function useMediatedState<TState = undefined>(
  mediator: StateMediator<TState | undefined>
): UseMediatedStateReturn<TState | undefined>;
export function useMediatedState<TState = any>(
  mediator: StateMediator<TState>,
  initialState: HookStateInitAction<TState>
): UseMediatedStateReturn<TState>;
export function useMediatedState<TState = any>(
  mediator: StateMediator<TState>,
  initialState?: HookStateInitAction<TState>
): UseMediatedStateReturn<TState> {
  const resolvedInitialState = resolveHookState(initialState) as TState;
  const [state, setMediatedState] = useState(resolvedInitialState);

  const _mediator = useRef(mediator);
  const _state = useRef(state);
  _state.current = state;

  const setState = useCallback<UseMediatedStateReturn<TState>[1]>(newState => {
    if (_mediator.current.length === 2) {
      _mediator.current(_state.current, newState as any);
    } else {
      setMediatedState(_mediator.current(newState as any));
    }
  }, []);

  return [state, setState];
}
