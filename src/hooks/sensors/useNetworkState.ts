import { useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import type {
  NetworkInfo,
  UseNetworkStateReturn,
} from "../../types/sensors.ts";
import { hasNavigator } from "../../utils/hasNavigator.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * The global Navigator object.
 */
const nav:
  | (Navigator &
      Partial<
        Record<"connection" | "mozConnection" | "webkitConnection", NetworkInfo>
      >)
  | undefined = hasNavigator() ? navigator : undefined;

/**
 * The connection information.
 */
const conn: NetworkInfo | undefined =
  nav && (nav.connection || nav.mozConnection || nav.webkitConnection);

/**
 * Gets the current state of the network.
 *
 * @param prevState The previous state of the network.
 * @returns The current state of the network.
 */
const getConnectionState = (
  prevState?: UseNetworkStateReturn
): UseNetworkStateReturn => {
  const online = nav?.onLine;
  const prevOnline = prevState?.online;

  return {
    online,
    previous: prevOnline,
    since: online !== prevOnline ? new Date() : prevState?.since,
    downlink: conn?.downlink,
    downlinkMax: conn?.downlinkMax,
    effectiveType: conn?.effectiveType,
    rtt: conn?.rtt,
    saveData: conn?.saveData,
    type: conn?.type,
  };
};

/**
 * Tracks the state of browser's network connection.
 *
 * As of the standard it is not guaranteed that browser connected to the
 * Internet, it only guarantees the network connection.
 *
 * @example
 * ```tsx
 * const state = useNetworkState();
 *
 * return (
 *   <pre>
 *     {JSON.stringify(state, null, 2)}
 *   </pre>
 * );
 * ```
 *
 * @param initialState (Optional) The initial state of the network
 * @param initialState.online (Optional) The initial value of the `online` property
 * @param initialState.previous (Optional) The initial value of the `previous` property
 * @param initialState.since (Optional) The initial value of the `since` property
 * @param initialState.downlink (Optional) The initial value of the `downlink` property
 * @param initialState.downlinkMax (Optional) The initial value of the `downlinkMax` property
 * @param initialState.effectiveType (Optional) The initial value of the `effectiveType` property
 * @param initialState.rtt (Optional) The initial value of the `rtt` property
 * @param initialState.saveData (Optional) The initial value of the `saveData` property
 * @param initialState.type (Optional) The initial value of the `type` property
 * @returns The state of the network
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useNetworkState = hasWindow()
  ? (initialState?: HookStateInitAction<UseNetworkStateReturn>) => {
      const [state, setState] = useState<UseNetworkStateReturn>(
        resolveHookState(initialState) ?? getConnectionState
      );

      useEffectOnce(() => {
        const handleStateChange = () => {
          setState(getConnectionState);
        };

        on(window, "online", handleStateChange);
        on(window, "offline", handleStateChange);

        if (conn) {
          on(conn, "change", handleStateChange);
        }

        return () => {
          off(window, "online", handleStateChange);
          off(window, "offline", handleStateChange);

          if (conn) {
            off(conn, "change", handleStateChange);
          }
        };
      });

      return state;
    }
  : (initialState?: HookStateInitAction<UseNetworkStateReturn>) => {
      warn("The `useNetworkState` hook is not supported in this environment.");
      return resolveHookState(initialState) ?? getConnectionState();
    };
