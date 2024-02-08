/**
 * Check if a value is a function.
 *
 * @param value The value to check
 * @returns `true` if the value is a function, `false` otherwise
 */
export const isFunction = (value: unknown): value is Function =>
  typeof value === "function";
