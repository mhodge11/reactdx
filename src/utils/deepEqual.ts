import { isDateObject } from "./isDateObject.ts";
import { isObject } from "./isObject.ts";
import { isPrimitive } from "./isPrimitive.ts";
import { warn } from "./warn.ts";

/**
 * Checks if two values are deeply equal.
 *
 * @param a The first value to compare
 * @param b The second value to compare
 * @throws If the values are circular or too deeply nested (environment specific)
 * @returns `true` if the values are deeply equal, otherwise `false`
 */
export const deepEqual = <T>(a: unknown, b: T): a is T => {
  try {
    if (isPrimitive(a) || isPrimitive(b)) {
      return a === b;
    }

    if (isDateObject(a) && isDateObject(b)) {
      return a.getTime() === b.getTime();
    }

    const keysA = Object.keys(a as any);
    const keysB = Object.keys(b as any);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      const valA = (a as any)[key];

      if (!keysB.includes(key)) {
        return false;
      }

      if (
        key === "ref" ||
        ((key === "_owner" || key === "__v" || key === "__o") &&
          (a as any).$$typeof)
      ) {
        continue;
      }

      const valB = (b as any)[key];

      if (
        (isDateObject(valA) && isDateObject(valB)) ||
        (isObject(valA) && isObject(valB)) ||
        (Array.isArray(valA) && Array.isArray(valB))
          ? !deepEqual(valA, valB)
          : valA !== valB
      ) {
        return false;
      }
    }

    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message ?? "").match(/stack|recursion/i)
    ) {
      // warn on circular references, don't crash
      // browsers give this different errors name and messages:
      // chrome/safari: "RangeError", "Maximum call stack size exceeded"
      // firefox: "InternalError", too much recursion"
      // edge: "Error", "Out of stack space"
      warn("`deepEqual` cannot handle circular refs");
      return false;
    }

    // some other error. we should definitely know about these
    throw error;
  }
};
