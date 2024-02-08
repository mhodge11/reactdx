/**
 * Type alias for the return value of the {@link usePromise} hook.
 *
 * @param promise The promise to use
 * @param onError (Optional) The error handler to run if the promise is rejected
 * @returns The promise
 */
export type UsePromiseReturn = <T, TError = unknown>(
  promise: Promise<T>,
  onError?: (error: TError) => void
) => Promise<T>;

/**
 * Type of event listener target that can be used with the {@link useEvent} hook.
 *
 * Specifically, this is a `Window` or an object
 * with `addEventListener` and `removeEventListener` methods.
 */
export interface UseEventListener extends Window {
  /**
   * Adds an event listener to the target.
   *
   * @param name The name of the event to listen to
   * @param handler The handler to run when the event is triggered
   * @param args Any additional arguments to pass to the handler
   */
  addEventListener: (
    name: string,
    handler: (event?: any) => void,
    ...args: any
  ) => void;
  /**
   * Removes an event listener from the target.
   *
   * @param name The name of the event to remove the listener from
   * @param handler The handler to remove
   * @param args Any additional arguments to pass to the handler
   */
  removeEventListener: (
    name: string,
    handler: (event?: any) => void,
    ...args: any
  ) => void;
}

/**
 * Type of event listener target that can be used with the {@link useEvent} hook.
 *
 * Specifically, this is an object with `on` and `off` methods.
 */
export interface UseEventOnOff {
  /**
   * Adds an event listener to the target.
   *
   * @param name The name of the event to listen to
   * @param handler The handler to run when the event is triggered
   * @param args Any additional arguments to pass to the handler
   */
  on: (name: string, handler: (event?: any) => void, ...args: any) => void;
  /**
   * Removes an event listener from the target.
   *
   * @param name The name of the event to remove the listener from
   * @param handler The handler to remove
   * @param args Any additional arguments to pass to the handler
   */
  off: (name: string, handler: (event?: any) => void, ...args: any) => void;
}

/**
 * Basic type of the `addEventListener` or `on` method,
 * depending on the type of the target.
 */
export type AddEventListener<T> = T extends UseEventListener
  ? T["addEventListener"]
  : T extends UseEventOnOff
    ? T["on"]
    : never;

/**
 * The type of the target that can be used with `useEvent`.
 */
export type UseEventTarget = UseEventListener | UseEventOnOff;

/**
 * The type of the options that can be used with the {@link useEvent} hook.
 *
 * This is the third argument of `addEventListener` or `on`.
 */
export type UseEventOptions<T> = Parameters<AddEventListener<T>>[2];
