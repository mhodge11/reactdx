import { useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import type { UseMotionReturn } from "../../types/sensors.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * The default initial state of the motion sensor.
 */
const defaultState: UseMotionReturn = {
  acceleration: { x: null, y: null, z: null },
  accelerationIncludingGravity: { x: null, y: null, z: null },
  rotationRate: { alpha: null, beta: null, gamma: null },
  interval: 16,
};

/**
 * React sensor hook that uses the device's acceleration sensor
 * to track its motions.
 *
 * Extends the `DeviceMotionEvent`, which provides web developers with
 * information about the speed of changes for the device's
 * position and orientation.
 *
 * **Warning:** Currently, Firefox and Chrome do not handle the coordinates
 * the same way. Take care about this while using them.
 *
 * *Available only in secure contexts.*
 *
 * @example
 * ```tsx
 * const state = useMotion();
 *
 * return (
 *   <pre>
 *     {JSON.stringify(state, null, 2)}
 *   </pre>
 * );
 * ```
 *
 * @param initialState The initial state of the motion sensor
 * @returns The state of the motion sensor
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useMotion = hasWindow()
  ? (
      initialState: HookStateInitAction<UseMotionReturn> = defaultState
    ): UseMotionReturn => {
      const [state, setState] = useState(resolveHookState(initialState));

      useEffectOnce(() => {
        const handler = (event: DeviceMotionEvent) => {
          const {
            acceleration,
            accelerationIncludingGravity,
            rotationRate,
            interval,
          } = event;

          setState({
            acceleration: {
              x: acceleration?.x ?? null,
              y: acceleration?.y ?? null,
              z: acceleration?.z ?? null,
            },
            accelerationIncludingGravity: {
              x: accelerationIncludingGravity?.x ?? null,
              y: accelerationIncludingGravity?.y ?? null,
              z: accelerationIncludingGravity?.z ?? null,
            },
            rotationRate: {
              alpha: rotationRate?.alpha ?? null,
              beta: rotationRate?.beta ?? null,
              gamma: rotationRate?.gamma ?? null,
            },
            interval,
          });
        };

        on(window, "devicemotion", handler);

        return () => {
          off(window, "devicemotion", handler);
        };
      });

      return state;
    }
  : (
      initialState: HookStateInitAction<UseMotionReturn> = defaultState
    ): UseMotionReturn => {
      warn("The `useMotion` hook is not supported in this environment.");
      return resolveHookState(initialState);
    };
