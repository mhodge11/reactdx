import type { ScrollbarWidth } from "../types/logic.ts";
import { isNumber } from "../utils/isNumber.ts";

/**
 * Gets the width of the scrollbar in pixels.
 *
 * This function will return `undefined` if the DOM is not ready yet.
 *
 * ***Note:** This function will always return `0` on mobile browsers,
 * as mobile browsers do not have a visible scrollbar.*
 *
 * @example
 * ```ts
 * const width = scrollbarWidth();
 * ```
 *
 * @param force (Optional) Whether to force the recalculation of the scrollbar width (Defaults to `false`
 * @returns The width of the scrollbar in pixels, or `undefined` if the DOM is not ready yet.
 */
export const scrollbarWidth: ScrollbarWidth = (
  force?: boolean
): number | undefined => {
  // safety check for SSR
  if (typeof document === "undefined") {
    return 0;
  }

  // one more safety check. If document has no body element that means script tag been
  // included before the </body> tag, which in general means that DOM is not ready yet.
  // Furthermore check the document's ready state in case it is presented [IE9+]
  // any interactivity [not 'loading'] will be okay for us
  if (
    !document.body ||
    (document.readyState && document.readyState === "loading")
  ) {
    return undefined;
  }

  // return cached value if we have some
  if (force !== true && isNumber(scrollbarWidth.cache)) {
    return scrollbarWidth.cache;
  }

  const el = document.createElement("div");
  const { style } = el;

  // for the case of weird css rules where div will not be a block element.
  style.display = "block";
  style.position = "absolute";
  style.width = "100px";
  style.height = "100px";
  style.left = "-999px";
  style.top = "-999px";
  style.overflow = "scroll";

  document.body.insertBefore(el, null);

  const { clientWidth } = el;

  // if element still has no width it means DOM is not ready yet
  /* istanbul ignore next */
  if (clientWidth === 0) {
    // remove the element and skip the caching
    document.body.removeChild(el);
    return undefined;
  }

  // clientWidth is the total width of the block - scrollbar width, thus, to get the scrollbar width
  // it works well for desktop, but in mobile browsers scrollbar as absolutely positioned and i
  // dont know ant way to determine mobile browser's scrollbar width, so for mobile that value will be always 0.
  scrollbarWidth.cache = 100 - clientWidth;

  document.body.removeChild(el);

  return scrollbarWidth.cache;
};
