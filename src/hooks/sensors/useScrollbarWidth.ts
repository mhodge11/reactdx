import { useState } from "react";

import { scrollbarWidth } from "../../logic/scrollbarWidth.ts";
import { isUndefined } from "../../utils/isUndefined.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * React sensor hook that tracks the width of the scrollbar.
 *
 * In case hook been called before DOM ready, it will return
 * `undefined` and will cause re-render on first available RAF.
 *
 * ***Note:** This function will always return `0` on mobile browsers,
 * as mobile browsers do not have a visible scrollbar.*
 *
 * @example
 * ```tsx
 * const sbw = useScrollbarWidth();
 *
 * return (
 *   <div>
 *     {sbw === undefined
 *       ? "DOM is not ready yet, SBW detection delayed"
 *       : `The scrollbar width is ${sbw}px`
 *     }
 *   </div>
 * );
 * ```
 *
 * @returns The width of the scrollbar in pixels, or `undefined` if the DOM is not ready
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useScrollbarWidth = (): number | undefined => {
  const [sbw, setSbw] = useState<number | undefined>(scrollbarWidth());

  // this needed to ensure the scrollbar width in case hook called before the DOM is ready
  useEffectOnce(() => {
    if (!isUndefined(sbw)) {
      return;
    }

    const raf = requestAnimationFrame(() => {
      setSbw(scrollbarWidth());
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  });

  return sbw;
};
