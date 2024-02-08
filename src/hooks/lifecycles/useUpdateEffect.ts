import { useEffect } from "react";

import { useFirstMountState } from "../states/useFirstMountState.ts";

/**
 * React effect hook that ignores the first invocation (e.g. on mount).
 * The signature is exactly the same as the useEffect hook.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 *
 * useUpdateEffect(() => {
 *   console.log('count', count) // will only show 1 and beyond
 *
 *   return () => { // OPTIONAL
 *     // do something on unmount
 *   }
 * }) // you can include deps array if necessary
 * ```
 *
 * @param effect The effect to run on update
 * @param deps (Optional) The dependencies to watch for changes
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useUpdateEffect = (
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void => {
  const isFirstMount = useFirstMountState();

  useEffect(() => {
    if (!isFirstMount) {
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
