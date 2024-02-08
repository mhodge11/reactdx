import { useState } from "react";

import type { UseMediaDevicesReturn } from "../../types/sensors.ts";
import { hasNavigator } from "../../utils/hasNavigator.ts";
import { noop } from "../../utils/noop.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * React sensor hook that tracks connected media devices.
 *
 * Returns an object with the device IDs as keys and the device
 * information as values.
 *
 * *Available only in secure contexts.*
 *
 * @example
 * ```tsx
 * const state = useMediaDevices();
 *
 * return (
 *   <pre>
 *     {JSON.stringify(state, null, 2)}
 *   </pre>
 * );
 * ```
 *
 * @returns The connected media devices
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useMediaDevices = hasNavigator
  ? (): UseMediaDevicesReturn => {
      const [state, setState] = useState<UseMediaDevicesReturn>({});

      useEffectOnce(() => {
        let mounted = true;

        const onChange = () => {
          navigator.mediaDevices
            .enumerateDevices()
            .then(devices => {
              if (!mounted) {
                return;
              }

              const mediaDevices: UseMediaDevicesReturn = {};
              for (const device of devices) {
                mediaDevices[device.deviceId] = device;
              }

              setState(mediaDevices);
            })
            .catch(noop);
        };

        on(navigator.mediaDevices, "devicechange", onChange);
        onChange();

        return () => {
          mounted = false;
          off(navigator.mediaDevices, "devicechange", onChange);
        };
      });

      return state;
    }
  : (): UseMediaDevicesReturn => {
      warn("The `useMediaDevices` hook is not supported in this environment.");
      return {};
    };
