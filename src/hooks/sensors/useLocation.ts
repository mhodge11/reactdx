import { useEffect, useState } from "react";

import type {
  PatchedHistoryMethodName,
  UseLocationReturn,
} from "../../types/sensors.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { isFunction } from "../../utils/isFunction.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";

/**
 * Builds the state of the location sensor.
 *
 * @param trigger The trigger that caused the state to change ("load" | "popstate" | "pushstate" | "replacestate")
 * @returns The state of the location sensor
 */
const buildState = (
  trigger: UseLocationReturn["trigger"]
): UseLocationReturn => {
  const { state, length } = window.history;

  const {
    hash,
    host,
    hostname,
    href,
    origin,
    pathname,
    port,
    protocol,
    search,
  } = window.location;

  return {
    trigger,
    state,
    length,
    hash,
    host,
    hostname,
    href,
    origin,
    pathname,
    port,
    protocol,
    search,
  };
};

/**
 * Patches the history API method to dispatch an event.
 *
 * @param methodName The name of the history API method to patch
 */
const patchHistoryMethod = (methodName: PatchedHistoryMethodName): void => {
  const history = window.history;
  const original = history[methodName];

  history[methodName] = function (
    this: History,
    ...state: Parameters<History[typeof methodName]>
  ) {
    const result = original.apply(this, state);
    const event = new Event(methodName.toLowerCase());

    (event as any).state = state;

    window.dispatchEvent(event);

    return result;
  };
};

let isHistoryPatched = false;

/**
 * Test if the Event constructor is available.
 * This is used to determine if the location sensor is available.
 */
const isLocationApiAvailable = () => {
  const isAvailable = hasWindow() && isFunction(Event);

  if (isAvailable && !isHistoryPatched) {
    patchHistoryMethod("pushState");
    patchHistoryMethod("replaceState");
    isHistoryPatched = true;
  }

  return isAvailable;
};

/**
 * React sensor hook that tracks brower's location.
 * Uses the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History).
 *
 * ***Note:** The location sensor will not work in IE 11 or lower.
 * To use it in Internet Explorer,
 * you will need a [polyfill](https://stackoverflow.com/questions/26596123/internet-explorer-9-10-11-event-constructor-doesnt-work)
 * for the `window.Event` constructor.*
 *
 * @example
 * ```tsx
 * const state = useLocation();
 *
 * return (
 *   <pre>
 *     {JSON.stringify(state, null, 2)}
 *   </pre>
 * );
 * ```
 *
 * @returns The state of the location sensor
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useLocation = isLocationApiAvailable()
  ? (): UseLocationReturn => {
      const [state, setState] = useState(buildState("load"));

      useEffect(() => {
        const onPopstate = () => setState(buildState("popstate"));
        const onPushstate = () => setState(buildState("pushstate"));
        const onReplacestate = () => setState(buildState("replacestate"));

        on(window, "popstate", onPopstate);
        on(window, "pushstate", onPushstate);
        on(window, "replacestate", onReplacestate);

        return () => {
          off(window, "popstate", onPopstate);
          off(window, "pushstate", onPushstate);
          off(window, "replacestate", onReplacestate);
        };
      }, []);

      return state;
    }
  : (): UseLocationReturn => {
      warn(
        "`useLocation` is not supported when no global `window` object exists."
      );
      return {
        trigger: "load",
      };
    };
