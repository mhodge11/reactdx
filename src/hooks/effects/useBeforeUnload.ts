import { useCallback, useEffect } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";

/**
 * React side-effect hook that shows browser alert when
 * user try to reload or close the page.
 *
 * ***Note:** Since every `dirtyFn` change registers a new callback,
 * you should use refs if your test value changes often.*
 *
 * @example
 * ```tsx
 * // Dirty state
 *
 * const [dirty, toggleDirty] = useBoolean(false);
 *
 * useBeforeUnload(
 *   dirty,
 *   "You have unsaved changes, are you sure?"
 * );
 *
 * return (
 *   <div>
 *     {dirty && <p>Try to reload or close tab</p>}
 *     <button onClick={toggleDirty}>
 *       {dirty ? "Disable" : "Enable"}
 *     </button>
 *   </div>
 * );
 *
 * // Dirty function
 *
 * const [dirty, toggleDirty] = useBoolean(false);
 *
 * const dirtyFn = useCallback(() => dirty, [dirty]);
 *
 * useBeforeUnload(
 *   dirtyFn,
 *   "You have unsaved changes, are you sure?"
 * );
 *
 * return (
 *   <div>
 *     {dirty && <p>Try to reload or close tab</p>}
 *     <button onClick={toggleDirty}>
 *       {dirty ? "Disable" : "Enable"}
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @param enabled Whether to enable the beforeunload event
 * @param message The message to show when the user tries to reload or close the page
 *
 * @category Effect
 * @since 0.0.1
 */
export const useBeforeUnload = hasWindow()
  ? (enabled: HookStateInitAction<boolean> = true, message?: string): void => {
      const enabledState = resolveHookState(enabled);

      const handler = useCallback(
        (event: BeforeUnloadEvent): string | undefined => {
          if (!enabledState) {
            return;
          }

          if (event?.preventDefault) {
            event.preventDefault();
          }

          if (message) {
            event.returnValue = message;
          }

          return message;
        },
        [enabledState, message]
      );

      useEffect(() => {
        if (!enabledState) {
          return;
        }

        on(window, "beforeunload", handler);

        return () => {
          off(window, "beforeunload", handler);
        };
      }, [enabledState, handler]);
    }
  : (enabled: HookStateInitAction<boolean> = true, message?: string): void => {
      warn("`useBeforeUnload` is not supported on the server side.", {
        enabled,
        message,
      });
    };
