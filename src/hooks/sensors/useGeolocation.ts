import { useRef, useState } from "react";

import type { UseGeolocationReturn } from "../../types/sensors.ts";
import { hasNavigator } from "../../utils/hasNavigator.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * React sensor hook that tracks user's geographic location.
 * This hook accepts [position options](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition).
 *
 * @example
 * ```tsx
 * const state = useGeolocation();
 *
 * return (
 *   <pre>
 *     {JSON.stringify(state, null, 2)}
 *   </pre>
 * );
 * ```
 *
 * @param options (Optional) The position options
 * @param options.enableHighAccuracy (Optional) Provides a hint that the application would like to receive the best possible results (Defaults to `false`)
 * @param options.timeout (Optional) The maximum length of time (in milliseconds) the device is allowed to take in order to return a position (Defaults to `Infinity`)
 * @param options.maximumAge (Optional) The maximum age in milliseconds of a possible cached position that is acceptable to return (Defaults to `0`)
 * @returns The geolocation sensor state
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useGeolocation = hasNavigator
  ? (options?: PositionOptions): UseGeolocationReturn => {
      const [state, setState] = useState<UseGeolocationReturn>({
        loading: true,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: null,
        longitude: null,
        speed: null,
        timestamp: Date.now(),
      });

      const _options = useRef(options);
      _options.current = options;

      useEffectOnce(() => {
        let mounted = true;

        const onEvent = (event: GeolocationPosition) => {
          if (mounted) {
            setState({
              loading: false,
              accuracy: event.coords.accuracy,
              altitude: event.coords.altitude,
              altitudeAccuracy: event.coords.altitudeAccuracy,
              heading: event.coords.heading,
              latitude: event.coords.latitude,
              longitude: event.coords.longitude,
              speed: event.coords.speed,
              timestamp: event.timestamp,
            });
          }
        };

        const onEventError = (error: GeolocationPositionError) => {
          if (mounted) {
            setState(prevState => ({
              ...prevState,
              loading: false,
              error,
            }));
          }
        };

        navigator.geolocation.getCurrentPosition(
          onEvent,
          onEventError,
          _options.current
        );

        const watchId = navigator.geolocation.watchPosition(
          onEvent,
          onEventError,
          _options.current
        );

        return () => {
          mounted = false;
          navigator.geolocation.clearWatch(watchId);
        };
      });

      return state;
    }
  : (options?: PositionOptions): UseGeolocationReturn => {
      warn("Geolocation API is not supported in this environment.", {
        options,
      });
      return {
        loading: false,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: null,
        longitude: null,
        speed: null,
        timestamp: Date.now(),
      };
    };
