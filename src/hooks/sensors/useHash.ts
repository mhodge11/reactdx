import { useCallback, useRef, useState } from "react";

import type { UseHashReturn } from "../../types/sensors.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useLifecycles } from "../lifecycles/useLifecycles.ts";

/**
 * React sensor hook that listens to the `window.location.hash` value.
 *
 * Returns the current hash and a callback to update the hash.
 *
 * @example
 * ```tsx
 * const [hash, updateHash] = useHash();
 *
 * useMount(() => {
 *   setHash('#/path/to/page?userId=123');
 * });
 * ```
 *
 * @returns A tuple containing the current hash and a callback to update the hash
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useHash = hasWindow()
  ? (): UseHashReturn => {
      const [hash, setHash] = useState(() => window.location.hash);

      const _hash = useRef(hash);
      _hash.current = hash;

      const onHashChange = useCallback(() => {
        setHash(window.location.hash);
      }, []);

      useLifecycles(
        () => on(window, "hashchange", onHashChange),
        () => off(window, "hashchange", onHashChange)
      );

      const updateHash = useCallback((newHash: string) => {
        if (newHash !== _hash.current) {
          window.location.hash = newHash;
        }
      }, []);

      return [hash, updateHash];
    }
  : (): UseHashReturn => {
      warn("`useHash` is not supported on the server side.");
      return [
        "",
        (newHash: string) => {
          warn(
            `Attempted to set hash to '${newHash}' in an unsupported environment`,
            { newHash }
          );
        },
      ];
    };
