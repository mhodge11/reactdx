import { useEffect, useRef } from "react";

import { isWeb } from "../../utils/isWeb.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";

/**
 * React sensor hook that fires a callback when mouse leaves the page.
 *
 * @example
 * ```tsx
 * usePageLeave(() => console.log("Left page..."));
 * ```
 *
 * @param onPageLeave Callback to be called when the user leaves the page
 * @param deps The dependencies to watch for changes to re-attach the event listener
 */
export const usePageLeave = isWeb()
  ? (onPageLeave: () => void, deps: React.DependencyList = []): void => {
      const _onPageLeave = useRef(onPageLeave);
      _onPageLeave.current = onPageLeave;

      useEffect(() => {
        if (!_onPageLeave.current) {
          return;
        }

        const handler = (event?: MouseEvent) => {
          event = event ? event : (window.event as MouseEvent);

          const from = event?.relatedTarget ?? (event as any)?.toElement;

          if (!from || from.nodeName === "HTML") {
            _onPageLeave.current();
          }
        };

        on(document, "mouseout", handler);

        return () => {
          off(document, "mouseout", handler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, deps);
    }
  : (onPageLeave: () => void, deps: React.DependencyList = []): void => {
      warn(
        "`usePageLeave` won't work if the global `document` object is not defined.",
        { deps }
      );
    };
