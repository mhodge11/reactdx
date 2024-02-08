import { useEffect, useState } from "react";

import { isObjectType } from "../../utils/isObject.ts";
import { isUndefined } from "../../utils/isUndefined.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";

/**
 * React UI sensor hooks that track if some element is being hovered by a mouse.
 *
 * Similar to `{@link useHover}`, but instead of taking an element to wrap and
 * returning a tuple containing the element and a boolean indicating if the
 * element is hovered, it takes a ref argument and returns a boolean
 * indicating if the element is hovered.
 *
 * @example
 * ```tsx
 * const element = useRef(null);
 * const hovered = useHoverDirty(element);
 *
 * return (
 *   <div ref={element}>
 *     {hovered ? "HOVERED" : ""}
 *   </div>
 * )
 * ```
 *
 * @param ref The ref of the element to detect hover state on
 * @param enabled Whether the sensor should be enabled or not
 * @returns A boolean indicating if the element is hovered
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useHoverDirty = (
  ref: React.RefObject<Element>,
  enabled: boolean = true
): boolean => {
  runOnlyIfDevMode(() => {
    if (!isObjectType(ref) || isUndefined(ref.current)) {
      warn("`useHoverDirty` expects a single ref argument.", { ref, enabled });
    }
  });

  const [value, setValue] = useState(false);

  useEffect(() => {
    if (!enabled || !ref?.current) {
      return;
    }

    const el = ref.current;

    const onMouseOver = () => setValue(true);
    const onMouseOut = () => setValue(false);

    on(el, "mouseover", onMouseOver);
    on(el, "mouseout", onMouseOut);

    return () => {
      off(el, "mouseover", onMouseOver);
      off(el, "mouseout", onMouseOut);
    };
  }, [ref, enabled]);

  return value;
};
