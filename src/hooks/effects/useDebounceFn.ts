import { useEffect } from "react";

import type { UseDebounceReturn } from "../../types/effects.ts";
import { useTimeoutFn } from "../animations/useTimeoutFn.ts";

/**
 * React hook that delays invoking a function until after
 * wait milliseconds have elapsed since the last time the
 * debounced function was invoked.
 *
 * The third argument is the array of values that the debounce
 * depends on, in the same manner as useEffect. The debounce
 * timeout will start when one of the values changes.
 *
 * Returns a tuple with the following values:
 * - **`isReady: () => boolean | null`** - Returns the current debounce state:
 *   - **`false`** - Debounce is pending.
 *   - **`true`** - Debounce has been called.
 *   - **`null`** - Debounce has been cancelled.
 * - **`cancel: () => void`** - Cancels the debounce.
 *
 * @example
 * ```tsx
 * const [state, setState] = useState("Typing stopped");
 * const [val, setVal] = useState("");
 * const [debouncedValue, setDebouncedValue] = useState("");
 *
 * const [, cancel] = useDebounce(
 *   () => {
 *     setState("Typing stopped");
 *     setDebouncedValue(val);
 *   },
 *   2000,
 *   [val]
 * );
 *
 * return (
 *   <div>
 *     <input
 *       type="text"
 *       value={val}
 *       placeholder="Debounced input"
 *       onChange={({ currentTarget }) => {
 *         setState("Waiting for typing to stop...");
 *         setVal(currentTarget.value);
 *       }}
 *     />
 *     <div>{state}</div>
 *     <div>
 *       Debounced value: {debouncedValue}
 *       <button onClick={cancel}>
 *         Cancel debounce
 *       </button>
 *     </div>
 *   </div>
 * );
 * ```
 *
 * @param fn The function to debounce
 * @param ms The amount of milliseconds to wait before invoking the function
 * @param deps The dependencies to watch for changes to reset the debounce timeout
 * @returns A tuple containing the debounce state and the cancel function
 */
export const useDebounce = (
  callback: () => void,
  ms: number = 0,
  deps: React.DependencyList = []
): UseDebounceReturn => {
  const [isReady, cancel, reset] = useTimeoutFn(callback, ms);

  const allDeps = [...deps, reset];

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, allDeps);

  return [isReady, cancel];
};
