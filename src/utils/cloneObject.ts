import { isDateObject } from "./isDateObject.ts";
import { isObject } from "./isObject";
import { isPlainObject } from "./isPlainObject";
import { isWeb } from "./isWeb";

/**
 * Clones an object or array deeply.
 *
 * @param data The data to clone
 * @returns A deep clone of the data
 */
export const cloneObject = <T>(data: T): T => {
  let clone: any;
  const isArray = Array.isArray(data);

  if (isDateObject(data)) {
    clone = new Date(data);
  } else if (data instanceof Set) {
    clone = new Set(data);
  } else if (
    !(isWeb() && (data instanceof Blob || data instanceof FileList)) &&
    (isArray || isObject(data))
  ) {
    clone = isArray ? [] : {};

    if (!isArray && !isPlainObject(data)) {
      clone = data;
    } else {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          clone[key] = cloneObject((data as any)[key]);
        }
      }
    }
  } else {
    return data;
  }

  return clone;
};
