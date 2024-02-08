import { isObject } from "./isObject.ts";

/**
 * Checks if the given values are shallowly equal.
 *
 * @param a The first value to check
 * @param b The second value to check
 * @returns `true` if the values are shallowly equal, `false` otherwise
 */
export const shallowEqual = <T>(a: unknown, b: T): a is T => {
  if (a === b) {
    return true;
  }

  if (!isObject(a) || !isObject(b)) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!(key in b)) {
      return false;
    }
  }

  for (const [key, value] of Object.entries(a)) {
    if (value !== (b as any)[key]) {
      return false;
    }
  }

  return true;
};
