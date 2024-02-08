import { useEffect } from "react";

import type { UseScrollReturn } from "../../types/sensors.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useRafState } from "../states/useRafState.ts";

/**
 * React sensor hook that re-renders when the scroll position in a DOM element changes.
 *
 * @example
 * ```tsx
 * const scrollRef = useRef(null);
 * const { x, y } = useScroll(scrollRef);
 *
 * return (
 *   <div ref={scrollRef}>
 *     <div>x: {x}</div>
 *     <div>y: {y}</div>
 *   </div>
 * );
 * ```
 *
 * @param ref The ref object that points to the element to track the scroll position of.
 * @returns The state of the scroll sensor.
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useScroll = hasWindow()
  ? (ref: React.RefObject<HTMLElement>): UseScrollReturn => {
      const [state, setState] = useRafState<UseScrollReturn>({
        x: 0,
        y: 0,
      });

      useEffect(() => {
        if (!ref?.current) {
          return;
        }

        const _ref = ref.current;

        const handler = () => {
          setState({
            x: _ref.scrollLeft,
            y: _ref.scrollTop,
          });
        };

        on(_ref, "scroll", handler, { capture: false, passive: true });

        return () => {
          off(_ref, "scroll", handler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [ref]);

      return state;
    }
  : (ref: React.RefObject<HTMLElement>): UseScrollReturn => {
      warn("`useScroll` is not supported on server side", { ref });
      return {
        x: 0,
        y: 0,
      };
    };
