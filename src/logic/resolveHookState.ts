import type {
  HookStateInitAction,
  HookStateResolvable,
  HookStateSetAction,
} from "../types/logic.ts";
import { cloneObject } from "../utils/cloneObject.ts";
import { isFunction } from "../utils/isFunction.ts";

/**
 * Resolves the next state of a hook state.
 *
 * @param nextState The next state or a function that returns the next state
 * @param currentState (Optional) The current state (only used when `nextState` is a function
 * @returns The resolved next state
 */
export function resolveHookState<TState>(
  nextState: HookStateInitAction<TState>
): TState;
export function resolveHookState<
  TState,
  TCurrentState extends TState | undefined,
>(nextState: HookStateSetAction<TState>, currentState: TCurrentState): TState;
export function resolveHookState<
  TState,
  TCurrentState extends TState | undefined,
>(
  nextState: HookStateResolvable<TState>,
  currentState?: TCurrentState
): TState {
  const resolve = (): TState => {
    if (isFunction(nextState)) {
      return nextState.length
        ? (nextState as (...args: any) => any)(cloneObject(currentState))
        : (nextState as (...args: any) => any)();
    }
    return nextState;
  };
  return cloneObject(resolve());
}
