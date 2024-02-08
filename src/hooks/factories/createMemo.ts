import { useMemo } from "react";

import type { GenericFunction } from "../../types/utils.ts";

/**
 * Factory that receives a function to be memoized
 * and returns a memoized React hook
 * which receives the same arguments
 * and returns the same result as the original function.
 *
 * @example
 * ```tsx
 * const fibonacci = (n) => {
 *   if (n === 0) return 0;
 *   if (n === 1) return 1;
 *   return fibonacci(n - 1) + fibonacci(n - 2);
 * };
 *
 * const useMemoFibonacci = createMemo(fibonacci);
 *
 * const Component = () => {
 *   const result = useMemoFibonacci(10);
 *   // ...
 * }
 * ```
 *
 * @param fn The function to memoize
 * @returns A memoized version of the function
 *
 * @category Factory
 * @since 0.0.1
 */
export const createMemo =
  <TFunc extends GenericFunction<TFunc>>(fn: TFunc) =>
  (...args: Parameters<TFunc>): ReturnType<TFunc> =>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo<ReturnType<TFunc>>(() => fn(...args), args);
