import { useEffect, useRef } from "react";

import { isNullOrUndefined } from "../../utils/isNullOrUndefined.ts";

/**
 * A declarative interval hook based on
 * [Dan Abramov's article on overreacted.io](https://overreacted.io/making-setinterval-declarative-with-react-hooks/).
 *
 * The interval can be paused by setting the delay to `null`.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const [delay, setDelay] = useState(1000);
 * const [isRunning, toggleIsRunning] = useBoolean(true);
 *
 * useInterval(
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
export const useInterval = (
  callback: () => void,
  delay: number | null = 0
): void => {
  const _callback = useRef(callback);
  _callback.current = callback;

  useEffect(() => {
    if (isNullOrUndefined(delay)) {
      return;
    }

    const interval = setInterval(() => {
      _callback.current();
    }, delay);

    return () => {
      clearInterval(interval);
    };
  }, [delay]);
};
