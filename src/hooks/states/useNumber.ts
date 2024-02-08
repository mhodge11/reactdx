import { useMemo, useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import type {
  UseNumberActions,
  UseNumberOptions,
  UseNumberReturn,
} from "../../types/states.ts";
import { isNullOrUndefined } from "../../utils/isNullOrUndefined.ts";
import { isNumber } from "../../utils/isNumber.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";

import { useGetSet } from "./useGetSet.ts";

/**
 * React state hook that returns a number state
 * and actions to increment, decrement, get, set and reset it:
 * - `get()` - Get current number.
 * - `set(value)` - Set new number.
 * - `inc(delta?)` - Increment number by delta (Defaults to 1).
 * - `dec(delta?)` - Decrement number by delta (Defaults to 1).
 * - `reset(value?)` - Reset number to initial value (Defaults to initial state).
 *
 * @example
 * ```tsx
 * const [
 *   min,
 *   { inc: incMin, dec: decMin }
 * ] = useNumber(1);
 *
 * const [
 *   max,
 *   { inc: incMax, dec: decMax }
 * ] = useNumber(10);
 *
 * const [
 *   value,
 *   { inc, dec, set, reset }
 * ] = useNumber(5, max, min);
 *
 * return (
 *   <div>
 *     <div>
 *       current: { value } [min: { min }; max: { max }]
 *     </div>
 *
 *     <br />
 *     <button onClick={ () => inc() }>Increment</button>
 *     <button onClick={ () => dec() }>Decrement</button>
 *     <button onClick={ () => inc(5) }>
 *       Increment (+5)
 *     </button>
 *     <button onClick={ () => dec(5) }>
 *       Decrement (-5)
 *     </button>
 *     <button onClick={ () => set(100) }>Set 100</button>
 *     <button onClick={ () => reset() }>Reset</button>
 *     <button onClick={ () => reset(25) }>Reset (25)</button>
 *
 *     <br />
 *     <br />
 *     Min value:
 *     <button onClick={ () => incMin() }>Increment</button>
 *     <button onClick={ () => decMin() }>Decrement</button>
 *
 *     <br />
 *     <br />
 *     Max value:
 *     <button onClick={ () => incMax() }>Increment</button>
 *     <button onClick={ () => decMax() }>Decrement</button>
 *   </div>
 * );
 * ```
 *
 * @param initialState The initial state or a function that returns the initial state
 * @returns A tuple containing the state and the state actions
 *
 * @category State
 * @since 0.0.1
 */
export const useNumber = (
  initialState: HookStateInitAction<number> = 0,
  options: UseNumberOptions = {}
): UseNumberReturn => {
  let resolvedInitialState = resolveHookState(initialState);
  const { min, max, step } = options;

  if (isNumber(min)) {
    resolvedInitialState = Math.max(resolvedInitialState, min);
  }

  if (isNumber(max)) {
    resolvedInitialState = Math.min(resolvedInitialState, max);
  }

  runOnlyIfDevMode(() => {
    if (!isNumber(resolvedInitialState)) {
      warn(
        `\`useNumber\` initialState has to be a number, but got ${typeof resolvedInitialState}`,
        { initialState, options }
      );
    }

    if (!isNumber(min) && !isNullOrUndefined(min)) {
      warn(
        `\`useNumber\` option "min" has to be a number, but got ${typeof min}`,
        { initialState, options }
      );
    }

    if (!isNumber(max) && !isNullOrUndefined(max)) {
      warn(
        `\`useNumber\` option "max" has to be a number, but got ${typeof max}`,
        { initialState, options }
      );
    }

    if (!isNumber(step) && !isNullOrUndefined(step)) {
      warn(
        `\`useNumber\` option "step" has to be a number, but got ${typeof step}`,
        { initialState, options }
      );
    }
  });

  const [get, setInternal] = useGetSet(resolvedInitialState);

  const _initialState = useRef(resolvedInitialState);

  const _min = useRef(min);
  const _max = useRef(max);
  const _step = useRef(step ?? 1);

  _min.current = min;
  _max.current = max;
  _step.current = step ?? 1;

  return [
    get(),
    useMemo<UseNumberActions>(() => {
      const set = (newState: HookStateSetAction<number>) => {
        const prevState = get();
        let rState = resolveHookState(newState, prevState);

        if (prevState !== rState) {
          if (isNumber(_min.current)) {
            rState = Math.max(rState, _min.current);
          }

          if (isNumber(_max.current)) {
            rState = Math.min(rState, _max.current);
          }

          if (prevState !== rState) {
            setInternal(rState);
          }
        }
      };

      return {
        get,
        set,
        inc: (delta: HookStateSetAction<number> = _step.current) => {
          const rDelta = resolveHookState(delta, get());

          runOnlyIfDevMode(() => {
            if (!isNumber(rDelta)) {
              warn(
                "`useNumber`: inc(delta) argument has to be a number or a function that returns a number.",
                {
                  delta,
                }
              );
            }
          });

          set(num => num + rDelta);
        },
        dec: (delta: HookStateSetAction<number> = _step.current) => {
          const rDelta = resolveHookState(delta, get());

          runOnlyIfDevMode(() => {
            if (!isNumber(rDelta)) {
              warn(
                "`useNumber`: dec(delta) argument has to be a number or a function that returns a number.",
                {
                  delta,
                }
              );
            }
          });

          set(num => num - rDelta);
        },
        reset: (value: HookStateSetAction<number> = _initialState.current) => {
          const rValue = resolveHookState(value, get());

          runOnlyIfDevMode(() => {
            if (!isNumber(rValue)) {
              warn(
                "`useNumber`: reset(value) argument has to be a number or a function that returns a number.",
                {
                  value,
                }
              );
            }
          });

          _initialState.current = rValue;
          setInternal(rValue);
        },
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  ];
};
