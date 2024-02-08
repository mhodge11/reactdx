import { useRef } from "react";

import type { UsePreviousDistinctComparator } from "../../types/states.ts";

import { useFirstMountState } from "./useFirstMountState.ts";

/**
 * Checks if two values are strictly equal.
 *
 * @param prev The previous value
 * @param next The next value
 * @returns `true` if the values are strictly equal, otherwise `false`
 */
const strictEquals = <T>(prev: T | undefined, next: T): boolean =>
  prev === next;

/**
 * Like `{@link usePrevious} but it will only update once
 * the value actually changes.
 * This is important when other hooks are involved
 * and you aren't just interested in the previous props version,
 * but want to know the previous distinct value.
 *
 * You can also provide a way of identifying the value as unique.
 * By default, a strict equals (===) is used.
 *
 * @example
 * ```tsx
 * const [count, { inc }] = useNumber(0);
 * const [otherCount, { inc: otherInc }] = useNumber(0);
 * const prevCount = usePreviousDistinct(count);
 * const otherPrevCount = usePreviousDistinct(
 *   otherCount,
 *   (prev, next) => prev === next && prev % 2 === 0,
 * )
 *
 * return (
 *   <div>
 *     <p>Now: {count}; Before: {prevCount.current}</p>
 *     <button onClick={inc}>+</button>
 *     <p>
 *       Other: {unrelatedCount};
 *       Before: {otherPrevCount.current}
 *     </p>
 *     <button onClick={otherInc}>+ (Other)</button>
 *   </div>
 * );
 * ```
 *
 * @param state The state to keep track of
 * @param predicate (Optional) The predicate function to use (Default: `===` comparison)
 * @returns A ref object containing the previous value of the state
 *
 * @category State
 * @since 0.0.1
 */
export const usePreviousDistinct = <T>(
  value: T,
  comparator: UsePreviousDistinctComparator<T> = strictEquals
): Readonly<React.MutableRefObject<T | undefined>> => {
  const firstMount = useFirstMountState();
  const prevRef = useRef<T>();
  const currRef = useRef<T>(value);

  if (!firstMount && !comparator(currRef.current, value)) {
    prevRef.current = currRef.current;
    currRef.current = value;
  }

  return prevRef;
};
