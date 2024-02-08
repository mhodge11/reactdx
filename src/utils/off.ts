/**
 * Function to remove an event listener from an object.
 *
 * @param obj The object to remove the event listener from
 * @param args The arguments to pass to the `removeEventListener` method
 */
export const off = <T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args:
    | Parameters<T["removeEventListener"]>
    | [string, Function | null, ...any]
): void => {
  if (obj?.removeEventListener) {
    obj.removeEventListener(
      ...(args as Parameters<HTMLElement["removeEventListener"]>)
    );
  }
};
