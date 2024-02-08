/**
 * Check if the value is null or undefined.
 *
 * @param value The value to check
 * @returns `true` if the value is null or undefined, `false` otherwise
 */
export const isNullOrUndefined = (value: unknown): value is null | undefined =>
  value == null;
