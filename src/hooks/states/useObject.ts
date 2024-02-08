import { useMemo, useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import type { UseObjectActions, UseObjectReturn } from "../../types/states.ts";
import { isObjectType } from "../../utils/isObject.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";
import { useUpdate } from "../animations/useUpdate.ts";

/**
 * React state hook that tracks an object and provides methods to modify it.
 *
 * Returns an object containing the current state and actions to update it:
 * - **`setAll(newMap)`** - Set a new object as the state.
 * - **`get(key)`** - Get the value for a given key.
 * - **`set(key, value)`** - Set the value for a given key.
 * - **`remove(key)`** - Remove the value for a given key.
 * - **`clear()`** - Clear the state object.
 * - **`reset()`** - Reset the state object to the initial value.
 *
 * @example
 * ```tsx
 * const [
 *   obj,
 *   {
 *     setAll,
 *     get,
 *     set,
 *     remove,
 *     clear,
 *     reset
 *   }
 * ] = useObject({ a: 1, b: 2 });
 *
 * return (
 *   <div>
 *     <button
 *       onClick={
 *         () => set(String(Date.now()), new Date().toJSON())
 *       }
 *     >
 *       Add
 *     </button>
 *     <button onClick={() => reset()}>
 *       Reset
 *     </button>
 *     <button onClick={() => clear()}>
 *       Clear
 *     </button>
 *     <button
 *       onClick={
 *         () => setAll({ hello: "new", data: "data" })
 *       }
 *     >
 *       Set new data
 *     </button>
 *     <button
 *       onClick={() => remove('hello')}
 *       disabled={!("hello" in obj)}
 *     >
 *       Remove "hello"
 *     </button>
 *     <pre>{JSON.stringify(obj, null, 2)}</pre>
 *   </div>
 * );
 * ```
 *
 * @param initialState The initial state or a function that returns the initial state
 * @returns A tuple containing the state and actions to update it
 *
 * @category State
 * @since 0.0.1
 */
export const useObject = <TObject extends Record<string, any>>(
  initialState: HookStateInitAction<TObject> = {} as TObject
): UseObjectReturn<TObject> => {
  const resolvedInitialState = resolveHookState(initialState);
  const _obj = useRef(resolvedInitialState);
  const _initialState = useRef(resolvedInitialState);
  const update = useUpdate();

  return [
    _obj.current,
    useMemo<UseObjectActions<TObject>>(() => {
      const setAll = (newObj: HookStateSetAction<TObject>) => {
        const resolvedNewObj = resolveHookState(newObj, _obj.current);

        runOnlyIfDevMode(() => {
          if (!isObjectType(resolvedNewObj)) {
            warn(
              `\`useObject\` setAll parameter 'newObj' must be an object but got ${typeof newObj}.`,
              { newObj }
            );
          }
        });

        _obj.current = resolvedNewObj;

        update();
      };

      return {
        setAll,
        get: <K extends keyof TObject>(key: K) => _obj.current[key],
        set: <K extends keyof TObject>(
          key: K,
          value: HookStateInitAction<TObject[K]>
        ) => {
          setAll(prevObj => ({ ...prevObj, [key]: resolveHookState(value) }));
        },
        remove: <K extends keyof TObject>(key: K) => {
          setAll(prevObj => {
            const { [key]: _, ...rest } = prevObj;
            return rest as TObject;
          });
        },
        clear: () => {
          setAll({} as TObject);
        },
        reset: () => {
          setAll(_initialState.current);
        },
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  ];
};
