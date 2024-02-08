import { useCallback, useRef, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { UseAsyncFnReturn } from "../../types/effects.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import type { GenericAsyncFunction } from "../../types/utils.ts";
import { useMountedState } from "../lifecycles/useMountedState.ts";

/**
 * React hook that returns state and a callback for an `async` function
 * or a function that returns a `promise`. The state is of
 * the same shape as `{@link useAsync}`.
 *
 * @example
 * ```tsx
 * const [state, doFetch] = useAsyncFn(async () => {
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
 *     <button onClick={() => doFetch()}>
 *       Start loading
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @param fn The async function to use
 * @param deps The dependencies of the async function that will trigger a re-render
 * @param initialState The initial state of the async function
 * @returns A tuple containing the async function state and the async function callback
 *
 * @category Effect
 * @since 0.0.1
 */
export const useAsyncFn = <TAsyncFunc extends GenericAsyncFunction>(
  callback: TAsyncFunc,
  deps: React.DependencyList = [],
  initialState: HookStateInitAction<UseAsyncFnReturn<TAsyncFunc>[0]> = {
    loading: false,
  }
): UseAsyncFnReturn<TAsyncFunc> => {
  const mounted = useMountedState();

  const [state, setState] = useState<UseAsyncFnReturn<TAsyncFunc>[0]>(
    resolveHookState(initialState)
  );

  const _lastCallId = useRef(0);
  const _callback = useRef(callback);
  const _loading = useRef(state.loading);

  _callback.current = callback;
  _loading.current = state.loading;

  const asyncCallback = useCallback<UseAsyncFnReturn<TAsyncFunc>[1]>(
    (...args) => {
      const callId = ++_lastCallId.current;

      if (!_loading.current) {
        setState(
          prevState =>
            ({
              ...prevState,
              loading: false,
            }) as UseAsyncFnReturn<TAsyncFunc>[0]
        );
      }

      return _callback.current(...(args as any)).then(
        value => {
          if (mounted() && callId === _lastCallId.current) {
            setState({
              value,
              loading: false,
            });
          }

          return value;
        },
        error => {
          if (mounted() && callId === _lastCallId.current) {
            setState({
              error,
              loading: false,
            });
          }

          return error;
        }
      ) as ReturnType<TAsyncFunc>;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  return [state, asyncCallback];
};
