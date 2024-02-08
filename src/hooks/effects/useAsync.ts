import { useEffect } from "react";

import type { UseAsyncReturn } from "../../types/effects.ts";
import type { GenericAsyncFunction } from "../../types/utils.ts";

import { useAsyncFn } from "./useAsyncFn.ts";

/**
 * React hook that resolves an async function or a function
 * that returns a promise.
 *
 * @example
 * ```tsx
 * const state = useAsync(async () => {
 *   const response = await fetch(url);
 *   const result = await response.text();
 *   return result
 * }, [url]);
 *
 * return (
 *   <div>
 *     {state.loading
 *       ? <div>Loading...</div>
 *       : state.error
 *         ? <div>Error: {state.error.message}</div>
 *         : <div>Value: {state.value}</div>
 *     }
 *   </div>
 * );
 * ```
 *
 * @param fn The async function to call
 * @param deps The dependencies to watch for changes to call the async function
 * @returns The state of the async function
 *
 * @category Effect
 * @since 0.0.1
 */
export const useAsync = <TAsyncFunc extends GenericAsyncFunction>(
  callback: TAsyncFunc,
  deps: React.DependencyList = []
): UseAsyncReturn<TAsyncFunc> => {
  const [state, callbackFn] = useAsyncFn(callback, deps, { loading: true });

  useEffect(() => {
    callbackFn();
  }, [callbackFn]);

  return state;
};
