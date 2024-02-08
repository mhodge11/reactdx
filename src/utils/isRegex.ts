/**
 * Checks if the value is a regular expression.
 *
 * @param value The value to check
 * @returns `true` if the value is a regular expression, `false` otherwise
 */
export const isRegex = (value: unknown): value is RegExp =>
  value instanceof RegExp;
