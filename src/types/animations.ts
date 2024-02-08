import type { MultiSpring, Spring } from "../logic/springs.ts";

import type { AnimatableProps } from "./logic.ts";

/**
 * Type alias for the return value of the {@link useTimeout} and {@link useTimeoutFn} hooks.
 */
export type UseTimeoutFnReturn = [
  /**
   * Whether the timeout is ready.
   * - `true` - timeout has been called.
   * - `false` - timout is pending.
   * - `null` - timeout has been cancelled.
   */
  isReady: () => boolean | null,
  /**
   * The function to clear the timeout.
   */
  cancel: () => void,
  /**
   * The function to reset the timeout.
   */
  reset: () => void,
];

/**
 * Type alias for the spring for a specific property.
 */
export type SpringForAnimatableProp<Prop extends keyof AnimatableProps> =
  AnimatableProps[Prop] extends number[]
    ? MultiSpring<AnimatableProps[Prop]>
    : Spring;

/**
 * Type alias for the options of the animation.
 */
export interface UseAnimationOptions {
  /**
   * Whether to animate the properties.
   */
  animate?: boolean;
  /**
   * The tension of the spring.
   */
  tension?: number;
  /**
   * The friction of the spring.
   */
  friction?: number;
  /**
   * The delay of the animation.
   */
  delay?: number;
  /**
   * The displacement threshold of the spring.
   */
  displacementThreshold?: number;
  /**
   * The speed threshold of the spring.
   */
  speedThreshold?: number;
  /**
   * Whether to clamp the spring.
   */
  clamp?: boolean;
  /**
   * The callback to call when the animation starts.
   */
  onStart?: () => void;
  /**
   * The callback to call when the animation ends.
   */
  onEnd?: () => void;
}

/**
 * Type alias for the state of the animation.
 */
export type UseAnimationReturn<Props extends keyof Partial<AnimatableProps>> = {
  [Prop in Props]: SpringForAnimatableProp<Prop>;
};
