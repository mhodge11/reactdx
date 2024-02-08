import { useEffect, useLayoutEffect } from "react";

import { hasWindow } from "../../utils/hasWindow.ts";

/**
 * A `useLayoutEffect` hook that does not show warning when server-side rendering,
 * see [Alex Reardon's article](https://medium.com/@alexandereardon/uselayouteffect-and-ssr-192986cdcf7a)
 * for more info.
 *
 * @example
 * ```tsx
 * useIsomorphicLayoutEffect(() => {
 *   window.console.log(value)
 * }, [value]);
 * ```
 *
 * @param effect The effect to run
 * @param deps (Optional) The dependencies to watch for changes
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useIsomorphicLayoutEffect: (
  effect: React.EffectCallback,
  deps?: React.DependencyList
) => void = hasWindow() ? useLayoutEffect : useEffect;
