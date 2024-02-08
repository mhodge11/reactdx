import { useState } from "react";

import type { Observable } from "../../types/states.ts";
import { useIsomorphicLayoutEffect } from "../lifecycles/useIsomorphicLayoutEffect.ts";

/**
 * React state hook that tracks the latest value of an Observable.
 *
 * @example
 * ```tsx
 * const counter$ = new BehaviorSubject(0);
 *
 * const Component = () => {
 *   const value = useObservable(counter$, 0);
 *
 *   return (
 *     <button onClick={() => counter$.next(value + 1)}>
 *       Clicked {value} times
 *     </button>
 *   );
 * }
 * ```
 *
 * @param observable$ The observable to subscribe to
 * @param initialValue (Optional) The initial value of the observable
 * @returns The current value of the observable
 *
 * @category State
 * @since 0.0.1
 */
export function useObservable<T>(observable$: Observable<T>): T | undefined;
export function useObservable<T>(
  observable$: Observable<T>,
  initialValue: T
): T;
export function useObservable<T>(
  observable$: Observable<T>,
  initialValue?: T
): T | undefined {
  const [state, setState] = useState<T | undefined>(initialValue);

  useIsomorphicLayoutEffect(() => {
    const s = observable$.subscribe(setState);
    return () => {
      s.unsubscribe();
    };
  }, [observable$]);

  return state;
}
