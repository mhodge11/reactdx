import { useEffect, useRef } from "react";

/**
 * React state hook that returns the previous state
 * as described in the [React hooks FAQ](https://legacy.reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state).
 *
 * This is mostly useful to get access to the previous value
 * to compare with the current value inside a `useEffect` callback,
 * instead of that value at the time the callback was created from.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 *
 * return (
 *   <div>
 *     <p>Now: {count}; Before: {prevCount.current}</p>
 *     <button onClick={() => setCount(count + 1)}>+</button>
 *     <button onClick={() => setCount(count - 1)}>-</button>
 *   </div>
 * )
 * ```
 *
 * @param state The state to track the previous value of
 * @returns A ref object containing the previous value of the state
 *
 * @category State
 * @since 0.0.1
 */
export const usePrevious = <T>(
  value: T
): Readonly<React.MutableRefObject<T>> => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
};
