/**
 * Checks if the window object is available.
 *
 * @returns `true` if the window object is available, `false` otherwise
 */
export const hasWindow = (): boolean => {
  try {
    return typeof window !== "undefined";
  } catch {
    return false;
  }
};
