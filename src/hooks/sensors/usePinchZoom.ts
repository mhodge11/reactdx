import { useCallback, useEffect, useMemo, useState } from "react";

import { ZoomState } from "../../enums/sensors.ts";
import type { UsePinchZoomReturn, ZoomCacheRef } from "../../types/sensors.ts";

/**
 * React sensor hook that tracks the changes in pointer touch events
 * and detects value of pinch difference and tell if user is zooming
 * in or out.
 *
 * @example
 * ```tsx
 * const [scale, setState] = useState(1);
 * const scaleRef = useRef();
 *
 * const {
 *   zoomingState,
 *   pinchState
 * } = usePinchZoom(scaleRef);
 *
 * useEffect(() => {
 *   if (zoomingState === "ZOOM_IN") {
 *     // perform zoom in scaling
 *     setState(scale + 0.1)
 *   } else if (zoomingState === "ZOOM_OUT") {
 *     // perform zoom out in scaling
 *     setState(scale - 0.1)
 *   }
 * }, [zoomingState]);
 *
 * return (
 *   <div ref={scaleRef}>
 *     <img
 *       src="https://www.olympus-imaging.co.in/content/000107506.jpg"
 *       style={{
 *         zoom: scale,
 *       }}
 *     />
 *   </div>
 * );
 * ```
 *
 * @param ref The reference to the element to track the pinch zoom events on
 * @returns The state of the pinch zoom sensor
 *
 * @category Sensor
 * @since 0.0.1
 */
export const usePinchZoom = (
  ref: React.RefObject<HTMLElement>
): UsePinchZoomReturn => {
  const cacheRef = useMemo<ZoomCacheRef>(
    () => ({
      evCache: [],
      prevDiff: -1,
    }),
    []
  );

  const [zoomingState, setZoomingState] = useState<[ZoomState, number]>();

  /*
   biome-ignore lint/correctness/useExhaustiveDependencies:
   There is a bug in this rule that causes it to throw an error when using
   the `cacheRef` object in the `useCallback` dependency array. The rule
   should not throw an error in this case.
   */
  const pointermove_handler = useCallback(
    (event: PointerEvent) => {
      // This function implements a 2-pointer horizontal pinch/zoom gesture.
      //
      // If the distance between the two pointers has increased (zoom in),
      // the target element's background is changed to 'pink' and if the
      // distance is decreasing (zoom out), the color is changed to 'lightblue'.
      //
      // This function sets the target element's border to 'dashed' to visually
      // indicate the pointer's target received a move event.
      // Find this event in the cache and update its record with this event
      for (let i = 0; i < cacheRef.evCache.length; i++) {
        if (event.pointerId === cacheRef.evCache[i]?.pointerId) {
          cacheRef.evCache[i] = event;
          break;
        }
      }

      // If two pointers are down, check for pinch gestures
      if (cacheRef.evCache.length === 2) {
        // Calculate the distance between the two pointers
        const prevEvent = cacheRef.evCache[0];
        const currEvent = cacheRef.evCache[1];
        if (!prevEvent || !currEvent) {
          return;
        }

        const currDiff = Math.abs(prevEvent.clientX - currEvent.clientX);

        if (cacheRef.prevDiff > 0) {
          if (currDiff > cacheRef.prevDiff) {
            // The distance between the two pointers has increased
            setZoomingState([ZoomState.ZOOMING_IN, currDiff]);
          } else if (currDiff < cacheRef.prevDiff) {
            // The distance between the two pointers has decreased
            setZoomingState([ZoomState.ZOOMING_OUT, currDiff]);
          }
        }

        // Cache the distance for the next move event
        cacheRef.prevDiff = currDiff;
      }
    },
    [cacheRef]
  );

  const pointerdown_handler = useCallback(
    (event: PointerEvent) => {
      // The pointerdown event signals the start of a touch interaction.
      // This event is cached to support 2-finger gestures
      cacheRef.evCache.push(event);
    },
    [cacheRef.evCache]
  );

  /*
   biome-ignore lint/correctness/useExhaustiveDependencies:
   There is a bug in this rule that causes it to throw an error when using
   the `cacheRef` object in the `useCallback` dependency array. The rule
   should not throw an error in this case.
   */
  const remove_event = useCallback(
    (event: PointerEvent) => {
      // Remove this pointer from the cache
      for (let i = 0; i < cacheRef.evCache.length; i++) {
        if (cacheRef.evCache[i]?.pointerId === event.pointerId) {
          cacheRef.evCache.splice(i, 1);
          break;
        }
      }
    },
    [cacheRef.evCache]
  );

  const pointerup_handler = useCallback(
    (event: PointerEvent) => {
      // Remove this pointer from the cache and reset the target's
      // background and border
      remove_event(event);

      // If the number of pointers down is less than two then reset diff tracker
      if (cacheRef.evCache.length < 2) {
        cacheRef.prevDiff = -1;
      }
    },
    [cacheRef, remove_event]
  );

  useEffect(() => {
    if (!ref?.current) {
      return;
    }

    ref.current.onpointerdown = pointerdown_handler;
    ref.current.onpointermove = pointermove_handler;
    ref.current.onpointerup = pointerup_handler;
    ref.current.onpointercancel = pointerup_handler;
    ref.current.onpointerout = pointerup_handler;
    ref.current.onpointerleave = pointerup_handler;
  }, [ref, pointerdown_handler, pointermove_handler, pointerup_handler]);

  return zoomingState
    ? { zoomingState: zoomingState[0], pinchState: zoomingState[1] }
    : { zoomingState: null, pinchState: 0 };
};
