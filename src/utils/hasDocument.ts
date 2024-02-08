/**
 * Checks if the document object is available.
 *
 * @returns `true` if the document object is available, `false` otherwise
 */
export const hasDocument = (): boolean => {
  try {
    return typeof document !== "undefined";
  } catch {
    return false;
  }
};
