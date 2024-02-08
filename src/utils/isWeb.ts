import { hasDocument } from "./hasDocument.ts";
import { hasWindow } from "./hasWindow.ts";

/**
 * Checks if the global objects match that of a browser.
 *
 * @returns `true` if the global objects match that of a browser, `false` otherwise
 */
export const isWeb = (): boolean => {
  try {
    return (
      hasWindow() && hasDocument() && typeof window.HTMLElement !== "undefined"
    );
  } catch {
    return false;
  }
};
