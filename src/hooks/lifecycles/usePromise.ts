import { useCallback } from "react";

import type { UsePromiseReturn } from "../../types/lifecycles.ts";

import { useMountedState } from "./useMountedState.ts";

/**
 * React Lifecycle hook that returns a helper function for wrapping promises.
 * Promises wrapped with this function will resolve only
 * when component is mounted.
 *
 * @example
 * ```tsx
 * const mounted = usePromise();
 * const [value, setValue] = useState();
 *
 * useEffect(() => {
 *   (async () => {
 *     const value = await mounted(promise);
 *     // below will not execute if component gets unmounted
 *     setValue(value);
 *   })();
 * });
 * ```
 *
 * @returns A function that wraps a promise and resolves only when component is mounted
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const usePromise = (): UsePromiseReturn => {
  const mounted = useMountedState();

  return useCallback<UsePromiseReturn>(
    (promise, onError?) =>
      new Promise((resolve, reject) => {
        promise.then(
          value => {
            if (mounted()) {
              resolve(value);
            }
          },
          error => {
            if (mounted()) {
              if (onError) {
                onError(error);
              } else {
                reject(error);
              }
            }
          }
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
};
