import { useEffect, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { isUndefined } from "../../utils/isUndefined.ts";
import { warn } from "../../utils/warn.ts";

/**
 * Gets the initial state of the media query.
 *
 * @param query The media query to match
 * @param defaultState The default state to return when server side rendering
 * @returns `true` if the media query matches, otherwise `false`
 */
const getInitialState = (query: string, defaultState?: boolean): boolean => {
  // Prevent a React hydration mismatch when a default value is provided by
  // not defaulting to window.matchMedia(query).matches.
  if (!isUndefined(defaultState)) {
    return defaultState;
  }

  if (hasWindow()) {
    return window.matchMedia(query).matches;
  }

  // A default value has not been provided, and you are rendering on the server,
  // warn of a possible hydration mismatch when defaulting to false.
  warn(
    "`useMedia` When server side rendering, defaultState should be defined to prevent a hydration mismatches."
  );

  return false;
};

/**
 * React sensor hook that tracks state of a CSS media query.
 *
 * @example
 * ```tsx
 * const isWide = useMedia("(min-width: 800px)");
 *
 * return (
 *   <div>
 *     {isWide ? "🖥️" : "📱"}
 *   </div>
 * );
 * ```
 *
 * @param query The media query to match
 * @param defaultState The default state to return when server side rendering
 * @returns `true` if the media query matches, otherwise `false`
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useMedia = (
  query: string,
  defaultState?: HookStateInitAction<boolean>
): boolean => {
  const [state, setState] = useState(
    getInitialState(query, resolveHookState(defaultState))
  );

  useEffect(() => {
    let mounted = true;
    const mql = window.matchMedia(query);

    const onChange = () => {
      if (mounted) {
        setState(!!mql.matches);
      }
    };

    mql.addEventListener("change", onChange);
    setState(!!mql.matches);

    return () => {
      mounted = false;
      mql.removeEventListener("change", onChange);
    };
  }, [query]);

  return state;
};
