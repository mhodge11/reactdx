import React from "react";

import type { ArrayMinLength } from "../../types/utils.ts";
import { deepEqual } from "../../utils/deepEqual.ts";
import { isPrimitive } from "../../utils/isPrimitive.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";

import { useCustomCompareEffect } from "./useCustomCompareEffect.ts";

/**
 * A modified useEffect hook that is using deep comparison
 * on its dependencies instead of reference equality.
 *
 * If you would like to use basic shallow comparison,
 * check out `{@link useShallowCompareEffect}`.
 *
 * If you would like to use a custom comparator,
 * check out `{@link useCustomCompareEffect}`.
 *
 * @example
 * ```tsx
 * const [count, { inc: inc }] = useNumber(0);
 * const options = { step: 2 };
 *
 * useDeepCompareEffect(() => {
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
export const useDeepCompareEffect = (
  effect: React.EffectCallback,
  deps: ArrayMinLength<React.DependencyList, 1>
): void => {
  runOnlyIfDevMode(() => {
    if (!Array.isArray(deps) || !deps.length) {
      warn(
        "`useDeepCompareEffect` should not be used with no dependencies. Use React.useEffect instead."
      );
    }

    if (deps.every(isPrimitive)) {
      warn(
        "`useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead."
      );
    }
  });

  useCustomCompareEffect(effect, deps, deepEqual);
};
