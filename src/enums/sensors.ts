/**
 * Enum for the zoom state of the pinch/zoom sensor,
 * used by the {@link usePinchZoom} hook.
 */
export enum ZoomState {
  /**
   * The user is zooming in.
   */
  ZOOMING_IN = "ZOOMING_IN",
  /**
   * The user is zooming out.
   */
  ZOOMING_OUT = "ZOOMING_OUT",
}
