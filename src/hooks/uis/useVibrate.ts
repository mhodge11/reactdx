import { useEffect } from "react";

import { hasNavigator } from "../../utils/hasNavigator.ts";
import { warn } from "../../utils/warn.ts";

/**
 * Checks if the current environment supports the Vibration API.
 *
 * @returns `true` if the current environment supports the Vibration API, otherwise `false`
 */
const isVibrationApiSupported = () => hasNavigator && "vibrate" in navigator;

/**
 * React UI hook to provide physical feedback with
 * device vibration hardware using the
 * [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API).
 *
 * @example
 * ```tsx
 * const [vibrating, toggleVibrating] = useBoolean(false);
 *
 * useVibrate(
 *   vibrating,
 *   [300, 100, 200, 100, 1000, 300],
 *   false
 * );
 *
 * return (
 *   <div>
 *     <button onClick={toggleVibrating}>
 *       {vibrating ? 'Stop' : 'Vibrate'}
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @param enabled (Optional) Whether or not to enable vibration. (Default: `true`)
 * @param pattern (Optional) The vibration pattern. (Default: `[1000, 1000]`)
 * @param loop (Optional) Whether or not to loop the vibration pattern. (Default: `true`)
 *
 * @category UI
 * @since 0.0.1
 */
export const useVibrate = isVibrationApiSupported()
  ? (
      enabled: boolean = true,
      pattern: number | number[] = [1000, 1000],
      loop: boolean = true
    ): void => {
      useEffect(() => {
        if (!enabled) {
          return;
        }

        let interval: ReturnType<typeof setInterval> | undefined;

        navigator.vibrate(pattern);

        if (loop) {
          const duration = Array.isArray(pattern)
            ? pattern.reduce((a, b) => a + b)
            : pattern;

          interval = setInterval(() => {
            navigator.vibrate(pattern);
          }, duration);
        }

        return () => {
          navigator.vibrate(0);
          clearInterval(interval);
        };
      }, [enabled, pattern, loop]);
    }
  : (
      enabled: boolean = true,
      pattern: number | number[] = [1000, 1000],
      loop: boolean = true
    ): void => {
      warn("The Vibration API is not supported in this environment.", {
        enabled,
        pattern,
        loop,
      });
    };
