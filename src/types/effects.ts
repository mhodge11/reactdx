import type { CookieAttributes, HookStateSetAction } from "./logic.ts";
import type { GenericAsyncFunction, PromiseType } from "./utils.ts";

/**
 * Type alias for the async state of the {@link useAsync} hook.
 */
export type UseAsyncReturn<TAsyncFunc extends GenericAsyncFunction> =
  | {
      /**
       * Whether the promise is pending.
       */
      loading: boolean;
      /**
       * The error that occurred during the promise.
       * If the promise is pending or resolved, this will be `undefined`.
       */
      error?: undefined;
      /**
       * The value that was resolved by the promise.
       * If the promise is pending or rejected, this will be `undefined`.
       */
      value?: undefined;
    }
  | {
      /**
       * Whether the promise is pending.
       */
      loading: true;
      /**
       * The error that occurred during the promise.
       * If the promise is pending or resolved, this will be `undefined`.
       */
      error?: Error | undefined;
      /**
       * The value that was resolved by the promise.
       * If the promise is pending or rejected, this will be `undefined`.
       */
      value?: PromiseType<ReturnType<TAsyncFunc>>;
    }
  | {
      /**
       * Whether the promise is pending.
       */
      loading: false;
      /**
       * The error that occurred during the promise.
       * If the promise is pending or resolved, this will be `undefined`.
       */
      error: Error;
      /**
       * The value that was resolved by the promise.
       * If the promise is pending or rejected, this will be `undefined`.
       */
      value?: undefined;
    }
  | {
      /**
       * Whether the promise is pending.
       */
      loading: false;
      /**
       * The error that occurred during the promise.
       * If the promise is pending or resolved, this will be `undefined`.
       */
      error?: undefined;
      /**
       * The value that was resolved by the promise.
       * If the promise is pending or rejected, this will be `undefined`.
       */
      value: PromiseType<ReturnType<TAsyncFunc>>;
    };

/**
 * Type alias for the return value of the {@link useAsyncFn} hook.
 */
export type UseAsyncFnReturn<TAsyncFunc extends GenericAsyncFunction> = [
  /**
   * The state of the async function.
   */
  state: UseAsyncReturn<TAsyncFunc>,
  /**
   * The function to call the async function.
   */
  callback: (...args: Parameters<TAsyncFunc> | []) => ReturnType<TAsyncFunc>,
];

/**
 * Type alias for the return value of the {@link useAsyncRetry} hook.
 */
export type UseAsyncRetryReturn<TAsyncFunc extends GenericAsyncFunction> = [
  /**
   * The state of the async function.
   */
  state: UseAsyncReturn<TAsyncFunc>,
  /**
   * The function to retry the async function.
   */
  retry: () => void,
];

/**
 * Type alias for the return value of the {@link useCookie} hook.
 */
export type UseCookieReturn = [
  /**
   * The value of the cookie.
   */
  value: string | undefined,
  /**
   * The function to update the cookie.
   */
  updateCookie: (
    newValue: HookStateSetAction<string>,
    options?: CookieAttributes
  ) => void,
  /**
   * The function to delete the cookie.
   */
  deleteCookie: () => void,
];

/**
 * Type alias for the copy to clipboard state, used by the {@link useCopyToClipboard} hook.
 */
export interface CopyToClipboardState {
  /**
   * Indicates if user interaction was required to copy
   * the value to the clipboard to expose full
   * Clipboard API functionality.
   */
  value?: string;
  /**
   * The value that was copied to the clipboard.
   */
  error?: Error;
  /**
   * The error that occurred during the copy to clipboard operation.
   */
  noUserInteraction: boolean;
}

/**
 * Type alias for the return value of the {@link useCopyToClipboard} hook.
 */
export type UseCopyToClipboardReturn = [
  /**
   * The state of the copy to clipboard operation.
   */
  state: CopyToClipboardState,
  /**
   * The function to copy a value to the clipboard.
   */
  copyToClipboard: (value: string | number) => void,
];

/**
 * Type alias for the return value of the {@link useDebounce} hook.
 */
export type UseDebounceReturn = [
  /**
   * Whether the debounce is ready.
   * - `true` - debounce has been called.
   * - `false` - debounce is pending.
   * - `null` - debounce has been cancelled.
   */
  isReady: () => boolean | null,
  /**
   * The function to clear the debounce.
   */
  cancel: () => void,
];

/**
 * Type alias for the body info value used by the{@link useLockBodyScroll} hook.
 */
export interface UseBodyLockInfoItem {
  /**
   * Tracks the number of bodies being controlled.
   */
  counter: number;
  /**
   * The initial overflow value of the body.
   */
  initialOverflow: CSSStyleDeclaration["overflow"];
}

/**
 * Type alias for the push permission descriptor.
 */
interface DevicePermissionDescriptor
  extends Omit<PermissionDescriptor, "name"> {
  /**
   * The name of the device permission.
   */
  name: "camera" | "microphone" | "speaker";
  /**
   * The id of the device.
   */
  deviceId?: string;
}

/**
 * Type alias for the MIDI permission descriptor.
 */
interface MidiPermissionDescriptor extends Omit<PermissionDescriptor, "name"> {
  /**
   * The name of the MIDI permission.
   */
  name: "midi";
  /**
   * Whether to allow sysex.
   */
  sysex?: boolean;
}

/**
 * Type alias for the device permission descriptor.
 */
interface PushPermissionDescriptor extends Omit<PermissionDescriptor, "name"> {
  /**
   * The name of the push permission.
   */
  name: "push";
  /**
   * Whether the permission is user visible only.
   */
  userVisibleOnly?: boolean;
}

/**
 * Type alias for the descriptor value of the {@link usePermission} hook.
 * This is an extension of the PermissionDescriptor type.
 */
export type UsePermissionDescriptor =
  | DevicePermissionDescriptor
  | MidiPermissionDescriptor
  | PushPermissionDescriptor;

/**
 * Type alias for the state of the permission, used by the {@link usePermission} hook.
 */
export type UsePermissionReturn = PermissionState | null;

/**
 * Type alias for the return value of the {@link useRafLoop} hook.
 */
export type UseRafLoopReturn = [
  /**
   * The function to stop the RAF loop.
   */
  stop: () => void,
  /**
   * The function to start the RAF loop.
   */
  start: () => void,
  /**
   * The function to check if the RAF loop is active.
   */
  isActive: () => boolean,
];

/**
 * Type alias for the options of the {@link useLocalStorage} and {@link useSessionStorage} hooks.
 */
export type UseStorageOptions<T> =
  | {
      /**
       * Whether the storage values should be used raw.
       */
      raw: true;
    }
  | {
      /**
       * Whether the storage values should be used raw.
       */
      raw?: false;
      /**
       * The serializer function to use when setting a storage value.
       */
      serializer: (value: T) => string;
      /**
       * The serializer function to use when setting a storage value.
       */
      deserializer: (value: string) => T;
    };

/**
 * Type alias for the return value of the {@link useLocalStorage} and {@link useSessionStorage} hooks.
 */
export type UseStorageReturn<T> = [
  /**
   * The value for the key passed to the hook.
   */
  value: T | undefined,
  /**
   * The function to set the value for the key passed to the hook.
   */
  setValue: (newValue: HookStateSetAction<T>) => void,
  /**
   * The function to remove the value for the key passed to the hook.
   */
  removeValue: () => void,
];

/**
 * Type alias for the options of the {@link useTitle} hook.
 */
export interface UseTitleOptions {
  /**
   * Whether to restore the title back to its original value on unmount.
   */
  restoreOnUnmount?: boolean;
}
