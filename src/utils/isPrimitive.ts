import type { Primitive } from "../types/utils.ts";

import { isNullOrUndefined } from "./isNullOrUndefined.ts";
import { isObjectType } from "./isObject.ts";

/**
 * Checks if the given value is a primitive.
 *
 * @param value The value to check
 * @returns `true` if the value is a primitive, `false` otherwise
 */
export const isPrimitive = (value: unknown): value is Primitive =>
  isNullOrUndefined(value) || !isObjectType(value);
