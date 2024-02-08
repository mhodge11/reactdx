/**
 * Prettifies an object into a string representation.
 *
 * @param obj The object to prettify
 * @returns A prettified string representation of the object
 */
export const prettify = (obj: object): string => JSON.stringify(obj, null, 2);
