import type { UseScrollReturn } from "../../types/sensors.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";
import { useRafState } from "../states/useRafState.ts";

/**
 * React sensor hook that re-renders on window scroll.
 *
 * @example
 * ```tsx
 * const scrollRef = useRef(null);
 * const { x, y } = useWindowScroll(scrollRef);
 *
 * return (
 *   <div ref={scrollRef}>
 *     <div>x: {x}</div>
 *     <div>y: {y}</div>
 *   </div>
 * );
 * ```
 *
 * @returns The state of the window scroll.
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useWindowScroll = hasWindow()
  ? (): UseScrollReturn => {
      const [state, setState] = useRafState<UseScrollReturn>({
        x: 0,
        y: 0,
      });

      useEffectOnce(() => {
        const handler = () => {
          setState(state => {
            const { scrollX, scrollY } = window;
            //Check state for change, return same state if no change happened to prevent rerender
            //(see useState/setState documentation). useState/setState is used internally in useRafState/setState.
            return state.x !== scrollX || state.y !== scrollY
              ? {
                  x: scrollX,
                  y: scrollY,
                }
              : state;
          });
        };

        //We have to update window scroll at mount, before subscription.
        //Window scroll may be changed between render and effect handler.
        handler();

        on(window, "scroll", handler, {
          capture: false,
          passive: true,
        });

        return () => {
          off(window, "scroll", handler);
        };
      });

      return state;
    }
  : (): UseScrollReturn => {
      warn("`useWindowScroll` is not supported on server side");
      return {
        x: 0,
        y: 0,
      };
    };
