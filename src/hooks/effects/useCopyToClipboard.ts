import { useCallback } from "react";

import { copyToClipboard } from "../../logic/copyToClipboard.ts";
import type { UseCopyToClipboardReturn } from "../../types/effects.ts";
import { hasNavigator } from "../../utils/hasNavigator.ts";
import { isNumber } from "../../utils/isNumber.ts";
import { isString } from "../../utils/isString.ts";
import { warn } from "../../utils/warn.ts";
import { useMountedState } from "../lifecycles/useMountedState.ts";
import { useSetState } from "../states/useSetState.ts";

/**
 * React hook that copies text to the clipboard.
 *
 * **Explanation**
 *
 * The state has the following shape:
 * - **`noUserInteraction: boolean`** - Indicates if user interaction was required
 * to copy the value to clipboard to expose full Clipboard API functionality.
 * - **`value?: string`** - The value that was copied to the clipboard.
 * - **`error?: Error`** - The error that occurred during the copy to clipboard operation.
 *
 * @example
 * ```tsx
 * const [state, copyToClipboard] = useCopyToClipboard();
 *
 * return (
 *   <div>
 *     <button
 *       onClick={() => copyToClipboard('Hello, world!')}
 *     >
 *       Copy to clipboard
 *     </button>
 *     <p>
 *       {state.error
 *         ? `An error occurred: ${state.error.message}`
 *         : `Copied ${state.value} to clipboard`}
 *     </p>
 *   </div>
 * );
 * ```
 *
 * @returns A tuple containing the state of the copy to clipboard operation and a function to copy text to the clipboard
 *
 * @category Effect
 * @since 0.0.1
 */
export const useCopyToClipboard = hasNavigator
  ? (): UseCopyToClipboardReturn => {
      const mounted = useMountedState();
      const [state, setState] = useSetState<UseCopyToClipboardReturn[0]>({
        value: undefined,
        error: undefined,
        noUserInteraction: true,
      });

      const copy = useCallback<UseCopyToClipboardReturn[1]>(value => {
        if (!mounted()) {
          return;
        }

        if (!isString(value) && !isNumber(value)) {
          const error = new Error(
            `Cannot copy typeof ${typeof value} to clipboard, must be a string`
          );
          warn(error.message, { value });
          setState({ value: undefined, error, noUserInteraction: true });
          return;
        }
        // empty strings are also considered invalid
        else if (value === "") {
          const error = new Error(`Cannot copy empty string to clipboard.`);
          warn(error.message, { value });
          setState({ value: undefined, error, noUserInteraction: true });
          return;
        }

        const normalizedValue = value.toString();
        copyToClipboard(normalizedValue, {
          onSuccess: () => {
            if (!mounted()) {
              return;
            }

            setState({
              value: normalizedValue,
              error: undefined,
              noUserInteraction: true,
            });
          },
          onError: error => {
            if (!mounted()) {
              return;
            }

            setState({
              value: undefined,
              error,
              noUserInteraction: false,
            });
          },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return [state, copy];
    }
  : (): UseCopyToClipboardReturn => {
      warn(
        "The `useCopyToClipboard` hook is not supported in this environment because the environment does not support `navigator.clipboard.writeText`."
      );

      return [
        { value: undefined, error: undefined, noUserInteraction: true },
        (value: string | number) => {
          warn(
            `Tried to copy '${value}' to clipboard, but the current environment does not support \`navigator.clipboard.writeText\`.`,
            { value }
          );
        },
      ];
    };
