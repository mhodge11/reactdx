import { useEffect, useRef, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import { isWeb } from "../../utils/isWeb.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { throttle } from "../../utils/throttle.ts";
import { warn } from "../../utils/warn.ts";

/**
 * Default events that reset the idle state.
 */
const defaultEvents = [
  "mousemove",
  "mousedown",
  "resize",
  "keydown",
  "touchstart",
  "wheel",
];

/**
 * React sensor hook that tracks if user on the page is idle.
 *
 * @example
 * ```tsx
 * const isIdle = useIdle(3e3);
 *
 * return (
 *   <div>
 *     User is idle: {isIdle ? "Yes 😴" : "Nope"}
 *   </div>
 * );
 * ```
 *
 * @param ms The amount of milliseconds to wait before the user is considered idle (Defaults to `60e3`)
 * @param initialState The initial idle state (Defaults to `false`)
 * @param events The events that reset the idle state (Defaults to `["mousemove", "mousedown", "resize", "keydown", "touchstart", "wheel"]`)
 * @returns `true` if the user is idle, `false` otherwise
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useIdle = isWeb()
  ? (
      ms: number = 60e3,
      initialState: HookStateInitAction<boolean> = false,
      events: string[] = defaultEvents
    ): boolean => {
      const [state, setState] = useState(resolveHookState(initialState));

      const _state = useRef(state);
      _state.current = state;

      useEffect(() => {
        let mounted = true;
        let timeout: ReturnType<typeof setTimeout>;

        const set = (newState: boolean) => {
          if (mounted) {
            _state.current = newState;
            setState(newState);
          }
        };

        const onEvent = throttle(() => {
          if (_state.current) {
            set(false);
          }

          clearTimeout(timeout);
          timeout = setTimeout(() => set(true), ms);
        }, 50);

        const onVisibility = () => {
          if (!document.hidden) {
            onEvent();
          }
        };

        for (const event of events) {
          on(window, event, onEvent);
        }

        on(document, "visibilitychange", onVisibility);

        timeout = setTimeout(() => set(true), ms);

        return () => {
          mounted = false;

          for (const event of events) {
            off(window, event, onEvent);
          }

          off(document, "visibilitychange", onVisibility);
        };
      }, [ms, events]);

      return state;
    }
  : (
      ms: number = 60e3,
      initialState: HookStateInitAction<boolean> = false,
      events: string[] = defaultEvents
    ): boolean => {
      warn(
        "`useIdle` won't work in a non-browser environment. Returning `false`.",
        { ms, initialState, events }
      );
      return resolveHookState(initialState);
    };
