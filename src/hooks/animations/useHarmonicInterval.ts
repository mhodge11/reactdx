import { useEffect, useRef } from "react";

import {
  clearHarmonicInterval,
  setHarmonicInterval,
} from "../../logic/harmonicInterval.ts";
import { isNullOrUndefined } from "../../utils/isNullOrUndefined.ts";

/**
 * React animation hook that is the similar to the `{@link useInterval}`
 * hook, but triggers all effects with the same delay at the same time.
 *
 * For example, this allows you to create ticking clocks
 * on the page which re-render second counter all at the same time.
 *
 * The interval can be paused by setting the delay to `null`.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const [delay, setDelay] = useState(1000);
 * const [isRunning, toggleIsRunning] = useBoolean(true);
 *
 * useHarmonicInterval(
 *   () => {
 *     setCount(count + 1);
 *   },
 *   isRunning ? delay : null
 * );
 *
 * return (
 *   <div>
 *     <div>
 *       delay:
 *       <input
 *         value={delay
 *         onChange={
 *           (event) => setDelay(Number(event.target.value))
 *         }
 *       />
 *     </div>
 *     <h1>count: {count}</h1>
 *     <div>
 *       <button onClick={toggleIsRunning}>
 *         {isRunning ? 'stop' : 'start'}
 *       </button>
 *     </div>
 *   </div>
 * );
 * ```
 *
 * @param callback The callback to run on each interval
 * @param delay The delay between each interval in milliseconds
 *
 * @category Animation
 * @since 0.0.1
 */
export const useHarmonicInterval = (
  callback: () => void,
  delay: number | null = 0
) => {
  const _callback = useRef(callback);
  _callback.current = callback;

  useEffect(() => {
    if (isNullOrUndefined(delay)) {
      return;
    }

    const interval = setHarmonicInterval(() => {
      _callback.current();
    }, delay);

    return () => {
      clearHarmonicInterval(interval);
    };
  }, [delay]);
};
