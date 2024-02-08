import { useCallback, useEffect, useRef, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  UseStorageOptions,
  UseStorageReturn,
} from "../../types/effects.ts";
import type {
  HookStateInitAction,
  HookStateSetAction,
} from "../../types/logic.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { isNullOrUndefined } from "../../utils/isNullOrUndefined.ts";
import { isString } from "../../utils/isString.ts";
import { isUndefined } from "../../utils/isUndefined.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useIsomorphicLayoutEffect } from "../lifecycles/useIsomorphicLayoutEffect.ts";

/**
 * Checks if the `localStorage` API is supported.
 *
 * @returns `true` if the `localStorage` API is supported, `false` otherwise
 */
const isStorageApiSupported = (): boolean => {
  try {
    return hasWindow() && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
};

/**
 * React side-effect hook that manages a single `localStorage` key.
 *
 * @example
 * ```tsx
 * const [
 *   value,
 *   setValue,
 *   remove
 * ] = useLocalStorage("my-key", "foo");
 *
 * return (
 *   <div>
 *     <div>Value: {value}</div>
 *     <button onClick={() => setValue("bar")}>bar</button>
 *     <button onClick={() => setValue("baz")}>baz</button>
 *     <button onClick={() => remove()}>Remove</button>
 *   </div>
 * );
 * ```
 *
 * @param key The key to manage
 * @param initialValue The initial value to set the key to
 * @param options (Optional) The options for the storage parser
 * @param options.raw (Optional) Whether the storage values should be used raw (Defaults to `false`)
 * @param options.serializer (Optional) The serializer function to use when setting a storage value (Defaults to `JSON.stringify`)
 * @param options.deserializer (Optional) The deserializer function to use when getting a storage value (Defaults to `JSON.parse`)
 * @returns A tuple containing the current value of the key, a callback to update the key and a callback to remove the key
 *
 * @category Effect
 * @since 0.0.1
 */
export const useLocalStorage = isStorageApiSupported()
  ? <TValue>(
      key: string,
      initialValue?: HookStateInitAction<TValue>,
      options?: UseStorageOptions<TValue>
    ): UseStorageReturn<TValue> => {
      if (!key) {
        throw new Error(
          `\`useLocalStorage\` key may not be falsy, received '${key}'.`
        );
      }

      const initialValueState = resolveHookState(initialValue);

      const deserializerFn = options?.raw
        ? (value: string) => value
        : options?.deserializer
          ? options.deserializer
          : JSON.parse;

      const _deserializer = useRef(deserializerFn);
      _deserializer.current = deserializerFn;

      const serializerFn = options?.raw
        ? (value: string | unknown) =>
            isString(value) ? `${value}` : JSON.stringify(value)
        : options?.serializer
          ? options.serializer
          : JSON.stringify;

      const _serializer = useRef(serializerFn);
      _serializer.current = serializerFn;

      const _initializer = useRef((key: string) => {
        try {
          const localStorageValue = localStorage.getItem(key);
          if (!isNullOrUndefined(localStorageValue)) {
            return _deserializer.current(localStorageValue);
          }
          if (initialValueState) {
            localStorage.setItem(key, _serializer.current(initialValueState));
          }

          return initialValueState;
        } catch {
          // If user is in private mode or has storage restriction
          // localStorage can throw. JSON.parse and JSON.stringify
          // can throw, too.
          return initialValueState;
        }
      });

      const [state, setState] = useState<TValue | undefined>(() =>
        _initializer.current(key)
      );

      const _state = useRef(state);
      _state.current = state;

      const set = useCallback<UseStorageReturn<TValue>[1]>(
        newValue => {
          try {
            const newState = resolveHookState(newValue, _state.current);

            if (isUndefined(newState)) {
              return;
            }

            const value = _serializer.current(newState);
            setState(_deserializer.current(value));
            localStorage.setItem(key, value);
          } catch {
            // If user is in private mode or has storage restriction
            // localStorage can throw. Also JSON.stringify can throw.
          }
        },
        [key]
      );

      const remove = useCallback<UseStorageReturn<TValue>[2]>(() => {
        try {
          setState(undefined);
          localStorage.removeItem(key);
        } catch {
          // If user is in private mode or has storage restriction
          // localStorage can throw.
        }
      }, [key]);

      useIsomorphicLayoutEffect(
        () => setState(_initializer.current(key)),
        [key]
      );

      useEffect(() => {
        let mounted = true;

        const onStorage = (event: StorageEvent) => {
          if (
            !mounted ||
            event.storageArea !== localStorage ||
            event.key !== key ||
            isNullOrUndefined(event.newValue) ||
            event.newValue === _state.current
          ) {
            return;
          }

          setState(_deserializer.current(event.newValue));
        };

        on(window, "storage", onStorage);

        return () => {
          mounted = false;
          off(window, "storage", onStorage);
        };
      }, [key]);

      return [state, set, remove];
    }
  : <TValue>(
      key: string,
      initialValue?: HookStateInitAction<TValue>,
      options?: UseStorageOptions<TValue>
    ): UseStorageReturn<TValue> => {
      if (!key) {
        throw new Error(
          `\`useLocalStorage\` key may not be falsy, received '${key}'.`
        );
      }

      const initialValueState = resolveHookState(initialValue);

      warn("`useLocalStorage` is not supported on server side.", {
        key,
        initialValue: initialValueState,
        options,
      });

      return [
        initialValueState,
        (newValue: HookStateSetAction<TValue>) => {
          warn(
            `Tried to set localStorage key '${key}', but the current environment does not support \`localStorage\`.`,
            { newValue: resolveHookState(newValue, initialValueState) }
          );
        },
        () => {
          warn(
            `Tried to remove localStorage key '${key}', but the current environment does not support \`localStorage\`.`
          );
        },
      ];
    };
