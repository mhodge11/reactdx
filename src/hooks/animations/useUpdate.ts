import { useReducer } from "react";

/**
 * Updates a number by incrementing it by one and
 * getting the modulo of 1,000,000.
 *
 * This is useful for triggering a re-render
 *
 * @param num The number to update
 * @returns The updated number
 */
const updateReducer = (num: number) => (num + 1) % 1_000_000;

/**
 * React utility hook that returns a function that
 * forces component to re-render when called.
 *
 * @example
 * ```tsx
 * const update = useUpdate();
 *
 * // The component will re-render when the button is clicked
 * return (
 *   <>
 *     <div>Time: {Date.now()}</div>
 *     <button onClick={update}>Update</button>
 *   </>
 * )
 * ```
 *
 * @returns A function that will trigger a re-render when called
 *
 * @category Animation
 * @since 0.0.1
 */
export const useUpdate = (): React.DispatchWithoutAction => {
  const [, update] = useReducer(updateReducer, 0);
  return update;
};
