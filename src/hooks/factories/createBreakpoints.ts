import { useState } from "react";

import { hasWindow } from "../../utils/hasWindow.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * The default breakpoints for the application.
 *
 * *Based on [TailwindCSS](https://tailwindcss.com/docs/responsive-design) defaults.*
 */
const defaultBreakpoints: Record<string, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * Sorts the breakpoints by width.
 *
 * @param breakpoints The breakpoints to sort
 * @returns The breakpoints sorted by width
 */
const sortBreakpoints = <TBreakpoints extends Record<string, number>>(
  breakpoints: TBreakpoints
): [key: string, width: number][] =>
  Object.entries(breakpoints).sort((a, b) => (a[1] >= b[1] ? 1 : -1));

/**
 * Returns the current breakpoint name based on the window width.
 *
 * @param sortedBreakpoints The breakpoints sorted by width
 * @param screenWidth The current screen width
 * @returns The current breakpoint name by the screen width
 */
const getCurrentBreakpoint = <TBreakpoints extends Record<string, number>>(
  sortedBreakpoints: [key: string, width: number][],
  screenWidth: number = 0
): keyof TBreakpoints =>
  sortedBreakpoints.reduce((acc, [key, width]) => {
    if (screenWidth >= width) {
      return key;
    }
    return acc;
  }, sortedBreakpoints[0]?.[0] ?? "");

/**
 * Factory for a hook that returns the current breakpoint name
 * based on the window width.
 *
 * The breakpoints default to [TailwindCSS](https://tailwindcss.com/docs/responsive-design) defaults:
 * ```ts
 * {
 *   sm: 640,
 *   md: 768,
 *   lg: 1024,
 *   xl: 1280,
 *   "2xl": 1536,
 * }
 * ```
 *
 * @example
 * ```tsx
 * const useBreakpoint = createBreakpoint();
 *
 * const Component = () => {
 *   const breakpoint = useBreakpoint();
 *
 *   return (
 *     <div>
 *       {breakpoint === "sm" && <p>Small breakpoint</p>}
 *       {breakpoint === "md" && <p>Medium breakpoint</p>}
 *       {breakpoint === "lg" && <p>Large breakpoint</p>}
 *       {breakpoint === "xl" && <p>Extra large breakpoint</p>}
 *       {breakpoint === "2xl" && <p>2x Extra large breakpoint</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @param breakpoints (Optional) The object of breakpoints to use
 * @returns The current breakpoint name
 *
 * @category Factory
 * @since 0.0.1
 */
export const createBreakpoints = <TBreakpoints extends Record<string, number>>(
  breakpoints: TBreakpoints = defaultBreakpoints as TBreakpoints
) =>
  hasWindow()
    ? (): keyof TBreakpoints => {
        const [screenWidth, setScreenWidth] = useState(window.innerWidth);

        useEffectOnce(() => {
          const onChange = () => {
            setScreenWidth(window.innerWidth);
          };

          onChange();

          on(window, "resize", onChange);

          return () => {
            off(window, "resize", onChange);
          };
        });

        return getCurrentBreakpoint(sortBreakpoints(breakpoints), screenWidth);
      }
    : (): keyof TBreakpoints => {
        warn("`createBreakpoints` is not supported on the server side.", {
          breakpoints,
        });

        return getCurrentBreakpoint(sortBreakpoints(breakpoints));
      };
