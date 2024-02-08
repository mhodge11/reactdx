import { useRef, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import type { UseOrientationReturn } from "../../types/sensors.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { isNumber } from "../../utils/isNumber.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * The default state of the orientation sensor.
 */
const defaultState: UseOrientationReturn = {
  angle: hasWindow()
    ? window?.screen?.orientation?.angle ?? window?.orientation ?? 0
    : 0,
  type: hasWindow()
    ? window?.screen?.orientation?.type ?? "landscape-primary"
    : "landscape-primary",
};

/**
 * React sensor hook to track the orientation of the device.
 *
 * @example
 * ```tsx
 * const state = useOrientation();
 *
 * return (
 *   <pre>
 *     {JSON.stringify(state, null, 2)}
 *   </pre>
 * );
 * ```
 *
 * @param initialState (Optional) The initial state of the orientation sensor
 * @param initialState.angle (Optional) The initial value of the `angle` property
 * @param initialState.type (Optional) The initial value of the `type` property (one of `"landscape-primary" | "landscape-secondary" | "portrait-primary" | "portrait-secondary"`)
 * @returns The state of the orientation sensor
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useOrientation = hasWindow()
  ? (
      initialState: HookStateInitAction<UseOrientationReturn> = defaultState
    ): UseOrientationReturn => {
      const resolvedInitialState = resolveHookState(initialState);
      const [state, setState] = useState(resolvedInitialState);

      const _initialState = useRef(resolvedInitialState);

      useEffectOnce(() => {
        let mounted = true;

        const onChange = () => {
          if (!mounted) {
            return;
          }

          if (window.screen.orientation) {
            setState({
              angle: window.screen.orientation.angle,
              type: window.screen.orientation.type,
            });
          } else if (window.orientation) {
            setState({
              angle: isNumber(window.orientation) ? window.orientation : 0,
              type: "",
            });
          } else {
            setState(_initialState.current);
          }
        };

        on(window, "orientationchange", onChange);
        onChange();

        return () => {
          mounted = false;
          off(window, "orientationchange", onChange);
        };
      });

      return state;
    }
  : (
      initialState: HookStateInitAction<UseOrientationReturn> = defaultState
    ): UseOrientationReturn => {
      const resolvedInitialState = resolveHookState(initialState);
      warn("`useOrientation` is not supported on server side", {
        initialState,
      });
      return resolvedInitialState;
    };
