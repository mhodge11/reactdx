import { useCallback, useEffect, useRef, useState } from "react";

import type {
  StateValidator,
  UseValidityStateReturn,
  ValidityState,
} from "../../types/states";

/**
 * React state hook that validates the state
 * using a validator function. Each time given
 * state changes - the `validator` function is invoked.
 *
 * The validator function returns a tuple with a validity state
 * and an optional revalidate function.
 *
 * **Properties:**
 * - **`validity: [boolean | undefined, ...any[]]`** - The esult of validity check.
 * First element is strictly nullable boolean,
 * but others can contain arbitrary data
 * - **`revalidate: () => void`** - Runs the validator function again
 * and updates the validity state
 * - **`validator: (state, setValidity?)=>[boolean | undefined, ...any[]]`** - The validator function
 * which should return an array suitable for `validity` described above.
 *   - **`state`** - The current state.
 *   - **`setValidity`** - If defined, hook will not trigger
 * validity change automatically. Useful for async validators.
 * - **`initialValidity: [boolean | undefined, ...any[]]`** - The initial validity state.
 *
 * @example
 * ```tsx
 * const validator = (s) =>
 *   [s === '' ? null : (s * 1) % 2 === 0];
 *
 * const [state, setState] = useState(0);
 * const [[isValid]] = useStateValidator(state, validator);
 *
 * return (
 *   <div>
 *     <div>Below field is valid only if number is even</div>
 *     <input
 *       type="number"
 *       min="0"
 *       max="10"
 *       value={state}
 *       onChange={(ev) => {
 *         setState(ev.target.value);
 *       }}
 *     />
 *     {isValid !== null &&
 *       <span>
 *         {isValid
 *           ? "Valid!"
 *           : "Invalid"
 *         }
 *       </span>
 *     }
 *   </div>
 * );
 * ```
 *
 * @param state The state to validate
 * @param validator The validator function
 * @param initialValidity The initial validity state
 * @returns A tuple containing the validity and the revalidate function
 *
 * @category State
 * @since 0.0.1
 */
export const useStateValidator = <TValidityState extends ValidityState, TState>(
  state: TState,
  validator: StateValidator<TValidityState, TState>,
  initialValidity: TValidityState = [undefined] as TValidityState
): UseValidityStateReturn<TValidityState> => {
  const validatorInner = useRef(validator);
  const stateInner = useRef(state);

  validatorInner.current = validator;
  stateInner.current = state;

  const [validity, setValidity] = useState(initialValidity);

  const validate = useCallback(() => {
    if (validatorInner.current.length >= 2) {
      validatorInner.current(stateInner.current, setValidity);
    } else {
      setValidity(validatorInner.current(stateInner.current));
    }
  }, []);

  useEffect(() => {
    validate();
  }, [state, validate]);

  return [validity, validate] as const;
};
