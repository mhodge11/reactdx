import { useRef, useState } from "react";

import type {
  BatteryManager,
  NavigatorWithBatteryAPI,
  UseBatteryReturn,
} from "../../types/sensors.ts";
import { deepEqual } from "../../utils/deepEqual.ts";
import { hasNavigator } from "../../utils/hasNavigator.ts";
import { isFunction } from "../../utils/isFunction.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * Checks if the `navigator.getBattery` API is supported.
 *
 * @returns `true` if the `navigator.getBattery` API is supported, `false` otherwise
 */
const isBatteryApiSupported = () =>
  hasNavigator() &&
  "getBattery" in navigator &&
  isFunction(navigator.getBattery);

/**
 * React sensor hook that tracks battery status.
 *
 * The battery status is returned as a `BatteryState` object:
 * - **`isSupported: boolean`** - Whether the battery API is supported.
 * - **`fetched: boolean`** - Whether the battery API has been fetched.
 * - **`charging: boolean`** - Whether the device is currently charging.
 * - **`chargingTime: number`** - The amount of time until full charge (in seconds).
 * - **`dischargingTime: number`** - The amount of time until discharge (in seconds).
 * - **`level: number`** - The battery level (between 0 and 1).
 *
 * ***Note:** Current `BatteryManager API` state is obsolete.
 * Although it may still work in some browsers, its use is discouraged
 * since it could be removed at any time. It is currently supported in Chrome,
 * Edge, Opera, Chrome Android, Opera Android, Samsung Internet,
 * and WebView Android as of February 1, 2024.*
 *
 * **Explanation**
 *
 * The `BatteryManager API` is a new API that allows web developers to
 * monitor the battery status of the hosting device. It exposes information
 * about the battery charge level, the device's charging status, and allows
 * you to be notified by events whenever any of these properties change.
 *
 * @example
 * ```tsx
 * const batteryState = useBattery();
 *
 * if (!batteryState.isSupported)
 *   return (
 *     <div>
 *       <strong>Battery sensor</strong>: <span>not supported</span>
 *     </div>
 *   );
 *
 * if (!batteryState.fetched)
 *   return (
 *     <div>
 *       <strong>Battery sensor</strong>: <span>supported</span> <br />
 *       <strong>Battery state</strong>: <span>fetching</span>
 *     </div>
 *   );
 *
 * return (
 *   <div>
 *     <strong>Battery sensor</strong>:&nbsp;&nbsp; <span>supported</span> <br />
 *     <strong>Battery state</strong>: <span>fetched</span> <br />
 *     <strong>Charge level</strong>:&nbsp;&nbsp; <span>{(batteryState.level * 100).toFixed(0)}%</span> <br />
 *     <strong>Charging</strong>:&nbsp;&nbsp; <span>{batteryState.charging ? "yes" : "no"}</span> <br />
 *     <strong>Charging time</strong>:&nbsp;&nbsp;
 *     <span>{batteryState.chargingTime ? batteryState.chargingTime : "finished"}</span> <br />
 *     <strong>Discharging time</strong>:&nbsp;&nbsp; <span>{batteryState.dischargingTime}</span>
 *   </div>
 * );
 * ```
 *
 * @returns The battery state
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useBattery = isBatteryApiSupported()
  ? (): UseBatteryReturn => {
      const [state, setState] = useState<UseBatteryReturn>({
        isSupported: true,
        fetched: false,
      });

      const _state = useRef(state);
      _state.current = state;

      useEffectOnce(() => {
        let mounted = true;
        let battery: BatteryManager | null = null;

        const handleChange = () => {
          if (!mounted || !battery) {
            return;
          }

          const newState: UseBatteryReturn = {
            isSupported: true,
            fetched: true,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
            level: battery.level,
          };

          if (!deepEqual(newState, _state.current)) {
            setState(newState);
          }
        };

        (navigator as NavigatorWithBatteryAPI).getBattery?.().then(b => {
          if (!mounted) {
            return;
          }

          battery = b;

          on(battery, "chargingchange", handleChange);
          on(battery, "chargingtimechange", handleChange);
          on(battery, "dischargingtimechange", handleChange);
          on(battery, "levelchange", handleChange);

          handleChange();
        });

        return () => {
          mounted = false;

          if (battery) {
            off(battery, "chargingchange", handleChange);
            off(battery, "chargingtimechange", handleChange);
            off(battery, "dischargingtimechange", handleChange);
            off(battery, "levelchange", handleChange);
          }
        };
      });

      return state;
    }
  : (): UseBatteryReturn => {
      warn("Battery API not supported in this environment");
      return {
        isSupported: false,
      };
    };
