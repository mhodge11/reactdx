import { useCallback, useMemo, useRef, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import type {
  UseStateHistory,
  UseStateWithHistoryReturn,
} from "../../types/states.ts";
import { useUpdate } from "../animations/useUpdate.ts";

import { useFirstMountState } from "./useFirstMountState.ts";

/**
 * Stores defined amount of previous state values and provides handles to travel through them.
 *
 * Returns an array containing the current state and actions to update it:
 * - **`history`** - The history of the state.
 * - **`position`** - The position of the current state.
 * - **`capacity`** - The capacity of the history.
 * - **`back(amount?)`** - Go back to a previous state.
 * - **`forward(amount?)`** - Go forward to an upcoming state.
 * - **`go(position)`** - Go to a specific state by position.
 * - **`clear()`** - Clear the history.
 * - **`reset()`** - Reset the history and state to their initial values.
 *
 * @example
 * ```tsx
 * const [state, setState, history] = useStateWithHistory('hello');
 *
 * return (
 *   <div>
 *     <ul>
 *       <li>Position: {history.position}</li>
 *       <li>Capacity: {history.capacity}</li>
 *     </ul>
 *     <button onClick={() => setState('world')}>
 *       Set state to 'world'
 *     </button>
 *     <button onClick={() => history.back()}>
 *       Go back
 *     </button>
 *     <button onClick={() => history.forward()}>
 *       Go forward
 *     </button>
 *     <button onClick={() => history.go(0)}>
 *       Go to position 0
 *     </button>
 *     <button onClick={() => history.clear()}>
 *       Clear history
 *     </button>
 *     <button onClick={() => history.reset()}>
 *       Reset history
 *     </button>
 *     <pre>{JSON.stringify({ state, history: history.history }, null, 2)}</pre>
 *   </div>
 * );
 * ```
 *
 * @param initialState Initial state value
 * @param capacity Amount of previous states to store
 * @param initialHistory Initial history values
 * @returns A tuple containing the state, setState, and the history state
 */
export function useStateWithHistory<TState>(
  initialState: HookStateInitAction<TState>,
  capacity?: number,
  initialHistory?: TState[]
): UseStateWithHistoryReturn<TState>;
export function useStateWithHistory<
  TState = undefined,
>(): UseStateWithHistoryReturn<TState | undefined>;
export function useStateWithHistory<TState>(
  initialState?: HookStateInitAction<TState>,
  capacity: number = 10,
  initialHistory: TState[] = []
): UseStateWithHistoryReturn<TState> {
  if (capacity < 1) {
    throw new Error(
      `\`useStateWithHistory\` capacity must be greater than 0, but got ${capacity}.`
    );
  }

  const resolvedInitialState = resolveHookState(initialState) as TState;

  const isFirstMount = useFirstMountState();

  const [state, innerSetState] = useState<TState>(resolvedInitialState);

  const update = useUpdate();

  const _state = useRef<TState>(state);
  const _capacity = useRef(capacity);
  const _history = useRef<TState[]>(initialHistory);
  const _historyPos = useRef(0);

  _capacity.current = capacity;
  _state.current = state;

  if (isFirstMount) {
    if (_history.current.length) {
      // if last element of history !== initial - push initial to history
      if (
        _history.current[_history.current.length - 1] !== resolvedInitialState
      ) {
        _history.current.push(resolvedInitialState);
      }

      // if initial history bigger that capacity - crop the first elements out
      if (_history.current.length > capacity) {
        _history.current = _history.current.slice(
          _history.current.length - capacity
        );
      }
    } else {
      // initiate the history with initial state
      _history.current.push(resolvedInitialState);
    }

    _historyPos.current = (_history.current?.length ?? 1) - 1;
  }

  const setState = useCallback<React.Dispatch<HookStateSetAction<TState>>>(
    (newState: HookStateSetAction<TState>) =>
      innerSetState(currState => {
        newState = resolveHookState(newState, currState);

        // is state changed?
        if (newState !== currState) {
          // if current position is not the last - pop element to the right
          if (_historyPos.current < _history.current.length - 1) {
            _history.current = _history.current.slice(
              0,
              _historyPos.current + 1
            );
          }

          _historyPos.current = _history.current.push(newState) - 1;

          // if capacity is reached - shift first elements
          if (_history.current.length > _capacity.current) {
            _history.current.slice(_history.current.length - _capacity.current);
          }
        }

        return newState;
      }),
    []
  );

  const historyState = useMemo(
    () => ({
      back: (amount: HookStateInitAction<number> = 1) => {
        // don't do anything if we're already at the left border
        if (!_historyPos.current) {
          return;
        }

        innerSetState(() => {
          _historyPos.current -= Math.min(
            resolveHookState(amount),
            _historyPos.current
          );

          return _history.current[_historyPos.current] as TState;
        });
      },
      forward: (amount: HookStateInitAction<number> = 1) => {
        // don't do anything if we're already at the right border
        if (_historyPos.current === _history.current.length - 1) {
          return;
        }

        innerSetState(() => {
          _historyPos.current = Math.min(
            _historyPos.current + resolveHookState(amount),
            _history.current.length - 1
          );

          return _history.current[_historyPos.current] as TState;
        });
      },
      go: (position: HookStateInitAction<number>) => {
        const rPosition = resolveHookState(position);

        // don't do anything if we're already at `position`
        if (_historyPos.current === rPosition) {
          return;
        }

        innerSetState(() => {
          _historyPos.current =
            rPosition < 0
              ? Math.max(_history.current.length + rPosition, 0)
              : Math.min(_history.current.length - 1, rPosition);

          return _history.current[_historyPos.current] as TState;
        });
      },
      clear: () => {
        _history.current = [_state.current];
        _historyPos.current = 0;

        update();
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  Object.defineProperties(historyState, {
    history: {
      enumerable: true,
      get: () => _history.current,
    },
    position: {
      enumerable: true,
      get: () => _historyPos.current,
    },
    capacity: {
      enumerable: true,
      get: () => _capacity.current,
    },
  });

  return [state, setState, historyState as UseStateHistory<TState>];
}
