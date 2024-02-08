import { useEffect, useRef, useState } from "react";

import { hasWindow } from "../../utils/hasWindow.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";

/**
 * React sensor hook to get the `deltaY` of the mouse scrolled
 * in window.
 *
 * @example
 * ```tsx
 * const delta = useMouseWheel();
 *
 * return (
 *   <>
 *     <h3>deltaY scrolled: {delta}</h3>
 *   </>
 * );
 * ```
 *
 * @returns The deltaY of the mouse scrolled
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useMouseWheel = hasWindow()
  ? (): number => {
      const [delta, setDelta] = useState(0);

      const deltaRef = useRef(delta);
      deltaRef.current = delta;

      useEffect(() => {
        const updateScroll = (event: WheelEvent) => {
          if (deltaRef.current !== event.deltaY) {
            setDelta(event.deltaY);
          }
        };

        on(window, "wheel", updateScroll);

        return () => {
          off(window, "wheel", updateScroll);
        };
      });

      return delta;
    }
  : (): number => {
      warn(
        "`useMouseWheel` won't work if the global `window` object is not defined."
      );
      return 0;
    };
