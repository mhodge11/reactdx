/**
 * Checks if the navigator object is available.
 *
 * @returns `true` if the navigator object is available, `false` otherwise
 */
export const hasNavigator = (): boolean => {
  try {
    return typeof navigator !== "undefined";
  } catch {
    return false;
  }
};
