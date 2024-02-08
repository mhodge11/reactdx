/**
 * Implementing the {@link ArrayMinLength} utility type.
 */
type ArrayMinLengthImpl<
  T,
  TMinLength extends number,
  TAcc extends T[],
> = TAcc["length"] extends TMinLength
  ? [...TAcc, ...T[]]
  : ArrayMinLengthImpl<T, TMinLength, [...TAcc, T]>;

/**
 * Utility type to ensure that an array has a minimum length.
 */
export type ArrayMinLength<T, TMinLength extends number> = ArrayMinLengthImpl<
  T,
  TMinLength,
  []
>;

/**
 * Utility type to get the tail of an array.
 */
export type ArrayTail<TArray extends unknown[]> = TArray extends [
  unknown,
  ...infer U,
]
  ? U
  : never;

/**
 * Utility type to compare two arrays.
 */
export type CompareFunction<TArrays extends ArrayMinLength<unknown[], 2>> = (
  a: TArrays[0][number],
  b: ArrayTail<TArrays>[number][number]
) => boolean;

/**
 * Utility type that defines a generic async function.
 */
export type GenericAsyncFunction = (...args: any) => Promise<any>;

/**
 * Utility type that defines a generic function.
 */
export type GenericFunction<TFunc extends (...args: any) => any> = (
  ...args: Parameters<TFunc>
) => ReturnType<TFunc>;

/**
 * Implementation type used by {@link MergeDeepObjects}.
 */
type OptionalPropertyNames<T> = {
  [K in keyof T]-?: PlainObject extends { [P in K]: T[K] } ? K : never;
}[keyof T];

/**
 * Implementation type used by {@link MergeDeepObjects}.
 */
type SpreadProperties<L, R, K extends keyof L & keyof R> = {
  [P in K]: L[P] | Exclude<R[P], undefined>;
};

/**
 * Implementation type used by {@link MergeDeepObjects}.
 */
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

/**
 * Implementation type used by {@link MergeDeepObjects}.
 */
type SpreadTwo<L, R> = Id<
  Pick<L, Exclude<keyof L, keyof R>> &
    Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> &
    Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> &
    SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

/**
 * Utility type to deeply merge objects.
 */
export type MergeDeepObjects<A extends readonly [...unknown[]]> = A extends [
  infer L,
  ...infer R,
]
  ? SpreadTwo<L, MergeDeepObjects<R>>
  : unknown;

/**
 * Utility type that defines a plain object.
 */
export type PlainObject = Record<string, unknown>;

/**
 * Utility type that defines a primitive type.
 */
export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

/**
 * Utility type that extracts the promise type from a promise.
 */
export type PromiseType<TPromise extends Promise<any>> =
  TPromise extends Promise<infer U> ? U : never;
