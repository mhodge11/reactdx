import type { UseWindowSizeReturn } from "../../types/sensors.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";
import { useRafState } from "../states/useRafState.ts";

/**
 * React sensor hook to track the size of the window.
 *
 * @example
 * ```tsx
 * const state = useWindowSize();
 *
 * return (
 *   <pre>
 *     {JSON.stringify(state, null, 2)}
 *   </pre>
 * );
 * ```
 *
 * @param initialWidth (Optional) The initial width of the window (Defaults to `Infinity`)
 * @param initialHeight (Optional) The initial height of the window (Defaults to `Infinity`)
 * @returns The state of the window size
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useWindowSize = hasWindow()
  ? (initialWidth: number = Infinity, initialHeight: number = Infinity) => {
      const [state, setState] = useRafState<UseWindowSizeReturn>({
        width: initialWidth === Infinity ? window.innerWidth : initialWidth,
        height: initialHeight === Infinity ? window.innerHeight : initialHeight,
      });

      useEffectOnce(() => {
        const handler = () => {
          setState({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        };

        on(window, "resize", handler);

        return () => {
          off(window, "resize", handler);
        };
      });

      return state;
    }
  : (
      initialWidth: number = Infinity,
      initialHeight: number = Infinity
    ): UseWindowSizeReturn => {
      warn("`useWindowSize` is not supported on server side", {
        initialHeight,
        initialWidth,
      });
      return { width: initialWidth, height: initialHeight };
    };
