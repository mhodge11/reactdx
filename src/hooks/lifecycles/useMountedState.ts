import { useCallback, useRef } from "react";

import { useEffectOnce } from "./useEffectOnce.ts";

/**
 * Lifecycle hook providing ability to check component's mount state.
 * Returns a function that will return `true` if component mounted
 * and `false` otherwise.
 *
 * @example
 * ```tsx
 * const isMounted = useMountedState();
 *
 * useEffect(() => {
 *   setTimeout(() => {
 *     if (isMounted()) {
 *       // do something
 *     } else {
 *       // do something else
 *     }
 *   }, 1000);
 * });
 * ```
 *
 * @returns A function that returns `true` if the component is mounted, otherwise `false`
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useMountedState = (): (() => boolean) => {
  const _mounted = useRef(false);

  useEffectOnce(() => {
    _mounted.current = true;

    return () => {
      _mounted.current = false;
    };
  });

  return useCallback(() => _mounted.current, []);
};
