import { useReducer } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import type { UseBooleanReturn } from "../../types/states.ts";
import { isFunction } from "../../utils/isFunction.ts";

/**
 * Sets the state to the next value if provided,
 * otherwise toggles the state.
 *
 * @param state The current state
 * @param nextValue (Optional) The next value to set the state to
 * @returns The next state
 */
const toggleReducer = (
  state: boolean,
  nextState?: HookStateSetAction<boolean>
) => (isFunction(nextState) ? nextState(state) : nextState ?? !state);

/**
 * React state hook that tracks value of a boolean.
 *
 * @example
 * ```tsx
 * const [on, toggle] = useBoolean();
 *
 * return (
 *   <div>
 *     <div>{on ? "ON" : "OFF"}</div>
 *     <button onClick={toggle}>
 *       Toggle
 *     </button>
 *     <button onClick={() => toggle(true)}>
 *       Set ON
 *     </button>
 *     <button onClick={() => toggle(false)}>
 *       Set OFF
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @param initialState The initial state
 * @returns A tuple containing the state and the toggle method
 *
 * @category State
 * @since 0.0.1
 */
export const useBoolean = (
  initialState: HookStateInitAction<boolean> = false
): UseBooleanReturn =>
  useReducer<React.Reducer<boolean, HookStateSetAction<boolean>>>(
    toggleReducer,
    resolveHookState(initialState)
  );
