import { useMemo, useState } from "react";

import type { UseMeasureRect, UseMeasureReturn } from "../../types/sensors.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { noop } from "../../utils/noop.ts";
import { warn } from "../../utils/warn.ts";
import { useIsomorphicLayoutEffect } from "../lifecycles/useIsomorphicLayoutEffect.ts";

/**
 * The default rect of the measure sensor.
 */
const defaultRect: UseMeasureRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

/**
 * Checks if the [Resize Observer API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) is supported.
 *
 * @returns `true` if the [Resize Observer API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) is supported, otherwise `false`
 */
const isMeasureApiSupported = () =>
  hasWindow() && typeof window.ResizeObserver !== "undefined";

/**
 * React sensor hook that tracks dimensions of an HTML element
 * using the [Resize Observer API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
 *
 * If you want to support legacy browsers, consider installing the
 * [resize-observer-polyfill](https://www.npmjs.com/package/resize-observer-polyfill)
 * before running your app.
 *
 * @example
 * ```tsx
 * const [ref, state] = useMeasure();
 *
 * return (
 *   <div ref={ref}>
 *     <div>x: {x}</div>
 *     <div>y: {y}</div>
 *     <div>width: {width}</div>
 *     <div>height: {height}</div>
 *     <div>top: {top}</div>
 *     <div>right: {right}</div>
 *     <div>bottom: {bottom}</div>
 *     <div>left: {left}</div>
 *   </div>
 * );
 * ```
 *
 * @returns A tuple containing the element reference callback and the state of the element rect.
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useMeasure = isMeasureApiSupported()
  ? <TElement extends Element = Element>(): UseMeasureReturn<TElement> => {
      const [element, ref] = useState<TElement | null>(null);
      const [rect, setRect] = useState<UseMeasureRect>(defaultRect);

      const observer = useMemo(
        () =>
          new window.ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
              const { x, y, width, height, top, left, bottom, right } =
                entry.contentRect;
              setRect({ x, y, width, height, top, left, bottom, right });
            }
          }),
        []
      );

      useIsomorphicLayoutEffect(() => {
        if (!element) {
          return;
        }

        observer.observe(element);

        return () => {
          observer.disconnect();
        };
      });

      return [ref, rect];
    }
  : <TElement extends Element = Element>(): UseMeasureReturn<TElement> => {
      warn(
        "`useMeasure` is not supported when no global `window` object exists."
      );
      return [noop, defaultRect];
    };
