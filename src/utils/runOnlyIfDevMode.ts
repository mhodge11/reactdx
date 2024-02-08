/**
 * Run a function only if the environment is not production.
 *
 * @param fn The function to run
 */
export const runOnlyIfDevMode = (fn: () => void): void => {
  if (process.env.NODE_ENV !== "production") {
    fn();
  }
};
