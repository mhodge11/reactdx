import { useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { UseTitleOptions } from "../../types/effects.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import { hasDocument } from "../../utils/hasDocument.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * The default title options.
 */
const defaultOptions: UseTitleOptions = {
  restoreOnUnmount: false,
};

/**
 * React side-effect hook that sets the document title.
 *
 * @example
 * ```tsx
 * // Sets the title to "My Title"
 * useTitle("My Title");
 *
 * // Sets the title to "My Title" and
 * // restores the previous title on unmount
 * useTitle("My Title", { restoreOnUnmount: true });
 * ```
 *
 * @param title The title to set
 * @param options (Optional) The options for the title
 * @param options.restoreOnUnmount (Optional) Whether to restore the title on unmount (Defaults to `false`)
 *
 * @category Effect
 * @since 0.0.1
 */
export const useTitle = hasDocument()
  ? (
      title: HookStateInitAction<string>,
      options: UseTitleOptions = defaultOptions
    ): void => {
      const titleState = resolveHookState(title);

      const _initialTitle = useRef(document.title);
      const _restoreOnUnmount = useRef(options.restoreOnUnmount);

      _restoreOnUnmount.current = options.restoreOnUnmount;

      if (document.title !== titleState) {
        document.title = titleState;
      }

      useEffectOnce(() => {
        return () => {
          if (
            _restoreOnUnmount.current &&
            document.title !== _initialTitle.current
          ) {
            document.title = _initialTitle.current;
          }
        };
      });
    }
  : (
      title: HookStateInitAction<string>,
      options: UseTitleOptions = defaultOptions
    ): void => {
      warn(
        "The `useTitle` hook should be used in a browser environment. The title will not be updated.",
        { title, options }
      );
    };
