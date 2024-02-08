import { useRef } from "react";

/**
 * React hook that returns the number of times
 * the component has been rendered. Useful for debugging.
 * It includes the initial render in the count.
 *
 * @example
 * ```tsx
 * const update = useUpdate();
 * const rendersCount = useRendersCount();
 *
 * return (
 *   <div>
 *     <span>Renders count: {rendersCount}</span>
 *     <br />
 *     <button onClick={update}>re-render</button>
 *   </div>
 * );
 * ```
 *
 * @returns The number of times the component has been rendered
 *
 * @category State
 * @since 0.0.1
 */
export const useRendersCount = (): Readonly<React.MutableRefObject<number>> => {
  const rendersCount = useRef(0);
  rendersCount.current += 1;
  return rendersCount;
};
