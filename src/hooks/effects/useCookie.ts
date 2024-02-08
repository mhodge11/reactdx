import { useCallback, useRef, useState } from "react";

import { Cookies } from "../../logic/cookies.ts";
import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { UseCookieReturn } from "../../types/effects.ts";
import { hasDocument } from "../../utils/hasDocument.ts";
import { noop } from "../../utils/noop.ts";
import { warn } from "../../utils/warn.ts";

/**
 * React hook that returns the current value of a `cookie`,
 * a callback to update the `cookie` and a callback to delete the `cookie`.
 *
 * @example
 * ```tsx
 * const [
 *   value,
 *   updateCookie,
 *   deleteCookie
 * ] = useCookie("my-cookie");
 *
 * const [counter, setCounter] = useState(1);
 *
 * useEffect(() => {
 *   deleteCookie();
 * }, []);
 *
 * const updateCookieHandler = () => {
 *   updateCookie(`my-awesome-cookie-${counter}`);
 *   setCounter(c => c + 1);
 * };
 *
 * return (
 *   <div>
 *     <p>Value: {value}</p>
 *     <button onClick={updateCookieHandler}>
 *       Update Cookie
 *     </button>
 *     <br />
 *     <button onClick={deleteCookie}>
 *       Delete Cookie
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @param cookieName The name of the `cookie`
 * @returns A tuple containing the current value of the `cookie`, a callback to update the `cookie` and a callback to delete the `cookie`
 *
 * @category Effect
 * @since 0.0.1
 */
export const useCookie = hasDocument()
  ? (cookieName: string): UseCookieReturn => {
      const [value, setValue] = useState<string | undefined>(() =>
        Cookies.get(cookieName)
      );

      const _value = useRef(value);
      _value.current = value;

      const updateCookie = useCallback<UseCookieReturn[1]>(
        (newValue, options?) => {
          const resolvedNewValue = resolveHookState(newValue, _value.current);
          Cookies.set(cookieName, resolvedNewValue, options);
          setValue(resolvedNewValue);
        },
        [cookieName]
      );

      const deleteCookie = useCallback<UseCookieReturn[2]>(() => {
        Cookies.remove(cookieName);
        setValue(undefined);
      }, [cookieName]);

      return [value, updateCookie, deleteCookie];
    }
  : (cookieName: string): UseCookieReturn => {
      warn("Cookie not supported in this environment", { cookieName });
      return [
        undefined,
        (
          newValue: Parameters<UseCookieReturn[1]>[0],
          options?: Parameters<UseCookieReturn[1]>[1]
        ) => {
          warn(
            `Attempted to set cookie '${cookieName}' to '${newValue}' in an unsupported environment`,
            { cookieName, newValue, options }
          );
        },
        noop,
      ];
    };
