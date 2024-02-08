import { useEffect } from "react";

import type { UseMouseReturn } from "../../types/sensors.ts";
import { isObjectType } from "../../utils/isObject.ts";
import { isUndefined } from "../../utils/isUndefined.ts";
import { isWeb } from "../../utils/isWeb.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";
import { useRafState } from "../states/useRafState.ts";

/**
 * React sensor hook that re-renders on mouse position changes.
 *
 * `useMouse` simply tracks mouse position. If you would like to
 * specify some extra logic, use `{@link useMouseHovered}`.
 *
 * @example
 * ```tsx
 * const ref = useRef(null);
 * const state = useMouse(ref);
 *
 * return (
 *   <>
 *     <div ref={ref} />
 *     <pre>
 *       {JSON.stringify(state, null, 2)}
 *     </pre>
 *   </>
 * );
 * ```
 *
 * @param ref The ref of the target element
 * @returns The state of the mouse sensor
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useMouse = isWeb()
  ? (ref: React.RefObject<Element>): UseMouseReturn => {
      runOnlyIfDevMode(() => {
        if (!isObjectType(ref) || isUndefined(ref.current)) {
          warn("`useMouse` expects a single ref argument.", { ref });
        }
      });

      const [state, setState] = useRafState<UseMouseReturn>({
        docX: 0,
        docY: 0,
        posX: 0,
        posY: 0,
        elX: 0,
        elY: 0,
        elH: 0,
        elW: 0,
      });

      useEffect(() => {
        const moveHandler = (event: MouseEvent) => {
          if (!ref?.current) {
            return;
          }

          const {
            left,
            top,
            width: elW,
            height: elH,
          } = ref.current.getBoundingClientRect();
          const posX = left + window.scrollX;
          const posY = top + window.scrollY;
          const elX = event.pageX - posX;
          const elY = event.pageY - posY;

          setState({
            docX: event.pageX,
            docY: event.pageY,
            posX,
            posY,
            elX,
            elY,
            elH,
            elW,
          });
        };

        on(document, "mousemove", moveHandler);

        return () => {
          off(document, "mousemove", moveHandler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [ref]);

      return state;
    }
  : (ref: React.RefObject<Element>): UseMouseReturn => {
      warn(
        "`useMouse` is not supported when the global `document` object doesn't exist.",
        { ref }
      );
      return {
        docX: 0,
        docY: 0,
        posX: 0,
        posY: 0,
        elX: 0,
        elY: 0,
        elH: 0,
        elW: 0,
      };
    };
