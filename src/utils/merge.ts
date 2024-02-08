import type {
  ArrayMinLength,
  MergeDeepObjects,
  PlainObject,
} from "../types/utils.ts";

import { isPlainObject } from "./isPlainObject.ts";

/**
 * This function combines two or more objects into a single new object.
 * Arrays and other types are overwritten.
 *
 * @param target The target object
 * @param sources The source objects
 * @returns A new merged object
 */
export function merge<
  TTarget extends PlainObject,
  TSources extends ArrayMinLength<PlainObject, 1>,
>(
  target: TTarget,
  ...sources: TSources
): MergeDeepObjects<[TTarget, ...TSources]> {
  const targetCopy = { ...target };
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      (targetCopy as PlainObject)[key] =
        isPlainObject(value) && isPlainObject(targetCopy[key])
          ? merge(targetCopy[key] as PlainObject, value)
          : value;
    }
  }
  return targetCopy as MergeDeepObjects<[TTarget, ...TSources]>;
}
