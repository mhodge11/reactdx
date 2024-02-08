import { useEffect, useRef, useState } from "react";

import type {
  ScratchState,
  UseScratchOptions,
  UseScratchReturn,
} from "../../types/sensors.ts";
import { noop } from "../../utils/noop.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { useLatest } from "../states/useLatest.ts";

/**
 * React sensor hook that tracks state of mouse "scrubs" (or "scratches").
 *
 * @example
 * ```tsx
 * const [ref, state] = useScratch();
 *
 * const blockStyle: React.CSSProperties = {
 *   position: "relative",
 *   width: 400,
 *   height: 400,
 *   border: "1px solid tomato",
 * };
 *
 * const preStyle: React.CSSProperties = {
 *   pointerEvents: "none",
 *   userSelect: "none",
 * };
 *
 * let { x = 0, y = 0, dx = 0, dy = 0 } = state;
 * if (dx < 0) [x, dx] = [x + dx, -dx];
 * if (dy < 0) [y, dy] = [y + dy, -dy];
 *
 * const rectangleStyle: React.CSSProperties = {
 *   position: "absolute",
 *   left: x,
 *   top: y,
 *   width: dx,
 *   height: dy,
 *   border: "1px solid tomato",
 *   pointerEvents: "none",
 *   userSelect: "none",
 * };
 *
 * return (
 *   <div ref={ref} style={blockStyle}>
 *     <pre style={preStyle}>
 *       {JSON.stringify(state, null, 2)}
 *     </pre>
 *     {state.isScratching && <div style={rectangleStyle} />}
 *   </div>
 * );
 * ```
 *
 * @param options (Optional) The options to pass to the scratch sensor
 * @param options.disabled (Optional) Whether the sensor is disabled (Defaults to `false`)
 * @param options.onScratch (Optional) A callback function that is called whenever the user is scratching
 * @param options.onScratchStart (Optional) A callback function that is called whenever the user starts scratching
 * @param options.onScratchEnd (Optional) A callback function that is called whenever the user stops scratching
 * @return A tuple containing the reference to the element and the state of the sensor
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useScratch = (
  options: UseScratchOptions = {}
): UseScratchReturn => {
  const { disabled } = options || {};
  const optionsRef = useLatest(options);

  const [state, setState] = useState<ScratchState>({
    isScratching: false,
  });
  const [el, setEl] = useState<HTMLElement | null>(null);

  const _state = useRef(state);
  const _isScratching = useRef(false);
  const _animationFrame = useRef<number | null>(null);

  useEffect(() => {
    if (disabled || !el) {
      return;
    }

    const onMoveEvent = (docX: number, docY: number) => {
      if (_animationFrame.current != null) {
        cancelAnimationFrame(_animationFrame.current);
      }

      _animationFrame.current = requestAnimationFrame(() => {
        const { left, top } = el.getBoundingClientRect();
        const elX = left + window.scrollX;
        const elY = top + window.scrollY;
        const x = docX - elX;
        const y = docY - elY;

        setState(oldState => {
          const newState = {
            ...oldState,
            dx: x - (oldState.x || 0),
            dy: y - (oldState.y || 0),
            end: Date.now(),
            isScratching: true,
          };

          _state.current = newState;

          (optionsRef.current.onScratch || noop)(newState);

          return newState;
        });
      });
    };

    const onMouseMove = (event: MouseEvent) => {
      onMoveEvent(event.pageX, event.pageY);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (touch) {
        onMoveEvent(touch.pageX, touch.pageY);
      }
    };

    const stopScratching = () => {
      if (!_isScratching.current) {
        return;
      }

      _isScratching.current = false;
      _state.current = { ..._state.current, isScratching: false };

      (optionsRef.current.onScratchEnd || noop)(_state.current);

      setState({ isScratching: false });

      off(window, "mousemove", onMouseMove);
      off(window, "touchmove", onTouchMove);
      off(window, "mouseup", onMouseUp);
      off(window, "touchend", onTouchEnd);
    };

    const onMouseUp = stopScratching;
    const onTouchEnd = stopScratching;

    const startScratching = (docX: number, docY: number) => {
      if (!_isScratching.current) {
        return;
      }

      const { left, top } = el.getBoundingClientRect();
      const elX = left + window.scrollX;
      const elY = top + window.scrollY;
      const x = docX - elX;
      const y = docY - elY;
      const time = Date.now();
      const newState = {
        isScratching: true,
        start: time,
        end: time,
        docX,
        docY,
        x,
        y,
        dx: 0,
        dy: 0,
        elH: el.offsetHeight,
        elW: el.offsetWidth,
        elX,
        elY,
      };

      _state.current = newState;

      (optionsRef.current.onScratchStart || noop)(newState);

      setState(newState);

      on(window, "mousemove", onMouseMove);
      on(window, "touchmove", onTouchMove);
      on(window, "mouseup", onMouseUp);
      on(window, "touchend", onTouchEnd);
    };

    const onMouseDown = (event: MouseEvent) => {
      _isScratching.current = true;

      startScratching(event.pageX, event.pageY);
    };

    const onTouchStart = (event: TouchEvent) => {
      _isScratching.current = true;

      const touch = event.changedTouches[0];
      if (touch) {
        startScratching(touch.pageX, touch.pageY);
      }
    };

    on(el, "mousedown", onMouseDown);
    on(el, "touchstart", onTouchStart);

    return () => {
      off(el, "mousedown", onMouseDown);
      off(el, "touchstart", onTouchStart);
      off(window, "mousemove", onMouseMove);
      off(window, "touchmove", onTouchMove);
      off(window, "mouseup", onMouseUp);
      off(window, "touchend", onTouchEnd);

      if (_animationFrame.current) {
        cancelAnimationFrame(_animationFrame.current);
      }

      _animationFrame.current = null;

      _isScratching.current = false;
      _state.current = { isScratching: false };

      setState(_state.current);
    };
  }, [el, disabled, optionsRef]);

  return [setEl, state];
};
