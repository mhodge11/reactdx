import type {
  UseMouseHoveredOptions,
  UseMouseReturn,
} from "../../types/sensors.ts";

import { useHoverDirty } from "./useHoverDirty.ts";
import { useMouse } from "./useMouse.ts";

/**
 * React sensor hook that re-renders on mouse position changes.
 *
 * Allows you to specify whether to attach the `mousemove` event
 * handler only when user hovers over the element and whether to
 * bind the mouse coordinates within the element.
 *
 * If you would like to track the mouse position without specifying
 * extra logic, use `{@link useMouse}` instead.
 *
 * @example
 * ```tsx
 * const ref = useRef(null);
 * const state = useMouseHovered(ref);
 *
 * return (
 *   <>
 *     <div ref={ref} />
 *     <pre>
 *       {JSON.stringify(state, null, 2)}
 *     </pre>
 *   </>
 * );
 *
 * @param ref The React ref object that represents the element.
 * @param options (Optional) The options for the hook.
 * @param options.whenHovered (Optional) Whether to attach the `mousemove` event handler only when user hovers over the element.
 * @param options.bound (Optional) Whether to bind the mouse coordinates within the element.
 * @returns The state of the mouse.
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useMouseHovered = (
  ref: React.RefObject<Element>,
  options: UseMouseHoveredOptions = {}
): UseMouseReturn => {
  const whenHovered = !!options.whenHovered;
  const bound = !!options.bound;

  const isHovered = useHoverDirty(ref, whenHovered);
  const state = useMouse(whenHovered && !isHovered ? { current: null } : ref);

  if (bound) {
    state.elX = Math.max(0, Math.min(state.elX, state.elW));
    state.elY = Math.max(0, Math.min(state.elY, state.elH));
  }

  return state;
};
