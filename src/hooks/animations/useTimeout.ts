import type { UseTimeoutFnReturn } from "../../types/animations.ts";

import { useTimeoutFn } from "./useTimeoutFn.ts";
import { useUpdate } from "./useUpdate.ts";

/**
 * React animation hook that forces component to re-render after
 * a specified amount of milliseconds.
 *
 * Returns a tuple with the following values:
 * - **`isReady: () => boolean | null`** - Returns the current timeout state:
 *   - **`false`** - Timeout is pending.
 *   - **`true`** - Timeout has been called.
 *   - **`null`** - Timeout has been cancelled.
 * - **`cancel: () => void`** - Cancels the timeout.
 * - **`reset: () => void`** - Resets the timeout.
 *
 * @example
 * ```tsx
 * const [isReady, cancel] = useTimeout(5000);
 *
 * return (
 *   <div>
 *     {isReady()
 *       ? "I'm reloaded after timeout"
 *       : "I will be reloaded after 5s"
 *     }
 *     {isReady() === false
 *       ? <button onClick={cancel}>Cancel</button>
 *       : ""
 *     }
 *   </div>
 * );
 * ```
 *
 * @param ms The amount of milliseconds to wait before re-rendering
 * @returns A tuple containing the timeout state and the cancel and reset functions
 *
 * @category Animation
 * @since 0.0.1
 */
export const useTimeout = (ms: number = 0): UseTimeoutFnReturn => {
  const update = useUpdate();
  return useTimeoutFn(update, ms);
};
