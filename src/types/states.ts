import type { HookStateInitAction, HookStateSetAction } from "./logic.ts";

/**
 * Type alias for the return value of the {@link useDefault} hook.
 */
export type UseDefaultReturn<TState> = [
  /**
   * The state, which will be the default value if the state is `undefined` or `null`.
   */
  state: TState,
  /**
   * The state setter.
   */
  setState: React.Dispatch<React.SetStateAction<TState | undefined | null>>,
];

/**
 * Type alias for the return value of the {@link useGetSet} hook.
 */
export type UseGetSetReturn<TState> = [
  /**
   * The state getter function.
   */
  get: () => TState,
  /**
   * The state setter function.
   */
  set: React.Dispatch<HookStateSetAction<TState>>,
];

/**
 * Type alias for the return value of the {@link useGetSetState} hook.
 */
export type UseGetSetStateReturn<TState extends {}> = [
  /**
   * The state getter function.
   */
  get: () => TState,
  /**
   * The state setter function, which can be called with a partial state or a state updater function.
   * It will merge the new state with the previous one.
   */
  setState: (
    patch: Partial<TState> | ((prevState: TState) => Partial<TState>)
  ) => void,
];

/**
 * Type alias for the comparator passed to the {@link usePreviousDistinct} hook.
 *
 * @param prev The previous state
 * @param next The next state
 * @returns `true` if the states are different, `false` otherwise
 */
export type UsePreviousDistinctComparator<T> = (
  prev: T | undefined,
  next: T
) => boolean;

/**
 * Type alias for the return value of the {@link useSetState} hook.
 */
export type UseSetStateReturn<TState extends {}> = [
  /**
   * The state.
   */
  state: TState,
  /**
   * The state setter, which can be called with a partial state or a state updater function.
   * It will merge the new state with the previous one.
   */
  setState: (
    patch: Partial<TState> | ((prevState: TState) => Partial<TState>)
  ) => void,
];

/**
 * Type alias for the return value of the {@link useRafState} hook.
 */
export type UseRafStateReturn<TState> = [
  /**
   * The raf state.
   */
  rafState: TState,
  /**
   * The raf state setter.
   */
  setRafState: React.Dispatch<HookStateSetAction<TState>>,
];

/**
 * Type alias for the observable object used by the {@link useObservable} hook.
 */
export interface Observable<T> {
  /**
   * Subscribe to the observable.
   *
   * @param listener The listener to subscribe to
   * @returns The unsubscribe function
   */
  subscribe: (listener: (value: T) => void) => {
    /**
     * Unsubscribe from the observable.
     */
    unsubscribe: () => void;
  };
}

/**
 * Type alias for the return value of the {@link useStateList} hook.
 */
export interface UseStateListReturn<TState> {
  /**
   * The current state.
   */
  readonly state: TState;
  /**
   * The current index.
   */
  readonly currentIndex: number;
  /**
   * Whether the current state is the first one.
   */
  readonly isFirst: boolean;
  /**
   * Whether the current state is the last one.
   */
  readonly isLast: boolean;
  /**
   * Set the state at a given index.
   *
   * @param index The index to set the state to
   */
  setStateAt: (index: number) => void;
  /**
   * Set the state to the one matching the passed in state value.
   *
   * @param state The state to set the current state to
   */
  setState: (state: HookStateInitAction<TState>) => void;
  /**
   * Set the state to the next one in the list.
   */
  next: () => void;
  /**
   * Set the state to the previous one in the list.
   */
  prev: () => void;
}

/**
 * Type alias for the return value of the {@link useBoolean} hook.
 */
export type UseBooleanReturn = [
  /**
   * The state.
   */
  state: boolean,
  /**
   * The state setter. If no value is passed, it will toggle the state.
   */
  toggleState: React.Dispatch<HookStateSetAction<boolean>>,
];

/**
 * Type alias for the actions returned by the {@link useNumber} hook.
 */
export interface UseNumberActions {
  /**
   * Increment the number.
   *
   * @param delta The amount to increment by
   */
  inc: (delta?: HookStateSetAction<number>) => void;
  /**
   * Decrement the number.
   *
   * @param delta The amount to decrement by
   */
  dec: (delta?: HookStateSetAction<number>) => void;
  /**
   * Get the current number value of the state.
   */
  get: () => number;
  /**
   * Set a new number as the state.
   *
   * @param value The new number to set
   */
  set: (value: HookStateSetAction<number>) => void;
  /**
   * Reset the number to the initial value.
   *
   * @param value The new initial value. If not passed, the initial value will be used
   */
  reset: (value?: HookStateInitAction<number>) => void;
}

/**
 * Type alias for the options passed to the {@link useNumber} hook.
 */
export interface UseNumberOptions {
  /**
   * The minimum value the number can be.
   */
  min?: number;
  /**
   * The maximum value the number can be.
   */
  max?: number;
  /**
   * The step value for the number to increment or decrement by.
   */
  step?: number;
}

/**
 * Type alias for the return value of the {@link useNumber} hook.
 */
export type UseNumberReturn = [
  /**
   * The state.
   */
  state: number,
  /**
   * The state actions.
   */
  actions: UseNumberActions,
];

/**
 * Type alias for the actions returned by the {@link useArray} hook.
 */
export interface UseArrayActions<TArrayElement> {
  /**
   * Set a new array as the state.
   *
   * @param newArray The new array to set
   */
  set: (newArray: HookStateSetAction<TArrayElement[]>) => void;
  /**
   * Add item(s) at the end of array.
   *
   * @param items The item(s) to add
   */
  push: (...items: HookStateInitAction<TArrayElement>[]) => void;
  /**
   * Replace item at given position. If item at given position not exists it will be set.
   *
   * @param index The position to update
   * @param item The new item
   */
  updateAt: (index: number, item: HookStateInitAction<TArrayElement>) => void;
  /**
   * Insert item at given position, all items to the right will be shifted.
   *
   * @param index The position to insert at
   * @param item The new item
   */
  insertAt: (index: number, item: HookStateInitAction<TArrayElement>) => void;
  /**
   * Replace all items that matches predicate with given one.
   *
   * @param predicate The predicate to match
   * @param newItem The new item
   */
  update: (
    predicate: (a: TArrayElement, b: TArrayElement) => boolean,
    newItem: HookStateInitAction<TArrayElement>
  ) => void;
  /**
   * Replace first item matching predicate with given one.
   *
   * @param predicate The predicate to match
   * @param newItem The new item
   */
  updateFirst: (
    predicate: (a: TArrayElement, b: TArrayElement) => boolean,
    newItem: HookStateInitAction<TArrayElement>
  ) => void;
  /**
   * Like `updateFirst` but in case of predicate miss - pushes item to the array.
   *
   * @param predicate The predicate to match
   * @param newItem The new item
   */
  upsert: (
    predicate: (a: TArrayElement, b: TArrayElement) => boolean,
    newItem: HookStateInitAction<TArrayElement>
  ) => void;
  /**
   * Sort array with given sorting function.
   *
   * @param comparator (Optional) The sorting comparator function
   */
  sort: (comparator?: (a: TArrayElement, b: TArrayElement) => number) => void;
  /**
   * Same as native Array's method.
   *
   * @param callback The filter callback
   * @param thisArg (Optional) The value to use as `this` when executing `callback`
   */
  filter: <S extends TArrayElement>(
    callback: (
      value: TArrayElement,
      index?: number,
      self?: TArrayElement[]
    ) => value is S,
    thisArg?: unknown
  ) => void;
  /**
   * Removes item at given position. All items to the right from removed will be shifted.
   *
   * @param index The position to remove
   */
  removeAt: (index: number) => void;
  /**
   * Remove all elements from the array.
   */
  clear: () => void;
  /**
   * Reset array to initial value.
   */
  reset: () => void;
}

/**
 * Type alias for the return value of the {@link useArray} hook.
 */
export type UseArrayReturn<TArrayElement> = [
  /**
   * The state.
   */
  state: TArrayElement[],
  /**
   * The state actions.
   */
  actions: UseArrayActions<TArrayElement>,
];

/**
 * Type alias for the actions returned by the {@link useObject} hook.
 */
export interface UseObjectActions<TObject extends Record<string, any>> {
  /**
   * Set a new object as the state.
   */
  setAll: (newMap: HookStateSetAction<TObject>) => void;
  /**
   * Get the value for a given key.
   *
   * @param key The key to get the value for
   * @returns The value for the given key
   */
  get: <K extends keyof TObject>(key: K) => TObject[K] | undefined;
  /**
   * Set the value for a given key.
   *
   * @param key The key to set the value for
   * @param value The value to set
   */
  set: <K extends keyof TObject>(
    key: K,
    value: HookStateInitAction<TObject[K]>
  ) => void;
  /**
   * Remove the value for a given key.
   *
   * @param key The key to remove the value for
   */
  remove: <K extends keyof TObject>(key: K) => void;
  /**
   * Clear the state object.
   */
  clear: () => void;
  /**
   * Reset the state object to the initial value.
   */
  reset: () => void;
}

/**
 * Type alias for the return value of the {@link useObject} hook.
 */
export type UseObjectReturn<TObject extends Record<string, any>> = [
  /**
   * The state.
   */
  state: TObject,
  /**
   * The state actions.
   */
  actions: UseObjectActions<TObject>,
];

/**
 * Type alias for the actions returned by the {@link useSet} hook.
 */
export interface UseSetActions<TSetElement> {
  /**
   * Set a new Set as the state.
   *
   * @param newState The new Set to set
   */
  set: (newState: HookStateSetAction<Set<TSetElement>>) => void;
  /**
   * Add a value to the Set.
   *
   * @param value The value to add
   */
  add: (value: HookStateInitAction<TSetElement>) => void;
  /**
   * Remove a value from the Set.
   *
   * @param value The value to remove
   */
  remove: (value: HookStateInitAction<TSetElement>) => void;
  /**
   * Toggle a value in the Set. Adds the value if it doesn't exist, otherwise it removes it.
   *
   * @param value The value to toggle
   */
  toggle: (value: HookStateInitAction<TSetElement>) => void;
  /**
   * Check if a value exists in the Set.
   *
   * @param value The value to check
   */
  has: (value: HookStateInitAction<TSetElement>) => boolean;
  /**
   * Clear the state Set.
   */
  clear: () => void;
  /**
   * Reset the state Set to the initial value.
   */
  reset: () => void;
}

/**
 * Type alias for the return value of the {@link useSet} hook.
 */
export type UseSetReturn<TSetElement> = [
  /**
   * The state.
   */
  state: Set<TSetElement>,
  /**
   * The state actions.
   */
  actions: UseSetActions<TSetElement>,
];

/**
 * Type alias for the actions returned by the {@link useQueue} hook.
 */
export interface UseQueueActions<TQueueElement> {
  /**
   * Set a new queue as the state.
   *
   * @param newQueue The new queue to set
   */
  set: (newQueue: HookStateSetAction<TQueueElement[]>) => void;
  /**
   * Add an item to the end of the queue.
   *
   * @param item The item to add
   */
  add: (item: HookStateInitAction<TQueueElement>) => void;
  /**
   * Remove the first item from the queue.
   *
   * @returns The removed item
   */
  remove: () => TQueueElement | undefined;
  /**
   * Clear the queue.
   */
  clear: () => void;
  /**
   * Reset the queue to the initial value.
   */
  reset: () => void;
  /**
   * The first item in the queue.
   */
  readonly first: TQueueElement | undefined;
  /**
   * The last item in the queue.
   */
  readonly last: TQueueElement | undefined;
  /**
   * The size of the queue.
   */
  readonly size: number;
}

/**
 * Type alias for the return value of the {@link useQueue} hook.
 */
export type UseQueueReturn<TQueueElement> = [
  /**
   * The state.
   */
  state: TQueueElement[],
  /**
   * The state actions.
   */
  actions: UseQueueActions<TQueueElement>,
];

/**
 * Type alias for the validity state used by the {@link useStateValidator} and {@link useMultiStateValidator} hooks.
 */
export type ValidityState = [boolean | undefined, ...any[]] | [undefined];

/**
 * Type alias for the state validator function used by the {@link useStateValidator} hook.
 */
export interface StateValidator<TValidityState, TState> {
  /**
   * State validator function.
   *
   * @param state The state to validate
   */
  (state: TState): TValidityState;
  /**
   * State validator function with dispatch function param.
   *
   * @param state The state to validate
   * @param dispatch The dispatch function
   */
  (
    state: TState,
    dispatch: React.Dispatch<React.SetStateAction<TValidityState>>
  ): void;
}

/**
 * Type alias for the states used by the {@link useMultiStateValidator} hook.
 */
export type MultiStateValidatorStates =
  | any[]
  | Record<string, any>
  | Record<number, any>;

/**
 * Type alias for the multi state validator function used by the {@link useMultiStateValidator} hook.
 */
export type MultiStateValidator<
  TValidityState extends ValidityState,
  TStates extends MultiStateValidatorStates,
> = StateValidator<TValidityState, TStates>;

/**
 * Type alias for the return value of the {@link useStateValidator} and {@link useMultiStateValidator} hooks.
 */
export type UseValidityStateReturn<TValidityState> = [
  /**
   * The validity state.
   */
  validity: TValidityState,
  /**
   * The function to revalidate the state.
   */
  revalidate: () => void,
];

/**
 * Type alias for the history state of the {@link useStateWithHistory} hook.
 */
export interface UseStateHistory<TState> {
  /**
   * The history of the state.
   */
  readonly history: TState[];
  /**
   * The position of the current state.
   */
  readonly position: number;
  /**
   * The capacity of the history.
   */
  readonly capacity: number;
  /**
   * Go back to a previous state.
   *
   * @param amount The amount of states to go back
   */
  back: (amount?: HookStateInitAction<number>) => void;
  /**
   * Go forward to an upcoming state.
   *
   * @param amount The amount of states to go forward
   */
  forward: (amount?: HookStateInitAction<number>) => void;
  /**
   * Go to a specific state by position.
   *
   * @param position The position to go to
   */
  go: (position: HookStateInitAction<number>) => void;
  /**
   * Clear the history.
   */
  clear: () => void;
}

/**
 * Type alias for the return value of the {@link useStateWithHistory} hook.
 */
export type UseStateWithHistoryReturn<TState> = [
  /**
   * The state.
   */
  state: TState,
  /**
   * The state setter.
   */
  setState: React.Dispatch<HookStateSetAction<TState>>,
  /**
   * The state history.
   */
  history: UseStateHistory<TState>,
];

/**
 * Type alias for the state mediator function used by the {@link useMediatedState} hook.
 */
export interface StateMediator<TState = any> {
  (state: Partial<TState>): TState;
  (state: TState, dispatch: React.Dispatch<React.SetStateAction<TState>>): void;
}

/**
 * Type alias for the return value of the {@link useMediatedState} hook.
 */
export type UseMediatedStateReturn<TState = any> = [
  /**
   * The state.
   */
  state: TState,
  /**
   * The state setter.
   */
  setState: StateMediator<TState>["length"] extends 2
    ? (state: React.Dispatch<React.SetStateAction<TState>>) => void
    : React.Dispatch<React.SetStateAction<TState>>,
];

/**
 * Type alias for the methods object used by the {@link useMethods} hook.
 */
export type Methods = Record<string, (...payload: any) => any>;

/**
 * Type alias for the method action used by the {@link useMethods} hook.
 */
export interface MethodAction<
  TMethods extends Methods,
  TType extends keyof TMethods = keyof TMethods,
> {
  /**
   * The method type.
   */
  type: TType;
  /**
   * The method payload.
   */
  payload?: Parameters<TMethods[TType]>;
}

/**
 * Type alias for the create methods function passed to the {@link useMethods} hook.
 */
export type CreateMethods<TState, TMethods extends Methods> = (
  state: TState
) => {
  [K in keyof TMethods]: (...payload: Parameters<TMethods[K]>) => TState;
};

/**
 * Type alias for the wrapped methods returned by the {@link useMethods} hook.
 */
export type WrappedMethods<TMethods extends Methods> = {
  [K in keyof TMethods]: (...payload: Parameters<TMethods[K]>) => void;
};

/**
 * Type alias for the return value of the {@link useMethods} hook.
 */
export type UseMethodsReturn<TState, TMethods extends Methods> = [
  /**
   * The state.
   */
  state: TState,
  /**
   * The wrapped state methods.
   */
  methods: WrappedMethods<TMethods>,
];
