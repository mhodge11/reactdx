import { useCallback, useEffect, useRef, useState } from "react";

import type {
  MultiStateValidator,
  MultiStateValidatorStates,
  UseValidityStateReturn,
  ValidityState,
} from "../../types/states.ts";
import { isObjectType } from "../../utils/isObject.ts";

/**
 * React state hook that validates an array or object of states
 * using a validator function. Each time a given
 * state changes - the `validator` function is invoked.
 *
 * The validator function returns a tuple with a validity state
 * and an optional revalidate function.
 *
 * Like `{@link useStateValidator}`, but for multiple states.
 *
 * **Properties:**
 * - **`state: any[] | { [p: string]: any } | { [p: number]: any }`** - Can be an array or object.
 * Its values will be used as a deps for inner `useEffect`.
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
 * @param states The states to validate
 * @param validator The validator function
 * @param initialValidity The initial validity state
 * @returns A tuple containing the validity and the revalidate function
 */
export const useMultiStateValidator = <
  TValidityState extends ValidityState,
  TStates extends MultiStateValidatorStates,
>(
  states: TStates,
  validator: MultiStateValidator<TValidityState, TStates>,
  initialValidity: TValidityState = [undefined] as TValidityState
): UseValidityStateReturn<TValidityState> => {
  if (!isObjectType(states)) {
    throw new Error(
      `\`useMultiStateValidator\` states must be an object or an array.`
    );
  }

  const _validator = useRef(validator);
  const _states = useRef(states);

  _validator.current = validator;
  _states.current = states;

  const [validity, setValidity] = useState(initialValidity);

  const validate = useCallback(() => {
    if (_validator.current.length >= 2) {
      _validator.current(_states.current, setValidity);
    } else {
      setValidity(_validator.current(_states.current));
    }
  }, []);

  useEffect(() => {
    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Object.values(states));

  return [validity, validate];
};
