import { useRef } from "react";

/**
 * React state hook that returns `true` if the component is mounted for the first time.
 *
 * @example
 * ```tsx
 * const isFirstMount = useFirstMountState();
 *
 * useEffect(() => {
 *   if (isFirstMount) {
 *     // do something
 *   } else {
 *     // do something else
 *   }
 * }, [isFirstMount]);
 * ```
 *
 * @returns `true` if the component is mounted for the first time, otherwise `false`
 *
 * @category State
 * @since 0.0.1
 */
export const useFirstMountState = (): boolean => {
  const _firstMount = useRef(true);

  if (_firstMount.current) {
    _firstMount.current = false;
    return true;
  }

  return _firstMount.current;
};
