import { useMemo, useReducer, useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import type {
  CreateMethods,
  MethodAction,
  Methods,
  WrappedMethods,
} from "../../types/states.ts";

/**
 * React hook that simplifies the creation of reducer hooks.
 *
 * It takes a function that returns an object containing
 * methods that update the state and returns the state
 * and wrapped methods.
 *
 * The `createMethods` function takes the current state
 * and returns an object containing methods that return
 * the updated state.
 *
 * @example
 * ```tsx
 * const initialState = {
 *   count: 0,
 * };
 *
 * const createMethods = (state) => {
 *   return {
 *     reset() {
 *       return initialState;
 *     },
 *     increment() {
 *       return { ...state, count: state.count + 1 };
 *     },
 *     decrement() {
 *       return { ...state, count: state.count - 1 };
 *     },
 *   };
 * }
 *
 * const Component = () => {
 *   const [
 *     state,
 *     methods
 *   ] = useMethods(createMethods, initialState);
 *
 *   return (
 *     <>
 *       <p>Count: {state.count}</p>
 *       <button onClick={methods.decrement}>-</button>
 *       <button onClick={methods.increment}>+</button>
 *       <button onClick={methods.reset}>Reset</button>
 *     </>
 *   );
 * }
 * ```
 *
 * @param createMethods The create methods function
 * @param initialState The initial state
 * @returns A tuple containing the state and the wrapped methods
 *
 * @category State
 * @since 0.0.1
 */
export const useMethods = <TState, TMethods extends Methods>(
  createMethods: CreateMethods<TState, TMethods>,
  initialState: HookStateInitAction<TState>
) => {
  const resolvedInitialState = resolveHookState(initialState);

  const _createMethods = useRef(createMethods);
  const _initialState = useRef(resolvedInitialState);

  _createMethods.current = createMethods;
  _initialState.current = resolvedInitialState;

  const reducer = useMemo<React.Reducer<TState, MethodAction<TMethods>>>(
    () => (state: TState, action: MethodAction<TMethods>) =>
      _createMethods.current(state)[action.type](...(action.payload as any)),
    []
  );

  const [state, dispatch] = useReducer(reducer, resolvedInitialState);

  const wrapMethods = (): WrappedMethods<TMethods> => {
    const actionTypes = Object.keys(
      _createMethods.current(_initialState.current)
    );

    return actionTypes.reduce(
      (acc, type) => {
        acc[type] = payload => dispatch({ type, payload });
        return acc;
      },
      {} as Record<string, (...payload: any) => void>
    ) as WrappedMethods<TMethods>;
  };

  const _wrappedMethods = useRef<WrappedMethods<TMethods>>(wrapMethods());
  _wrappedMethods.current = wrapMethods();

  return [state, _wrappedMethods.current];
};
