import { useCallback, useState } from "react";

import type { UseAsyncRetryReturn } from "../../types/effects.ts";
import type { GenericAsyncFunction } from "../../types/utils.ts";
import { warn } from "../../utils/warn.ts";

import { useAsync } from "./useAsync.ts";

/**
 * A react hook that uses `{@link useAsync}` with an additional
 * `retry` method to easily retry/refresh the async function.
 *
 * @example
 * ```tsx
 * const [state, retry] = useAsyncRetry(async () => {
 *   const response = await fetch(url);
 *   const result = await response.text();
 *   return result;
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
 *     {!loading &&
 *       <button onClick={retry}>Start loading</button>
 *     }
 *   </div>
 * );
 * ```
 *
 * @param fn The async function to call
 * @param deps The dependencies to watch for changes to call the async function
 * @returns A tuple containing the state of the async function and a callback to retry the async function
 *
 * @category Effect
 * @since 0.0.1
 */
export const useAsyncRetry = <TAsyncFunc extends GenericAsyncFunction>(
  callback: TAsyncFunc,
  deps: React.DependencyList = []
): UseAsyncRetryReturn<TAsyncFunc> => {
  const [attempt, setAttempt] = useState(0);

  const state = useAsync(callback, [...deps, attempt]);

  const stateLoading = state.loading;

  const retry = useCallback(() => {
    if (stateLoading) {
      warn(
        "You are calling the `useAsyncRetry` hook `retry()` method while loading in progress, this is a no-op."
      );
      return;
    }

    setAttempt(currentAttempt => currentAttempt + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, stateLoading]);

  return [state, retry];
};
