import { useRef } from "react";

/**
 * React state hook that returns the latest state
 * as described in the [React hooks FAQ](https://legacy.reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function).
 *
 * This is mostly useful to get access to the latest value
 * of some props or state inside an asynchronous callback,
 * instead of that value at the time the callback was created from.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const latestCount = useLatest(count);
 *
 * const handleAlertClick = () => {
 *   setTimeout(() => {
 *     alert(`You clicked on: ${latestCount.current}`);
 *   }, 3000)
 * }
 *
 * return (
 *   <div>
 *     <p>Clicked {count} times</p>
 *     <button onClick={() => setCount(count + 1)}>
 *       Click me
 *     </button>
 *     <button onClick={handleAlertClick}>
 *       Show alert
 *     </button>
 *   </div>
 * )
 * ```
 *
 * @param state The state to keep track of
 * @returns A ref object containing the latest value of `state`
 *
 * @category State
 * @since 0.0.1
 */
export const useLatest = <T>(value: T): Readonly<React.MutableRefObject<T>> => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};
