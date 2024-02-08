import { useMemo, useRef } from "react";

import type { UseRafLoopReturn } from "../../types/effects.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * This hook call given function within the RAF loop without re-rendering
 * its parent component. Loop stops automatically on component unmount.
 *
 * Additionally hook provides methods to start/stop loop and
 * check current state.
 *
 * @example
 * ```tsx
 * const [ticks, setTicks] = useState(0);
 * const [lastCall, setLastCall] = useState(0);
 * const update = useUpdate();
 *
 * const [stopLoop, startLoop, isActive] = useRafLoop((time) => {
 *   setTicks(ticks => ticks + 1);
 *   setLastCall(time);
 * });
 *
 * return (
 *   <div>
 *     <div>RAF triggered: {ticks} (times)</div>
 *     <div>Last high res timestamp: {lastCall}</div>
 *     <br />
 *     <button onClick={() => {
 *       isActive() ? stopLoop() : startLoop();
 *       update();
 *     }}>{isActive() ? "STOP" : "START"}</button>
 *   </div>
 * );
 * ```
 *
 * @param callback The callback to call within the RAF loop
 * @param initiallyActive Whether the loop should be active initially
 * @returns A tuple containing the stop loop function, the start loop function and a function to check if the loop is active
 *
 * @category Effect
 * @since 0.0.1
 */
export const useRafLoop = (
  callback: FrameRequestCallback,
  initiallyActive = true
): UseRafLoopReturn => {
  const _raf = useRef<number>();
  const _active = useRef(false);
  const _callback = useRef(callback);

  _callback.current = callback;

  const result = useMemo<UseRafLoopReturn>(
    () => [
      // stop
      () => {
        if (_active.current) {
          _active.current = false;
          if (_raf.current) {
            cancelAnimationFrame(_raf.current);
          }
        }
      },
      // start
      () => {
        if (!_active.current) {
          const step: FrameRequestCallback = time => {
            if (_active.current) {
              _callback.current(time);
              _raf.current = requestAnimationFrame(step);
            }
          };

          _active.current = true;
          _raf.current = requestAnimationFrame(step);
        }
      },
      // isActive
      () => _active.current,
    ],
    []
  );

  useEffectOnce(() => {
    if (initiallyActive) {
      result[1]();
    }

    return () => {
      result[0]();
    };
  });

  return result;
};
