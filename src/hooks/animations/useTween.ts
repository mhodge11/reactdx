import { easing } from "../../logic/easing.ts";
import type { Easing } from "../../types/logic.ts";
import { isFunction } from "../../utils/isFunction.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";

import { useRaf } from "./useRaf.ts";

/**
 * React animation hook that tweens a number between `0` and `1`.
 *
 * For more information about easing functions you can use,
 * see: `{@link Easing}`.
 *
 * @example
 * ```tsx
 * const t = useTween("inCirc", 200, 0);
 *
 * return (
 *   <div>
 *     Tween: {t}
 *   </div>
 * );
 * ```
 *
 * @param easingName The name of the easing function to use, defined in `{@link Easing}`
 * @param ms The duration of the tween in milliseconds (Defaults to `200`)
 * @param delay The delay before the tween starts in milliseconds (Defaults to `0`)
 * @returns The tween value (between `0` and `1`)
 *
 * @category Animation
 * @since 0.0.1
 */
export const useTween = (
  easingFnName: keyof Easing = "inCirc",
  ms: number = 200,
  delay: number = 0
) => {
  const fn = easing[easingFnName];
  const t = useRaf(ms, delay);

  runOnlyIfDevMode(() => {
    if (!isFunction(fn)) {
      warn(
        `'useTween()' expected easingName property to be a valid easing function name, like: '${Object.keys(
          easing
        ).join(", ")}'.`
      );
    }
  });

  return fn(t);
};
