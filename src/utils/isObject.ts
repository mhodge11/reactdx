import { isDateObject } from "./isDateObject.ts";
import { isNullOrUndefined } from "./isNullOrUndefined.ts";

/**
 * Checks if the given value is `typeof object`.
 *
 * @param value The value to check
 * @returns `true` if the value is `typeof object`, `false` otherwise
 */
export const isObjectType = (value: unknown): value is object =>
  typeof value === "object";

/**
 * Checks if the given value is an object.
 *
 * @param value The value to check
 * @returns `true` if the value is an object, `false` otherwise
 */
export const isObject = <T extends object>(
  value: unknown
): value is NonNullable<T> =>
  !isNullOrUndefined(value) &&
  !Array.isArray(value) &&
  isObjectType(value) &&
  !isDateObject(value);
