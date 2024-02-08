import type { ZoomState } from "../enums/sensors.ts";

/**
 * Type alias for the state of the device battery state,
 * used by the {@link useBattery} hook.
 */
export interface DeviceBatteryState {
  /**
   * Whether the device is currently charging.
   */
  charging: boolean;
  /**
   * The amount of time until full charge (in seconds).
   */
  chargingTime: number;
  /**
   * The amount of time until discharge (in seconds).
   */
  dischargingTime: number;
  /**
   * The battery level (between 0 and 1).
   */
  level: number;
}

/**
 * Type alias for the battery manager object, used by the {@link useBattery} hook.
 */
export interface BatteryManager
  extends Readonly<DeviceBatteryState>,
    EventTarget {
  /**
   * Callback when the charging state changes.
   */
  onchargingchange: () => void;
  /**
   * Callback when the charging time changes.
   */
  onchargingtimechange: () => void;
  /**
   * Callback when the discharge time changes.
   */
  ondischargingtimechange: () => void;
  /**
   * Callback when the battery level changes.
   */
  onlevelchange: () => void;
}

/**
 * Type alias for the global Navigator object with the battery API,
 * used by the {@link useBattery} hook.
 */
export interface NavigatorWithBatteryAPI extends Navigator {
  /**
   * Gets the battery manager.
   */
  getBattery?: () => Promise<BatteryManager>;
}

/**
 * Type alias for the battery state returned by the {@link useBattery} hook.
 */
export type UseBatteryReturn =
  | {
      /**
       * Whether the battery API is supported.
       */
      isSupported: false;
    }
  | {
      /**
       * Whether the battery API is supported.
       */
      isSupported: true;
      /**
       * Whether the battery API has been fetched.
       */
      fetched: false;
    }
  | (DeviceBatteryState & {
      /**
       * Whether the battery API is supported.
       */
      isSupported: true;
      /**
       * Whether the battery API has been fetched.
       */
      fetched: true;
    });

/**
 * Type alias for the Geolocation position error, used in the {@link useGeolocation} hook.
 *
 * Made compatible with `GeolocationPositionError` and `PositionError` cause
 * PositionError been renamed to GeolocationPositionError in typescript 4.1.x
 * and making own compatible interface is most easiest way to avoid errors.
 */
export interface GeolocationPositionError {
  /**
   * The error code.
   */
  readonly code: number;
  /**
   * The error message.
   */
  readonly message: string;
  /**
   * Whether permission is denied. `1` if denied, `0` if not.
   */
  readonly PERMISSION_DENIED: number;
  /**
   * Whether position is unavailable. `1` if unavailable, `0` if not.
   */
  readonly POSITION_UNAVAILABLE: number;
  /**
   * Whether request timed out. `1` if timed out, `0` if not.
   */
  readonly TIMEOUT: number;
}

/**
 * Type alias for the Geolocation sensor state returned by the {@link useGeolocation} hook.
 */
export interface UseGeolocationReturn {
  /**
   * Whether the sensor is loading.
   */
  loading: boolean;
  /**
   * The accuracy of the sensor.
   */
  accuracy: number | null;
  /**
   * The altitude of the sensor.
   */
  altitude: number | null;
  /**
   * The altitude accuracy of the sensor.
   */
  altitudeAccuracy: number | null;
  /**
   * The heading of the sensor.
   */
  heading: number | null;
  /**
   * The latitude of the sensor.
   */
  latitude: number | null;
  /**
   * The longitude of the sensor.
   */
  longitude: number | null;
  /**
   * The speed of the sensor.
   */
  speed: number | null;
  /**
   * The timestamp of the sensor.
   */
  timestamp: number | null;
  /**
   * The error of the sensor.
   */
  error?: Error | GeolocationPositionError | undefined;
}

/**
 * Type alias for the state of the hash sensor returned by the {@link useHash} hook.
 */
export type UseHashReturn = [
  /**
   * The current hash.
   */
  hash: string,
  /**
   * The function to update the hash.
   */
  updateHash: (newHash: string) => void,
];

/**
 * Type alias for the scroll state returned by the {@link useScroll} and {@link useWindowScroll} hooks.
 */
export type UseScrollReturn = {
  /**
   * The scroll X position.
   */
  x: number;
  /**
   * The scroll Y position.
   */
  y: number;
};

/**
 * Type alias for the state of the size sensor returned by the {@link useSize} hook.
 */
export interface UseSizeState {
  /**
   * The width of the element.
   */
  width: number;
  /**
   * The height of the element.
   */
  height: number;
}

/**
 * Type alias for the element passed to the {@link useSize} hook.
 */
export type UseSizeElement =
  | ((state: UseSizeState) => React.ReactElement<any>)
  | React.ReactElement<any>;

/**
 * Type alias for the return value of the {@link useSize} hook.
 */
export type UseSizeReturn = [element: UseSizeElement, size: UseSizeState];

/**
 * Type alias for the state of the window size sensor returned by the {@link useWindowSize} hook.
 */
export interface UseWindowSizeReturn {
  /**
   * The width of the window.
   */
  width: number;
  /**
   * The height of the window.
   */
  height: number;
}

/**
 * Type alias for the history API method names that
 * we patch to add some info to the event object.
 */
export type PatchedHistoryMethodName = "pushState" | "replaceState";

/**
 * The state of the location sensor returned by the {@link useLocation} hook.
 */
export interface UseLocationReturn {
  /**
   * The trigger that caused the state to change.
   */
  trigger: "load" | "popstate" | "pushstate" | "replacestate";
  /**
   * The state object.
   */
  state?: any;
  /**
   * The number of entries in the history.
   */
  length?: number;
  /**
   * The hash of the location.
   */
  hash?: string;
  /**
   * The host of the location.
   */
  host?: string;
  /**
   * The hostname of the location.
   */
  hostname?: string;
  /**
   * The href of the location.
   */
  href?: string;
  /**
   * The origin of the location.
   */
  origin?: string;
  /**
   * The pathname of the location.
   */
  pathname?: string;
  /**
   * The port of the location.
   */
  port?: string;
  /**
   * The protocol of the location.
   */
  protocol?: string;
  /**
   * The search (query string) of the location.
   */
  search?: string;
}

/**
 * Type alias for the object that contains information about the
 * size and position of an element, used by the {@link useMeasure} hook.
 */
export interface UseMeasureRect
  extends Pick<
    DOMRectReadOnly,
    "x" | "y" | "top" | "left" | "right" | "bottom" | "height" | "width"
  > {
  /**
   * The x-coordinate of the element.
   */
  x: number;
  /**
   * The y-coordinate of the element.
   */
  y: number;
  /**
   * The top of the element.
   */
  top: number;
  /**
   * The left of the element.
   */
  left: number;
  /**
   * The right of the element.
   */
  right: number;
  /**
   * The bottom of the element.
   */
  bottom: number;
  /**
   * The height of the element.
   */
  height: number;
  /**
   * The width of the element.
   */
  width: number;
}

/**
 * Type alias for the element reference callback used by the {@link useMeasure} hook.
 */
export type UseMeasureRef<TElement extends Element = Element> = (
  element: TElement
) => void;

/**
 * Type alias for the state of the measure sensor returned by the {@link useMeasure} hook.
 */
export type UseMeasureReturn<TElement extends Element = Element> = [
  /**
   * The element reference callback.
   */
  ref: UseMeasureRef<TElement>,
  /**
   * The state of the element.
   */
  rect: UseMeasureRect,
];

/**
 * Type alias for the the hover element passed to the {@link useHover} hook.
 */
export type UseHoverElement =
  | ((state: boolean) => React.ReactElement<any>)
  | React.ReactElement<any>;

/**
 * Type alias for the return value of the {@link useHover} hook.
 */
export type UseHoverReturn = [
  /**
   * The element to attach the hover event to.
   */
  element: React.ReactElement<any>,
  /**
   * Whether the element is currently being hovered.
   */
  isHovered: boolean,
];

/**
 * Type alias for the options of the mouse sensor used by the {@link useMouseHovered} hook.
 */
export interface UseMouseHoveredOptions {
  /**
   * Whether to attach the `mousemove` event handler only
   * when user hovers over the element.
   */
  whenHovered?: boolean;
  /**
   * Whether to bind the mouse coordinates within the element.
   */
  bound?: boolean;
}

/**
 * Type alias for the state of the mouse sensor returned by the
 * {@link useMouse} hook.
 */
export interface UseMouseReturn {
  /**
   * The `x` (horizontal) coordinate (in pixels) at which the
   * mouse exists, relative to the left edge of the entire
   * document. This includes any portion of the document not
   * currently visible.
   */
  docX: number;
  /**
   * The `y` (vertical) coordinate in pixels of the mouse relative
   * to the whole document. This property takes into account any
   * vertical scrolling of the page.
   */
  docY: number;
  /**
   * The number of pixels that the document is currently scrolled
   * horizontally plus the `x` coordinate of the mouse.
   */
  posX: number;
  /**
   * The number of pixels that the document is currently scrolled
   * vertically plus the `y` coordinate of the mouse.
   */
  posY: number;
  /**
   * The `x` (horizontal) coordinate in pixels of the mouse
   * relative to the element that the event fired on.
   */
  elX: number;
  /**
   * The `y` (vertical) coordinate in pixels of the mouse
   * relative to the element that the event fired on.
   */
  elY: number;
  /**
   * The height of the element that the event fired on.
   */
  elH: number;
  /**
   * The width of the element that the event fired on.
   */
  elW: number;
}

/**
 * Type alias for the object that contains information
 * about the orientation state, used by the {@link useOrientation} hook.
 */
export interface UseOrientationReturn {
  /**
   * The document's current orientation angle.
   */
  angle: number;
  /**
   * The document's current orientation type.
   */
  type:
    | "landscape-primary"
    | "landscape-secondary"
    | "portrait-primary"
    | "portrait-secondary"
    | "";
}

/**
 * Type alias for the object that contains information about a
 * particular media device, used by the {@link useMediaDevices} hook.
 */
export interface MediaDevice {
  /**
   * The type of the device.
   * One of `"audioinput" | "audiooutput" | "videoinput"`.
   */
  kind: MediaDeviceKind;
  /**
   * The device ID.
   */
  deviceId: MediaDeviceInfo["deviceId"];
  /**
   * The device label.
   */
  label: MediaDeviceInfo["label"];
  /**
   * The group ID of the device.
   */
  groupId: MediaDeviceInfo["groupId"];
}

/**
 * Type alias for the object that contains information about the media devices
 * available to the browser. The MediaDevicesInfo interface contains information
 * that describes a single media input or output device returned by the
 * {@link useMediaDevices} hook.
 *
 * The key for each device is the device ID.
 *
 * *Available only in secure contexts.*
 */
export interface UseMediaDevicesReturn {
  /**
   * A media device object with the device ID as the key.
   */
  [deviceId: MediaDevice["deviceId"]]: MediaDevice;
}

/**
 * Type alias for the state of the motion sensor which
 * mirrors the `DeviceMotionEvent` interface returned by the
 * {@link useMotion} hook.
 *
 * The `DeviceMotionEvent` provides web developers with
 * information about the speed of changes for the device's
 * position and orientation.
 *
 * **Warning:** Currently, Firefox and Chrome do not handle the coordinates
 * the same way. Take care about this while using them.
 *
 * *Available only in secure contexts.*
 */
export interface UseMotionReturn {
  /**
   * An object giving the amout of acceleration of the device on the
   * three axes: `x`, `y` and `z`.
   *
   * Acceleration is expressed in [m/s²](https://en.wikipedia.org/wiki/Metre_per_second_squared).
   */
  readonly acceleration: {
    /**
     * Represents the acceleration upon the `x axis`
     * which is the west to east axis.
     *
     * ***Note:**  If the hardware isn't capable of providing this information,
     * this property returns null.*
     */
    readonly x: number | null;
    /**
     * Represents the acceleration upon the `y axis`
     * which is the south to north axis.
     *
     * ***Note:**  If the hardware isn't capable of providing this information,
     * this property returns null.*
     */
    readonly y: number | null;
    /**
     * Represents the acceleration upon the `z axis`
     * which is the down to up axis.
     *
     * The `z axis` is perpendicular to the device's screen.
     *
     * ***Note:**  If the hardware isn't capable of providing this information,
     * this property returns null.*
     */
    readonly z: number | null;
  };
  /**
   * An object giving the amount of acceleration of the device on the
   * three axes: `x`, `y` and `z`. Unlike the `acceleration` property,
   * which compensates for the influence of gravity, its value is the
   * sum of the acceleration of the device as induced by the user and
   * an acceleration equal and opposite to that caused by gravity.
   * In other words, it measures the [g-force](https://en.wikipedia.org/wiki/G-force).
   * In practice, this value represents the raw data measured by an
   * [accelerometer](https://en.wikipedia.org/wiki/Accelerometer).
   *
   * Acceleration is expressed in [m/s²](https://en.wikipedia.org/wiki/Metre_per_second_squared).
   */
  readonly accelerationIncludingGravity: {
    /**
     * Represents the acceleration upon the `x axis`
     * which is the west to east axis.
     *
     * ***Note:**  If the hardware isn't capable of providing this information,
     * this property returns null.*
     */
    readonly x: number | null;
    /**
     * Represents the acceleration upon the `y axis`
     * which is the south to north axis.
     *
     * ***Note:**  If the hardware isn't capable of providing this information,
     * this property returns null.*
     */
    readonly y: number | null;
    /**
     * Represents the acceleration upon the `z axis`
     * which is the down to up axis.
     *
     * The `z axis` is perpendicular to the device's screen.
     *
     * ***Note:**  If the hardware isn't capable of providing this information,
     * this property returns null.*
     */
    readonly z: number | null;
  };
  /**
   * An object giving the rate of change of the device's orientation on
   * the three orientation axes: `alpha`, `beta` and `gamma`.
   *
   * Rotation rate is expressed in degrees per seconds.
   */
  readonly rotationRate: {
    /**
     * The rate at which the device is rotating about its `z axis`;
     * that is, being twisted about a line perpendicular to the screen.
     *
     * ***Note:**  If the hardware isn't capable of providing this information,
     * this property returns null.*
     */
    readonly alpha: number | null;
    /**
     * The rate at which the device is rotating about its `x axis`;
     * that is, front to back.
     *
     * ***Note:**  If the hardware isn't capable of providing this information,
     * this property returns null.*
     */
    readonly beta: number | null;
    /**
     * The rate at which the device is rotating about its `y axis`;
     * that is, side to side.
     *
     * ***Note:**  If the hardware isn't capable of providing this information,
     * this property returns null.*
     */
    readonly gamma: number | null;
  };
  /**
   * A number representing the interval of time, in milliseconds,
   * at which data is obtained from the device.
   */
  readonly interval: number;
}

/**
 * Type alias for the object that contains information
 * about the network state, used by the {@link useNetworkState} hook.
 */
export interface NetworkInfo extends EventTarget {
  /**
   * Effective bandwidth estimate in megabits per second, rounded to the
   * nearest multiple of 25 kilobits per seconds.
   */
  readonly downlink: number;
  /**
   * Maximum downlink speed, in megabits per second (Mbps), for the
   * underlying connection technology
   */
  readonly downlinkMax: number;
  /**
   * Effective type of the connection meaning one of 'slow-2g', '2g', '3g', or '4g'.
   * This value is determined using a combination of recently observed round-trip time
   * and downlink values.
   */
  readonly effectiveType: "slow-2g" | "2g" | "3g" | "4g";
  /**
   * Estimated effective round-trip time of the current connection, rounded
   * to the nearest multiple of 25 milliseconds
   */
  readonly rtt: number;
  /**
   * `true` if the user has set a reduced data usage option on the user agent.
   */
  readonly saveData: boolean;
  /**
   * The type of connection a device is using to communicate with the network.
   * It will be one of the following values:
   *  - bluetooth
   *  - cellular
   *  - ethernet
   *  - none
   *  - wifi
   *  - wimax
   *  - other
   *  - unknown
   */
  readonly type:
    | "bluetooth"
    | "cellular"
    | "ethernet"
    | "none"
    | "wifi"
    | "wimax"
    | "other"
    | "unknown";
  /**
   * The `change` event that is fired when the network state changes.
   *
   * @param event The event object.
   */
  onChange: (event: Event) => void;
}

/**
 * Type alias for the network state returned by the {@link useNetworkState} hook.
 */
export interface UseNetworkStateReturn {
  /**
   * Whether browser connected to the network or not.
   */
  online?: boolean | undefined;
  /**
   * Previous value of `online` property. Helps to identify if browser
   * just connected or lost connection.
   */
  previous?: boolean | undefined;
  /**
   * The {Date} object pointing to the moment when state change occurred.
   */
  since?: Date | undefined;
  /**
   * Effective bandwidth estimate in megabits per second, rounded to the
   * nearest multiple of 25 kilobits per seconds.
   */
  downlink?: NetworkInfo["downlink"] | undefined;
  /**
   * Maximum downlink speed, in megabits per second (Mbps), for the
   * underlying connection technology
   */
  downlinkMax?: NetworkInfo["downlinkMax"] | undefined;
  /**
   * Effective type of the connection meaning one of 'slow-2g', '2g', '3g', or '4g'.
   * This value is determined using a combination of recently observed round-trip time
   * and downlink values.
   */
  effectiveType?: NetworkInfo["effectiveType"] | undefined;
  /**
   * Estimated effective round-trip time of the current connection, rounded
   * to the nearest multiple of 25 milliseconds
   */
  rtt?: NetworkInfo["rtt"] | undefined;
  /**
   * {true} if the user has set a reduced data usage option on the user agent.
   */
  saveData?: NetworkInfo["saveData"] | undefined;
  /**
   * The type of connection a device is using to communicate with the network.
   * It will be one of the following values:
   *  - bluetooth
   *  - cellular
   *  - ethernet
   *  - none
   *  - wifi
   *  - wimax
   *  - other
   *  - unknown
   */
  type?: NetworkInfo["type"] | undefined;
}

/**
 * Type alias for the long press event options used by the {@link useLongPress} hook.
 */
export interface UseLongPressOptions {
  /**
   * Whether to prevent the default action of the event.
   * This prevents ghost click on mobile devices.
   */
  isPreventDefault?: boolean;
  /**
   * The delay in milliseconds before the press is considered
   * a long press.
   */
  delay?: number;
}

/**
 * Type alias for the long press event handlers returned by the {@link useLongPress} hook.
 */
export interface UseLongPressReturn {
  /**
   * The mouse down event handler.
   */
  onMouseDown: (event: MouseEvent) => void;
  /**
   * The touch start event handler.
   */
  onTouchStart: (event: TouchEvent) => void;
  /**
   * The mouse up event handler.
   */
  onMouseUp: () => void;
  /**
   * The mouse leave event handler.
   */
  onMouseLeave: () => void;
  /**
   * The touch end event handler.
   */
  onTouchEnd: () => void;
}

/**
 * Type alias for the cache of the pointer events,
 * used by the {@link usePinchZoom} hook.
 */
export interface ZoomCacheRef {
  /**
   * The difference between the current and previous distances.
   */
  prevDiff: number;
  /**
   * The cache of the pointer events.
   */
  evCache: PointerEvent[];
}

/**
 * Type alias for the state of the pinch/zoom sensor return by the {@link usePinchZoom} hook.
 */
export interface UsePinchZoomReturn {
  /**
   * The current zoom state.
   */
  zoomingState: ZoomState | null;
  /**
   * The current pinch state.
   */
  pinchState: number;
}

/**
 * Type alias for the object that contains the options for the scratch sensor,
 * used by the {@link useScratch} hook.
 */
export interface UseScratchOptions {
  /**
   * Whether the sensor is disabled.
   */
  disabled?: boolean;
  /**
   * A callback function that is called whenever the user is scratching.
   */
  onScratch?: (state: ScratchState) => void;
  /**
   * A callback function that is called whenever the user starts scratching.
   */
  onScratchStart?: (state: ScratchState) => void;
  /**
   * A callback function that is called whenever the user stops scratching.
   */
  onScratchEnd?: (state: ScratchState) => void;
}

/**
 * Type alias for the state of the scratch sensor used by the {@link useScratch} hook.
 */
export interface ScratchState {
  /**
   * Whether the user is scratching.
   */
  isScratching: boolean;
  /**
   * The time the scratching started.
   */
  start?: number;
  /**
   * The time the scratching ended.
   */
  end?: number;
  /**
   * The x-coordinate of the scratch.
   */
  x?: number;
  /**
   * The y-coordinate of the scratch.
   */
  y?: number;
  /**
   * The change in the x-coordinate of the scratch.
   */
  dx?: number;
  /**
   * The change in the y-coordinate of the scratch.
   */
  dy?: number;
  /**
   * The x-coordinate of the scratch relative to the document.
   */
  docX?: number;
  /**
   * The y-coordinate of the scratch relative to the document.
   */
  docY?: number;
  /**
   * The x-coordinate of the scratch relative to the element.
   */
  elX?: number;
  /**
   * The y-coordinate of the scratch relative to the element.
   */
  elY?: number;
  /**
   * The height of the element.
   */
  elH?: number;
  /**
   * The height of the element.
   */
  elW?: number;
}

/**
 * Type alias for the return value of the {@link useScratch} hook.
 */
export type UseScratchReturn = [
  /**
   * The element reference callback.
   */
  ref: (el: HTMLElement | null) => void,
  /**
   * The state of the scratch sensor.
   */
  state: ScratchState,
];
