import { useEffect, useRef, useState } from "react";

import type { GenericFunction } from "../../types/utils.ts";

/**
 * React side-effect hook that throttles a function.
 *
 * @example
 * ```tsx
 * const [value, setValue] = useState("");
 * const throttledSetValue = useThrottleFn(setValue);
 *
 * return (
 *   <>
 *     <input
 *       type="text"
 *       value={value}
 *       onChange={(e) => throttledSetValue(e.target.value)}
 *       placeholder="Throttled input"
 *     />
 *     <div>Value: {value}</div>
 *   </>
 * );
 * ```
 *
 * @param fn The function to throttle
 * @param ms The number of milliseconds to throttle the function (Defaults to `200`)
 * @param args The arguments to pass to the function
 * @returns The return value of the function
 *
 * @category Effect
 * @since 0.0.1
 */
export const useThrottleFn = <
  TFunc extends GenericFunction<TFunc>,
  TArgs extends Parameters<TFunc> = Parameters<TFunc>,
>(
  callback: TFunc,
  ms: number = 200,
  args: TArgs = Array.from(callback.arguments) as TArgs
) => {
  const [state, setState] = useState<ReturnType<TFunc> | null>(null);

  const _timeout = useRef<ReturnType<typeof setTimeout>>();
  const _nextArgs = useRef<TArgs>();

  useEffect(() => {
    if (!_timeout.current) {
      setState(callback(...args));
      const timeoutCallback = () => {
        if (_nextArgs.current) {
          setState(callback(...(_nextArgs.current as TArgs)));
          _nextArgs.current = undefined;
          _timeout.current = setTimeout(timeoutCallback, ms);
        } else {
          _timeout.current = undefined;
        }
      };
      _timeout.current = setTimeout(timeoutCallback, ms);
    } else {
      _nextArgs.current = args;
    }
  }, [callback, ms, args]);

  return state;
};
