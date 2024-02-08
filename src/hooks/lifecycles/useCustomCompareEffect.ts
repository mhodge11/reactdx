import { useEffect, useRef } from "react";

import type { ArrayMinLength } from "../../types/utils.ts";
import { isFunction } from "../../utils/isFunction.ts";
import { isPrimitive } from "../../utils/isPrimitive.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";

/**
 * A modified useEffect hook that accepts a comparator
 * which is used for comparison on dependencies instead
 * of reference equality.
 *
 * If you would like to use basic deep comparison,
 * check out `{@link useDeepCompareEffect}`.
 *
 * If you would like to use basic shallow comparison,
 * check out `{@link useShallowCompareEffect}`.
 *
 * @example
 * ```tsx
 * const [count, { inc: inc }] = useNumber(0);
 * const options = { step: 2 };
 *
 * useCustomCompareEffect(
 *   () => {
 *     inc(options.step)
 *   },
 *   [options],
 *   (prevDeps, nextDeps) => isEqual(prevDeps, nextDeps)
 * );
 * ```
 *
 * @param effect The effect to run when deps change
 * @param deps The dependencies to watch for changes
 * @param comparator The function to use to compare previous and next deps
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useCustomCompareEffect = <
  TDeps extends ArrayMinLength<React.DependencyList, 1>,
>(
  effect: React.EffectCallback,
  deps: TDeps,
  comparator: <TNextDeps extends TDeps>(
    prevDeps: TDeps,
    nextDeps: TNextDeps
  ) => prevDeps is TNextDeps
): void => {
  runOnlyIfDevMode(() => {
    if (!Array.isArray(deps) || !deps.length) {
      warn(
        "`useCustomCompareEffect` should not be used with no dependencies. Use React.useEffect instead."
      );
    }

    if (deps.every(isPrimitive)) {
      warn(
        "`useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead."
      );
    }

    if (!isFunction(comparator)) {
      warn(
        "`useCustomCompareEffect` should be used with depsEqual callback for comparing deps list"
      );
    }
  });

  const ref = useRef<TDeps>();

  if (!ref.current || !comparator(ref.current, deps)) {
    ref.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, ref.current);
};
