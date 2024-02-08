import { createContext, createElement, useContext, useReducer } from "react";

import type {
  CreateReducerContextReturn,
  ReducerContext,
  ReducerContextProvider,
  ReducerContextProviderFactoryProps,
  ReducerContextProviderProps,
} from "../../types/factories.ts";
import { isNullOrUndefined } from "../../utils/isNullOrUndefined.ts";

/**
 * Factory for react context hooks that will behave
 * just like [React's useReducer](https://react.dev/reference/react/useReducer)
 * except the state will be shared among all
 * components in the provider.
 *
 * This allows you to have a shared state that
 * any component can update easily.
 *
 * @example
 * ```tsx
 * type Action = 'increment' | 'decrement';
 *
 * const reducer = (state: number, action: Action) => {
 *   switch (action) {
 *     case 'increment':
 *       return state + 1;
 *     case 'decrement':
 *       return state - 1;
 *     default:
 *       throw new Error();
 *   }
 * };
 *
 * const [useSharedCounter, SharedCounterProvider] = createReducerContext(reducer, 0);
 *
 * const ComponentA = () => {
 *   const [count, dispatch] = useSharedCounter();
 *   // ...
 * }
 *
 * const ComponentB = () => {
 *   const [count, dispatch] = useSharedCounter();
 *   // ...
 * }
 *
 * const App = () => {
 *   return (
 *     <SharedCounterProvider>
 *       <p>Those two counters share the same value.</p>
 *       <ComponentA />
 *       <ComponentB />
 *     </SharedCounterProvider>
 *   );
 * }
 * ```
 *
 * @param reducer The reducer function
 * @param defaultInitialState The default initial state
 * @returns A tuple containing the reducer hook, the reducer provider and the reducer context
 *
 * @category Factory
 * @since 0.0.1
 */
export const createReducerContext = <TReducer extends React.Reducer<any, any>>(
  reducer: TReducer,
  defaultInitialState: React.ReducerState<TReducer>
): CreateReducerContextReturn<TReducer> => {
  const context = createContext<ReducerContext<TReducer> | undefined>(
    undefined
  );

  const providerFactory = (
    props: ReducerContextProviderFactoryProps<TReducer>,
    children?: React.ReactNode
  ): ReducerContextProvider<TReducer> =>
    createElement(context.Provider, props, children);

  const ReducerProvider = (
    props: ReducerContextProviderProps<TReducer>
  ): ReducerContextProvider<TReducer> => {
    const state = useReducer<TReducer>(
      reducer,
      !isNullOrUndefined(props.initialState)
        ? props.initialState
        : defaultInitialState
    );
    return providerFactory({ value: state }, props.children);
  };

  const useReducerContext = (): ReducerContext<TReducer> => {
    const state = useContext(context);
    if (isNullOrUndefined(state)) {
      throw new Error(
        "`useReducerContext` must be used within a `ReducerProvider`"
      );
    }
    return state;
  };

  return [useReducerContext, ReducerProvider, context];
};
