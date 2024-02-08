import { useEffect, useRef, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import { useOnUnmount } from "../lifecycles/useOnUnmount.ts";

/**
 * React side-effect hook that throttles a value.
 *
 * @example
 * ```tsx
 * const [value, setValue] = useState("");
 * const throttledValue = useThrottle(value, 500);
 *
 * return (
 *   <>
 *     <input
 *       type="text"
 *       value={value}
 *       onChange={(e) => setValue(e.target.value)}
 *       placeholder="Throttled input"
 *       style={{ marginBottom: 10 }}
 *     />
 *     <div>Value: {throttledValue}</div>
 *   </>
 * );
 * ```
 *
 * @param value The value to throttle
 * @param ms The throttle time in milliseconds (Defaults to `200`)
 * @returns The throttled value
 *
 * @category Effect
 * @since 0.0.1
 */
export const useThrottle = <T>(
  value: HookStateInitAction<T>,
  ms: number = 200
): T => {
  const valueState = resolveHookState(value);

  const [state, setState] = useState<T>(valueState);

  const _timeout = useRef<ReturnType<typeof setTimeout>>();
  const _nextValue = useRef<T>();
  const _hasNextValue = useRef(false);

  useEffect(() => {
    if (!_timeout.current) {
      setState(valueState);
      const timeoutCallback = () => {
        if (_hasNextValue.current) {
          _hasNextValue.current = false;
          setState(_nextValue.current as T);
          _timeout.current = setTimeout(timeoutCallback, ms);
        } else {
          _timeout.current = undefined;
        }
      };
      _timeout.current = setTimeout(timeoutCallback, ms);
    } else {
      _nextValue.current = valueState;
      _hasNextValue.current = true;
    }
  }, [valueState, ms]);

  useOnUnmount(() => {
    clearTimeout(_timeout.current);
  });

  return state;
};
