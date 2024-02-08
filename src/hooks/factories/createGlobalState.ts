import { useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  GlobalStore,
  UseGlobalStateReturn,
} from "../../types/factories.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import { isFunction } from "../../utils/isFunction.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";
import { useIsomorphicLayoutEffect } from "../lifecycles/useIsomorphicLayoutEffect.ts";

/**
 * Factory for creating a global state hook.
 * The factory accepts an initial state or a function that returns the initial state
 * and returns a hook that returns a tuple containing
 * the global state and a function to set the global state.
 *
 * @example
 * ```tsx
 * const useCounter = createGlobalState(0);
 *
 * const ComponentA = () => {
 *   const [count, setCount] = useCounter();
 *   // ...
 * }
 *
 * const ComponentB = () => {
 *   const [count, setCount] = useCounter();
 *   // ...
 * }
 *
 * const App = () => {
 *   return (
 *     <>
 *       <p>Those two counters share the same value.</p>
 *       <ComponentA />
 *       <ComponentB />
 *     </>
 *   );
 * }
 * ```
 *
 * @param initialState (Optional) The initial state or a function that returns the initial state
 * @returns A hook that returns a tuple containing the global state and a function to set the global state
 *
 * @category Factory
 * @since 0.0.1
 */
export function createGlobalState<TState = any>(
  initialState: HookStateInitAction<TState>
): () => UseGlobalStateReturn<TState>;
export function createGlobalState<
  TState = undefined,
>(): () => UseGlobalStateReturn<TState>;
export function createGlobalState<TState>(
  initialState?: TState
): () => UseGlobalStateReturn<TState> {
  const store: GlobalStore<TState> = {
    state: isFunction(initialState) ? initialState() : initialState,
    setState: (nextState: HookStateSetAction<TState>) => {
      store.state = resolveHookState(nextState, store.state);

      for (const setter of store.setters) {
        setter(store.state);
      }
    },
    setters: [],
  };

  return () => {
    const [globalState, stateSetter] = useState<TState | undefined>(
      store.state
    );

    useEffectOnce(() => {
      return () => {
        store.setters = store.setters.filter(setter => setter !== stateSetter);
      };
    });

    useIsomorphicLayoutEffect(() => {
      if (!store.setters.includes(stateSetter)) {
        store.setters.push(stateSetter);
      }
    });

    return [globalState, store.setState];
  };
}
