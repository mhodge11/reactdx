import { useRef } from "react";

import { useEffectOnce } from "./useEffectOnce.ts";

/**
 * React lifecycle hook that calls a callback function
 * when the component will unmount.
 *
 * Use `{@link useLifecycles}` if you need
 * both a mount and unmount function.
 *
 * @example
 * ```tsx
 * useOnUnmount(() => {
 *   console.log("Unmounted!");
 * })
 * ```
 *
 * @param callback The callback to run on unmount
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useOnUnmount = (callback: () => void): void => {
  const _callback = useRef(callback);

  // update the ref each render so if it changes the newest callback will be invoked
  _callback.current = callback;

  useEffectOnce(() => {
    return () => {
      _callback.current();
    };
  });
};
