import { useEffect } from "react";

/**
 * React lifecycle hook that runs an effect only once.
 *
 * Can be used to replace `componentDidMount`
 * and `componentWillUnmount`.
 *
 * This is equivalent to `useEffect(effect, [])`.
 *
 * @example
 * ```tsx
 * useEffectOnce(() => {
 *   console.log("Mounted!");
 *
 *   return () => {
 *     console.log("Unmounted!");
 *   }
 * })
 * ```
 *
 * @param effect The effect to run once
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useEffectOnce = (effect: React.EffectCallback): void => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};
