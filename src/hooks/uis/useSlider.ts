import { useEffect, useRef } from "react";

import type { UseSliderOptions, UseSliderReturn } from "../../types/uis.ts";
import { hasDocument } from "../../utils/hasDocument.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useSetState } from "../states/useSetState.ts";

/**
 * React UI hook that provides slide behavior over any HTML element.
 * Supports both mouse and touch events.
 *
 * @example
 * ```tsx
 * const ref = useRef(null);
 * const { isSliding, value } = useSlider(ref);
 *
 * return (
 *   <div>
 *     <div ref={ref} style={{ position: 'relative' }}>
 *       <p
 *         style={{
 *           textAlign: 'center',
 *           color: isSliding ? 'red' : 'green'
 *         }}
 *       >
 *         {Math.round(value * 100)}%
 *       </p>
 *     </div>
 *   </div>
 * )
 * ```
 *
 * @param ref The ref of the element to use as the slider
 * @param options (Optional) The options for the slider
 * @param options.onScrub (Optional) Callback for when the slider is scrubbed
 * @param options.onScrubStart (Optional) Callback for when the slider starts being scrubbed
 * @param options.onScrubEnd (Optional) Callback for when the slider stops being scrubbed
 * @param options.reverse (Optional) Whether the slider is reversed
 * @param options.styles (Optional) Whether or not to remove the default `userSelect` styles (Defaults to true)
 * @param options.vertical (Optional) Whether the slider is vertical
 * @returns The state of the slider, including whether the slider is currently being scrubbed and the current value of the slider (between 0 and 1)
 *
 * @category UI
 * @since 0.0.1
 */
export const useSlider = hasDocument()
  ? (ref: React.RefObject<HTMLElement>, options: UseSliderOptions = {}) => {
      const [state, setState] = useSetState<UseSliderReturn>({
        isSliding: false,
        value: 0,
      });

      const _isSliding = useRef(false);
      const _value = useRef(0);
      const _frame = useRef(0);

      _value.current = state.value;

      useEffect(() => {
        let mounted = true;
        const el = ref.current;
        const styles = options.styles === undefined;
        const reverse = options.reverse === undefined;

        if (el && styles) {
          el.style.userSelect = "none";
        }

        const startScrubbing = () => {
          if (_isSliding.current || !mounted) {
            return;
          }

          options.onScrubStart?.();
          _isSliding.current = true;

          setState({ isSliding: true });

          bindEvents();
        };

        const stopScrubbing = () => {
          if (!_isSliding.current || !mounted) {
            return;
          }

          options.onScrubEnd?.(_value.current);
          _isSliding.current = false;

          setState({ isSliding: false });

          unbindEvents();
        };

        const onMouseDown = (event: MouseEvent) => {
          startScrubbing();
          onMouseMove(event);
        };

        const onMouseMove = (event: MouseEvent) => {
          onScrub(event[options.vertical ? "clientY" : "clientX"]);
        };

        const onTouchStart = (event: TouchEvent) => {
          startScrubbing();
          onTouchMove(event);
        };

        const onTouchMove = (event: TouchEvent) => {
          const touch = event.changedTouches[0];
          if (touch) {
            onScrub(touch[options.vertical ? "clientY" : "clientX"]);
          }
        };

        const bindEvents = () => {
          on(document, "mousemove", onMouseMove);
          on(document, "mouseup", stopScrubbing);

          on(document, "touchmove", onTouchMove);
          on(document, "touchend", stopScrubbing);
        };

        const unbindEvents = () => {
          off(document, "mousemove", onMouseMove);
          off(document, "mouseup", stopScrubbing);

          off(document, "touchmove", onTouchMove);
          off(document, "touchend", stopScrubbing);
        };

        const onScrub = (clientXY: number) => {
          if (_frame.current) {
            cancelAnimationFrame(_frame.current);
          }

          _frame.current = requestAnimationFrame(() => {
            if (!el || !mounted) {
              return;
            }

            const rect = el.getBoundingClientRect();
            const pos = options.vertical ? rect.top : rect.left;
            const length = options.vertical ? rect.height : rect.width;

            // Prevent returning 0 when element is hidden by CSS
            if (!length) {
              return;
            }

            let value = (clientXY - pos) / length;

            if (value > 1) {
              value = 1;
            } else if (value < 0) {
              value = 0;
            }

            if (reverse) {
              value = 1 - value;
            }

            setState({ value });

            options.onScrub?.(value);
          });
        };

        on(el, "mousedown", onMouseDown);
        on(el, "touchstart", onTouchStart);

        return () => {
          mounted = false;
          off(el, "mousedown", onMouseDown);
          off(el, "touchstart", onTouchStart);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [
        ref,
        options.vertical,
        options.reverse,
        options.styles,
        options.onScrub,
        options.onScrubStart,
        options.onScrubEnd,
      ]);

      return state;
    }
  : (
      ref: React.RefObject<HTMLElement>,
      options: UseSliderOptions = {}
    ): UseSliderReturn => {
      warn("`useSlider` is not supported in this environment.", {
        ref,
        options,
      });
      return { isSliding: false, value: 0 };
    };
