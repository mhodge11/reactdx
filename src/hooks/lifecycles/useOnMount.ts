import { useEffectOnce } from "./useEffectOnce.ts";

/**
 * React lifecycle hook that calls a callback function
 * after the component is mounted.
 *
 * Use `{@link useLifecycles}` if you need
 * both a mount and unmount function.
 *
 * @example
 * ```tsx
 * useOnMount(() => {
 *   console.log("Mounted!");
 * })
 * ```
 *
 * @param callback The callback to run on mount
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useOnMount = (callback: () => void): void => {
  useEffectOnce(() => {
    callback();
  });
};
