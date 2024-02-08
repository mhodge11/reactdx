import { useCallback, useEffect, useState } from "react";

/**
 * React side-effect hook that returns an error dispatcher.
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const dispatchError = useError();
 *
 *   const clickHandler = () => {
 *     dispatchError(new Error("Some error!"));
 *   };
 *
 *   return (
 *     <button onClick={clickHandler}>
 *       Click me to throw
 *     </button>
 *   );
 * };
 *
 * // In parent app
 * const App = () => (
 *   <ErrorBoundary>
 *     <Component />
 *   </ErrorBoundary>
 * );
 * ```
 *
 * @returns A callback to dispatch an error
 */
export const useError = (): ((error: Error) => void) => {
  const [err, setErr] = useState<Error>();

  useEffect(() => {
    if (err) {
      throw err;
    }
  }, [err]);

  const dispatchError = useCallback((error: Error) => {
    setErr(error);
  }, []);

  return dispatchError;
};
