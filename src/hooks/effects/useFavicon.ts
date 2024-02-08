import { useEffect } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import { hasDocument } from "../../utils/hasDocument.ts";
import { warn } from "../../utils/warn.ts";

/**
 * React side-effect hook sets the favicon of the page.
 *
 * @example
 * ```tsx
 * useFavicon("https://cdn.sstatic.net/Sites/stackoverflow/img/favicon.ico");
 * ```
 *
 * @param href The URL of the favicon
 *
 * @category Effect
 * @since 0.0.1
 */
export const useFavicon = hasDocument()
  ? (href: HookStateInitAction<string>): void => {
      const hrefState = resolveHookState(href);

      useEffect(() => {
        const link: HTMLLinkElement =
          document.querySelector("link[rel*='icon']") ??
          document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        link.href = hrefState;
        document.getElementsByTagName("head")[0]?.appendChild(link);
      }, [hrefState]);
    }
  : (href: HookStateInitAction<string>): void => {
      warn("`useFavicon` is not supported on the server side.", { href });
    };
