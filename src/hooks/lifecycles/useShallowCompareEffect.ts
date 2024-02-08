import type { ArrayMinLength } from "../../types/utils.ts";
import { isPrimitive } from "../../utils/isPrimitive.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { shallowEqual } from "../../utils/shallowEqual.ts";
import { warn } from "../../utils/warn.ts";

import { useCustomCompareEffect } from "./useCustomCompareEffect.ts";

/**
 * Checks if the dependencies are different using shallow comparison.
 *
 * @param prevDeps The previous dependencies to compare
 * @param nextDeps The next dependencies to compare
 * @returns `true` if the dependencies are different, `false` otherwise
 */
const comparator = <TDeps extends React.DependencyList>(
  prevDeps: React.DependencyList,
  nextDeps: TDeps
): prevDeps is TDeps =>
  prevDeps.every((dep, index) => shallowEqual(dep, nextDeps[index]));

/**
 * A modified useEffect hook that is using shallow comparison
 * on each of its dependencies instead of reference equality.
 *
 * If you would like to use basic deep comparison,
 * check out `{@link useDeepCompareEffect}`.
 *
 * If you would like to use a custom comparator,
 * check out `{@link useCustomCompareEffect}`.
 *
 * @example
 * ```tsx
 * const [count, { inc: inc }] = useNumber(0);
 * const options = { step: 2 };
 *
 * useShallowCompareEffect(() => {
 *   inc(options.step)
 * }, [options]);
 * ```
 *
 * @param effect The effect to run when deps change
 * @param deps The dependencies to watch for changes
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useShallowCompareEffect = (
  effect: React.EffectCallback,
  deps: ArrayMinLength<React.DependencyList, 1>
): void => {
  runOnlyIfDevMode(() => {
    if (!Array.isArray(deps) || !deps.length) {
      warn(
        "`useShallowCompareEffect` should not be used with no dependencies. Use React.useEffect instead."
      );
    }

    if (deps.every(isPrimitive)) {
      warn(
        "`useShallowCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead."
      );
    }
  });

  useCustomCompareEffect(effect, deps, comparator);
};
