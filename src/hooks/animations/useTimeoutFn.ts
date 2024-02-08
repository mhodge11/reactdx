import { useCallback, useEffect, useRef } from "react";

import type { UseTimeoutFnReturn } from "../../types/animations.ts";

/**
 * React animation hook that calls given function
 * after specified amount of milliseconds.
 *
 * Returns a tuple with the following values:
 * - **`isReady: () => boolean | null`** - Returns the current timeout state:
 *   - **`false`** - Timeout is pending.
 *   - **`true`** - Timeout has been called.
 *   - **`null`** - Timeout has been cancelled.
 * - **`cancel: () => void`** - Cancels the timeout.
 * - **`reset: () => void`** - Resets the timeout.
 *
 * **Explanation**
 *
 * - Does not re-render component.
 * - Automatically clears timeout on cancel.
 * - Automatically resets timeout on delay change.
 * - Reset function call will cancel previous timeout.
 * - Timeout will **NOT** be reset on function change.
 * It will be called within the timeout. If you want to
 * reset the timeout on function change, you can use
 * the `reset` function.
 *
 * @example
 * ```tsx
 * const [state, setState] = useState('Not called yet');
 *
 * const callback = () => {
 *   setState(`Called at ${Date.now()}`);
 * }
 *
 * const [
 *   isReady,
 *   cancel,
 *   reset
 * ] = useTimeoutFn(callback, 5000);
 *
 * const cancelButtonClick = useCallback(() => {
 *   if (isReady() === false) {
 *     cancel();
 *     setState('Cancelled');
 *   } else {
 *     reset();
 *     setState('Not called yet');
 *   }
 * }, []);
 *
 * const readyState = isReady();
 *
 * return (
 *   <div>
 *     <div>
 *       {readyState !== null
 *         ? "Function will be called in 5 seconds"
 *         : "Timer cancelled"
 *       }
 *     </div>
 *     <button onClick={cancelButtonClick}>
 *       {readyState === false
 *         ? "cancel"
 *         : "restart"
 *       } timeout
 *     </button>
 *     <br />
 *     <div>
 *       Function state:{" "}
 *       {readyState === false
 *         ? "Pending"
 *         : readyState
 *         ? "Called"
 *         : "Cancelled"
 *       }
 *     </div>
 *     <div>{state}</div>
 *   </div>
 * );
 * ```
 *
 * @param callback The function to call after the timeout
 * @param ms The amount of milliseconds to wait before calling the `callback`
 * @returns A tuple containing the timeout state and the cancel and reset functions
 *
 * @category Animation
 * @since 0.0.1
 */
export const useTimeoutFn = (
  callback: () => void,
  ms: number = 0
): UseTimeoutFnReturn => {
  const _ready = useRef<boolean | null>(false);
  const _timeout = useRef<ReturnType<typeof setTimeout>>();
  const _callback = useRef(callback);

  _callback.current = callback;

  const isReady = useCallback(() => _ready.current, []);

  const set = useCallback(() => {
    _ready.current = false;
    clearTimeout(_timeout.current);

    _timeout.current = setTimeout(() => {
      _ready.current = true;
      _callback.current();
    }, ms);
  }, [ms]);

  const clear = useCallback(() => {
    _ready.current = null;
    clearTimeout(_timeout.current);
  }, []);

  useEffect(() => {
    set();

    return () => {
      clear();
    };
  }, [set, clear]);

  return [isReady, clear, set];
};
