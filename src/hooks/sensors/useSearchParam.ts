import { useEffect, useState } from "react";

import { hasWindow } from "../../utils/hasWindow.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";

/**
 * Gets the value of a search param from a search string.
 *
 * @param search The search string to parse
 * @param param The search param to get
 * @returns The value of the search param
 */
const getValue = (search: string, param: string) =>
  new URLSearchParams(search).get(param);

/**
 * React sensor hook that tracks browser's location search param.
 *
 * ***Note:** When using a hash router,
 * like `react-router`'s `[<HashRouter>](https://reactrouter.com/en/main/router-components/hash-router)`,
 * this hook won't be able to read the search parameters as
 * they are considered part of the hash of the URL by browsers.*
 *
 * @example
 * ```tsx
 * const edit = useSearchParam('edit');
 *
 * return (
 *   <div>
 *     <div>edit: {edit ?? "🤷‍♂️"}</div>
 *     <div>
 *       <button
 *         onClick={
 *           () =>
 *             history.pushState(
 *               {},
 *               "",
 *               location.pathname + "?edit=123"
 *             )
 *         }
 *       >
 *         Edit post 123 (?edit=123)
 *       </button>
 *     </div>
 *     <div>
 *       <button
 *         onClick={
 *           () =>
 *             history.pushState(
 *               {},
 *               "",
 *               location.pathname + "?edit=999"
 *             )
 *         }
 *       >
 *         Edit post 999 (?edit=999)
 *       </button>
 *     </div>
 *     <div>
 *       <button
 *         onClick={
 *           () =>
 *             history.pushState(
 *               {},
 *               "",
 *               location.pathname
 *             )
 *         }
 *        >
 *          Close modal
 *        </button>
 *     </div>
 *   </div>
 * );
 * ```
 *
 * @param param The search param to track
 * @returns The value of the search param, or `null` if it doesn't exist
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useSearchParam = hasWindow()
  ? (param: string): string | null => {
      const [value, setValue] = useState<string | null>(() =>
        getValue(window.location.search, param)
      );

      useEffect(() => {
        const onChange = () =>
          setValue(getValue(window.location.search, param));

        on(window, "popstate", onChange);
        on(window, "pushState", onChange);
        on(window, "replaceState", onChange);

        return () => {
          off(window, "popstate", onChange);
          off(window, "pushState", onChange);
          off(window, "replaceState", onChange);
        };
      }, [param]);

      return value;
    }
  : (param: string): string | null => {
      warn(
        "`useSearchParam` is not supported when no global `window` object exists.",
        { param }
      );
      return null;
    };
