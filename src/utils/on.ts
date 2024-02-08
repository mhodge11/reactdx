/**
 * Function to add an event listener to an object.
 *
 * @param obj The object to add the event listener to
 * @param args The arguments to pass to the `addEventListener` method
 */
export const on = <T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args: Parameters<T["addEventListener"]> | [string, Function | null, ...any]
): void => {
  if (obj && obj.addEventListener) {
    obj.addEventListener(
      ...(args as Parameters<HTMLElement["addEventListener"]>)
    );
  }
};
