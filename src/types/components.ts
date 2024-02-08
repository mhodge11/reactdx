import type { Keystrokes } from "../logic/keystrokes.ts";

import type { UseAnimationOptions } from "./animations.ts";
import type { AnimatableProps } from "./logic.ts";

/**
 * Type alias for the Keystrokes context.
 */
export type KeystrokesContextData = () => Keystrokes;

/**
 * Type alias for the Keystrokes provider props.
 */
export interface KeystrokesProviderProps {
  /**
   * The Keystrokes instance.
   */
  keystrokes: Keystrokes;
  /**
   * The children to render within the provider.
   */
  children: React.ReactNode;
}

/**
 * Type alias for the Animate component ref.
 */
export interface AnimateComponentRef {
  /**
   * Set the velocity for a property.
   *
   * @param prop The property to set the velocity for.
   * @param value The velocity to set for the property.
   */
  setVelocity<Prop extends keyof AnimatableProps>(
    prop: Prop,
    value: AnimatableProps[Prop]
  ): void;
  /**
   * Set the current value for a property.
   *
   * @param prop The property to set the current value for.
   * @param value The value to set for the property.
   */
  setCurrentValue<Prop extends keyof AnimatableProps>(
    prop: keyof AnimatableProps,
    value: AnimatableProps[Prop]
  ): void;
  /**
   * Get the current value for a property.
   *
   * @param prop The property to get the current value for.
   * @returns The current value for the property.
   */
  getCurrentValue<Prop extends keyof AnimatableProps>(
    prop: Prop
  ): AnimatableProps[Prop];
}

/**
 * Type alias for the Animate component props.
 */
export interface AnimateComponentProps
  extends UseAnimationOptions,
    Partial<AnimatableProps> {
  /**
   * The children to animate.
   */
  children:
    | React.ReactElement<any>
    | ((animating: boolean) => React.ReactElement<any>);
}
