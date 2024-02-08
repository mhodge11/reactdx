import type { GenericFunction } from "../types/utils.ts";

/**
 * Throttles a function.
 *
 * @param fn The function to throttle
 * @param ms The number of milliseconds to throttle the function
 * @returns The throttled function
 */
export const throttle = <TFunc extends GenericFunction<TFunc>>(
  callback: TFunc,
  ms: number
): TFunc => {
  let isThrottled = false;
  let lastResult: ReturnType<TFunc>;

  return function (this: unknown, ...args: Parameters<TFunc>) {
    if (!isThrottled) {
      lastResult = callback.apply(this, args);
      isThrottled = true;
      setTimeout(() => {
        isThrottled = false;
      }, ms);
    }

    return lastResult;
  } as TFunc;
};
