import { createContext, createElement, useContext, useState } from "react";

import type {
  CreateStateContextReturn,
  StateContext,
  StateContextProvider,
  StateContextProviderFactoryProps,
  StateContextProviderProps,
} from "../../types/factories.ts";
import { isNullOrUndefined } from "../../utils/isNullOrUndefined.ts";

/**
 * Factory for react context hooks that will behave
 * just like [React's useState](https://react.dev/reference/react/useState)
 * except the state will be shared among
 * all components in the provider.
 *
 * This allows you to have a shared state
 * that any component can update easily.
 *
 * @example
 * ```tsx
 * const [useSharedText, SharedTextProvider] = createStateContext('');
 *
 * const ComponentA = () => {
 *   const [text, setText] = useSharedText();
 *   // ...
 * }
 *
 * const ComponentB = () => {
 *   const [text, setText] = useSharedText();
 *   // ...
 * }
 *
 * const App = () => {
 *   return (
 *     <SharedTextProvider>
 *       <p>Those two components share the same value.</p>
 *       <ComponentA />
 *       <ComponentB />
 *     </SharedTextProvider>
 *   );
 * }
 * ```
 *
 * @param defaultInitialValue The default initial state value
 * @returns A tuple containing the state hook, the state provider and the state context
 *
 * @category Factory
 * @since 0.0.1
 */
export const createStateContext = <TState>(
  defaultInitialState: TState
): CreateStateContextReturn<TState> => {
  const context = createContext<StateContext<TState> | undefined>(undefined);

  const providerFactory = (
    props: StateContextProviderFactoryProps<TState>,
    children?: React.ReactNode
  ): StateContextProvider<TState> =>
    createElement(context.Provider, props, children);

  const StateProvider = (
    props: StateContextProviderProps<TState>
  ): StateContextProvider<TState> => {
    const state = useState<TState>(
      !isNullOrUndefined(props.initialState)
        ? props.initialState
        : defaultInitialState
    );
    return providerFactory({ value: state }, props.children);
  };

  const useStateContext = (): StateContext<TState> => {
    const state = useContext(context);
    if (isNullOrUndefined(state)) {
      throw new Error(
        "`useStateContext` must be used within a `StateProvider`"
      );
    }
    return state;
  };

  return [useStateContext, StateProvider, context];
};
