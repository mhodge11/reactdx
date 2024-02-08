import { useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycles/useIsomorphicLayoutEffect.ts";

/**
 * React animation hook that forces component to re-render on
 * each `requestAnimationFrame`.
 *
 * Returns the percentage of the time elapsed.
 *
 * @example
 * ```tsx
 * const elapsed = useRaf(5000, 1000);
 *
 * return (
 *   <div>
 *     Elapsed: {elapsed}
 *   </div>
 * );
 * ```
 *
 * @param ms The duration of the animation in milliseconds (Defaults to 1e12)
 * @param delay The delay before the animation starts in milliseconds (Defaults to 0)
 * @returns The percentage of the time elapsed
 *
 * @category Animation
 * @since 0.0.1
 */
export const useRaf = (ms: number = 1e12, delay: number = 0): number => {
  const [elapsed, setElapsed] = useState(0);

  useIsomorphicLayoutEffect(() => {
    let raf: number;
    let timerStop: ReturnType<typeof setTimeout>;
    let start: number;

    const onFrame = () => {
      const time = Math.min(1, (Date.now() - start) / ms);
      setElapsed(time);

      loop();
    };

    const loop = () => {
      raf = requestAnimationFrame(onFrame);
    };

    const onStart = () => {
      timerStop = setTimeout(() => {
        cancelAnimationFrame(raf);
        setElapsed(1);
      }, ms);

      start = Date.now();

      loop();
    };

    const timerDelay = setTimeout(onStart, delay);

    return () => {
      clearTimeout(timerStop);
      clearTimeout(timerDelay);
      cancelAnimationFrame(raf);
    };
  }, [ms, delay]);

  return elapsed;
};
