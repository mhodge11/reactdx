import type { PlainObject } from "../types/utils.ts";

/**
 * Checks if the given value is a plain object.
 *
 * @param value The value to check
 * @returns `true` if the value is a plain object, `false` otherwise
 */
export const isPlainObject = (value: unknown): value is PlainObject =>
  value?.constructor === Object;
