import { useCallback, useRef } from "react";

import type {
  UseLongPressOptions,
  UseLongPressReturn,
} from "../../types/sensors.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";

/**
 * Checks if an event is a touch event.
 *
 * @param event The event to check
 * @returns `true` if the event is a touch event, otherwise `false`
 */
const isTouchEvent = (event: Event): event is TouchEvent => "touches" in event;

/**
 * Prevents the default action of an `event` if the `event` is a
 * `TouchEvent` and if the event has only one touch
 *
 * @param event The event to prevent the default action of
 */
const preventDefault = (event: Event) => {
  if (!isTouchEvent(event)) {
    return;
  }

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};

/**
 * React sensor hook that fires a callback after long pressing.
 *
 * @example
 * ```tsx
 * const onLongPress = () => {
 *   console.log("calls callback after long pressing 300ms");
 * };
 *
 * const defaultOptions = {
 *   isPreventDefault: true,
 *   delay: 300,
 * };
 *
 * const longPressEvent = useLongPress(
 *   onLongPress,
 *   defaultOptions
 * );
 *
 * return (
 *   <button {...longPressEvent}>
 *     useLongPress
 *   </button>
 * );
 * ```
 *
 * @param callback The long press event callback
 * @param options (Optional) The long press event options
 * @param options.isPreventDefault (Optional) Whether to prevent the default action of the event. This prevents ghost click on mobile devices. (Defaults to `true`)
 * @param options.delay (Optional) The delay in milliseconds before the press is considered a long press. (Defaults to `300`)
 * @returns The long press event handlers
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useLongPress = (
  callback: (event: TouchEvent | MouseEvent) => void,
  options: UseLongPressOptions = {}
): UseLongPressReturn => {
  const { isPreventDefault = true, delay = 300 } = options || {};
  const _timeout = useRef<ReturnType<typeof setTimeout>>();
  const _target = useRef<EventTarget>();
  const _callback = useRef(callback);

  _callback.current = callback;

  const start = useCallback(
    (event: TouchEvent | MouseEvent) => {
      // Prevent ghost click on mobile devices
      if (isPreventDefault && event.target) {
        on(event.target, "touchend", preventDefault, { passive: false });
        _target.current = event.target;
      }

      _timeout.current = setTimeout(() => _callback.current(event), delay);
    },
    [delay, isPreventDefault]
  );

  const clear = useCallback(() => {
    // clearTimeout and removeEventListener
    clearTimeout(_timeout.current);

    if (isPreventDefault && _target.current) {
      off(_target.current, "touchend", preventDefault);
    }
  }, [isPreventDefault]);

  return {
    onMouseDown: (event: MouseEvent) => start(event),
    onTouchStart: (event: TouchEvent) => start(event),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
  };
};
