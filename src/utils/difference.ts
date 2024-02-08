import type { ArrayMinLength, CompareFunction } from "../types/utils.ts";

import { isFunction } from "./isFunction.ts";

/**
 * Flattens an array of arrays into a single array.
 *
 * ***Note:** This function is faster than `Array.prototype.flat`
 * on Node >= 19.*
 *
 * @param arrays The arrays to flatten
 * @returns The flattened array
 */
const fastArrayFlat = <T>(arrays: (readonly T[])[]): readonly T[] => {
  let result = arrays.shift() ?? [];
  for (const array of arrays) {
    result = [...result, ...array];
  }
  return result;
};

/**
 * Create a new array with values from the first array that are not present in the other arrays.
 * Optionally, use a compare function to determine the comparison of elements (default is `===`).
 *
 * @param arraysOrCompareFn Two or more arrays with an optional compare function at the end
 * @returns The new array of filtered values
 */
export function difference<T>(
  ...arraysOrCompareFn: ArrayMinLength<T[], 2>
): T[];
export function difference<TArrays extends ArrayMinLength<unknown[], 2>>(
  ...arraysOrCompareFn: [...TArrays, CompareFunction<TArrays>]
): TArrays[0];
export function difference<TArrays extends ArrayMinLength<unknown[], 2>, T>(
  ...arraysOrCompareFn:
    | ArrayMinLength<T[], 2>
    | [...TArrays, CompareFunction<TArrays>]
): TArrays[0] {
  const compareFnProvided = isFunction(arraysOrCompareFn.at(-1));
  const compareFunction =
    compareFnProvided && (arraysOrCompareFn.pop() as CompareFunction<TArrays>);

  const arrays = arraysOrCompareFn as TArrays;
  const firstArray = arrays.shift()!;
  const combinedRestArray = fastArrayFlat(arrays);

  if (!compareFunction) {
    const restSet = new Set(combinedRestArray);
    return firstArray.filter(element => !restSet.has(element));
  }

  const difference: TArrays[0] = [];
  for (const element of firstArray) {
    if (combinedRestArray.every(item => !compareFunction(element, item))) {
      difference.push(element);
    }
  }

  return difference;
}
