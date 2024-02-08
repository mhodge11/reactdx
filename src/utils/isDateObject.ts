/**
 * Check if the value is a Date object.
 *
 * @param value The value to check
 * @returns `true` if the value is a Date object, `false` otherwise
 */
export const isDateObject = (value: unknown): value is Date =>
  value instanceof Date;
