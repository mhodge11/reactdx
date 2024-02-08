import { useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import type { UseDefaultReturn } from "../../types/states.ts";
import { isNullOrUndefined } from "../../utils/isNullOrUndefined.ts";

/**
 * React state hook that returns the default value
 * when state is null or undefined.
 *
 * @example
 * ```tsx
 * const initialUser = { name: 'Marshall' }
 * const defaultUser = { name: 'Mathers' }
 * const [user, setUser] = useDefault(defaultUser, initialUser);
 *
 * return (
 *   <div>
 *     <div>User: {user.name}</div>
 *     <input
 *       onChange={
 *         (e) => setUser({ name: e.target.value })
 *       }
 *     />
 *     <button onClick={() => setUser(null)}>Set null</button>
 *   </div>
 * )
 * ```
 *
 * @param defaultValue The default state value if the initial value is `null` or `undefined`
 * @param initialValue (Optional) The inital state value
 * @returns A tuple containing the state value and the state setter
 */
export const useDefault = <TState>(
  defaultValue: HookStateInitAction<TState>,
  initialState?: HookStateInitAction<TState>
): UseDefaultReturn<TState> => {
  const resolvedDefaultValue = resolveHookState(defaultValue);
  const resolvedInitialState = resolveHookState(initialState);

  const [value, setValue] = useState<TState | undefined | null>(
    resolvedInitialState
  );

  if (isNullOrUndefined(value)) {
    return [resolvedDefaultValue, setValue];
  }

  return [value, setValue];
};
