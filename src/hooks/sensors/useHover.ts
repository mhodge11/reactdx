import { cloneElement, useState } from "react";

import type { UseHoverElement, UseHoverReturn } from "../../types/sensors.ts";
import { isFunction } from "../../utils/isFunction.ts";

/**
 * React UI sensor hooks that track if some element is being hovered by a mouse.
 *
 * @example
 * ```tsx
 * const element = (hovered) =>
 *   <div>
 *     Hover me! {hovered && "Thanks!"}
 *   </div>;
 *
 * const [hoverable, hovered] = useHover(element);
 *
 * return (
 *   <div>
 *     {hoverable}
 *     <div>{hovered ? "HOVERED" : ""}</div>
 *   </div>
 * );
 * ```
 *
 * @param element The element to detect hover state on
 * @returns A tuple containing the element and a boolean indicating if the element is hovered
 */
export const useHover = (element: UseHoverElement): UseHoverReturn => {
  const [state, setState] = useState(false);

  const onMouseEnter =
    (originalOnMouseEnter?: GlobalEventHandlers["onmouseenter"]) =>
    (thisArg: GlobalEventHandlers, event: MouseEvent) => {
      if (originalOnMouseEnter) {
        originalOnMouseEnter.apply(thisArg, [event]);
      }
      setState(true);
    };

  const onMouseLeave =
    (originalOnMouseLeave?: GlobalEventHandlers["onmouseleave"]) =>
    (thisArg: GlobalEventHandlers, event: MouseEvent) => {
      if (originalOnMouseLeave) {
        originalOnMouseLeave.apply(thisArg, [event]);
      }
      setState(false);
    };

  const normalizedElement = isFunction(element) ? element(state) : element;

  const el = cloneElement(normalizedElement, {
    onMouseEnter: onMouseEnter(normalizedElement.props.onMouseEnter),
    onMouseLeave: onMouseLeave(normalizedElement.props.onMouseLeave),
  });

  return [el, state];
};
