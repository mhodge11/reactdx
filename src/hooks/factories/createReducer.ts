import { useCallback, useRef, useState } from "react";

import type {
  CreateReducerReturn,
  ReducerDispatch,
  ReducerMiddleware,
  ReducerStore,
  UseReducerReturn,
} from "../../types/factories.ts";
import { useUpdateEffect } from "../lifecycles/useUpdateEffect.ts";

/**
 * Composes a middleware chain.
 *
 * @param chain The middleware chain
 * @returns A function that composes the middleware chain
 */
const composeMiddleware =
  <TAction, TState>(
    chain: ReducerMiddleware<TAction, TState>[]
  ): ((
    context: ReducerStore<TAction, TState>,
    dispatch: ReducerDispatch<TAction>
  ) => (action: TAction) => void) =>
  (
    context: ReducerStore<TAction, TState>,
    dispatch: ReducerDispatch<TAction>
  ): ((action: TAction) => void) =>
    chain.reduceRight((res, middleware) => middleware(context)(res), dispatch);

/**
 * Factory for reducer hooks with custom middleware
 * with an identical API as React's useReducer.
 *
 * Compatible with [Redux middleware](https://redux.js.org/tutorials/fundamentals/part-4-store#middleware).
 *
 * @example
 * ```tsx
 * import logger from 'redux-logger';
 * import thunk from 'redux-thunk';
 *
 * const useThunkReducer = createReducer(thunk, logger);
 *
 * const reducer = (state, action) => {
 *   switch (action.type) {
 *     case 'increment':
 *       return { count: state.count + 1 };
 *     case 'decrement':
 *       return { count: state.count - 1 };
 *     case 'reset':
 *       return { count: action.payload };
 *     default:
 *       throw new Error();
 *   }
 * }
 *
 * const Component = () => {
 *   // Action creator to increment count
 *   const addAndReset = useCallback(() => {
 *     return dispatch => {
 *       dispatch({ type: 'increment' });
 *
 *       setTimeout(() => {
 *         dispatch({ type: 'reset', payload: initialCount });
 *       }, 1000);
 *     };
 *   }, [initialCount]);
 *
 *   const [state, dispatch] = useThunkReducer(
 *     reducer,
 *     initialCount
 *   );
 *
 *   // ...
 * }
 * ```
 *
 * @param middlewares The middlewares to use
 * @returns A reducer hook that uses the given middlewares
 *
 * @category Factory
 * @since 0.0.1
 */
export const createReducer = <TAction, TState>(
  ...middlewares: ReducerMiddleware<TAction, TState>[]
): CreateReducerReturn<TAction, TState> => {
  const middleware = composeMiddleware(middlewares);

  return (
    reducer: (state: TState, action: TAction) => TState,
    initialState: TState,
    initializer: (state: TState) => TState = (state: TState) => state
  ): UseReducerReturn<TAction, TState> => {
    const _state = useRef(initializer(initialState));
    const [, setState] = useState(_state.current);

    const dispatch = useCallback<ReducerDispatch<TAction>>(
      action => {
        _state.current = reducer(_state.current, action);
        setState(_state.current);
        return action;
      },
      [reducer]
    );

    const _dispatch: React.MutableRefObject<ReducerDispatch<TAction>> = useRef(
      middleware(
        {
          getState: () => _state.current,
          dispatch: (...args: [TAction]) => _dispatch.current(...args),
        },
        dispatch
      )
    );

    useUpdateEffect(() => {
      _dispatch.current = middleware(
        {
          getState: () => _state.current,
          dispatch: (...args: [TAction]) => _dispatch.current(...args),
        },
        dispatch
      );
    }, [dispatch]);

    return [_state.current, _dispatch.current];
  };
};
