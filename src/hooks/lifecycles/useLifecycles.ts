import { useRef } from "react";

import { useEffectOnce } from "./useEffectOnce.ts";

/**
 * React lifecycle hook that call mount and unmount callbacks,
 * when component is mounted and un-mounted, respectively.
 *
 * Use `{@link useMount}` or `{@link useUnmount}` if you
 * only need a mount or unmount callback function.
 *
 * @example
 * ```tsx
 * useLifecycles(
 *   () => {
 *     console.log("Mounted!");
 *   },
 *   () => {
 *     console.log("Unmounted!");
 *   }
 * )
 * ```
 *
 * @param onMountCallback The callback to run on mount
 * @param onUnmountCallback The callback to run on unmount
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useLifecycles = (
  onMountCallback: () => void,
  onUnmountCallback: () => void
): void => {
  const _onUnmountCallback = useRef(onUnmountCallback);

  // update the ref each render so if it changes the newest callback will be invoked
  _onUnmountCallback.current = onUnmountCallback;

  useEffectOnce(() => {
    onMountCallback();

    return () => {
      _onUnmountCallback.current();
    };
  });
};
