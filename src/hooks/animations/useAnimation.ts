import { useCallback, useEffect, useRef } from "react";

import { toStyle } from "../../logic/animation.ts";
import {
  MultiSpring,
  Spring,
  SpringConfig,
  SpringSystem,
} from "../../logic/springs.ts";
import type {
  SpringForAnimatableProp,
  UseAnimationOptions,
  UseAnimationReturn,
} from "../../types/animations.ts";
import type { AnimatableProps } from "../../types/logic.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";
import { useLatest } from "../states/useLatest.ts";

/**
 * The spring system to use.
 */
const springSystem = new SpringSystem();

/**
 * Creates a spring for an animatable property.
 *
 * @param startValue The start value of the spring.
 * @param tension The tension of the spring.
 * @param friction The friction of the spring.
 * @returns The spring for the property.
 */
const createSpring = <Prop extends keyof AnimatableProps>(
  startValue: AnimatableProps[Prop],
  tension: number,
  friction: number
): SpringForAnimatableProp<Prop> => {
  let spring: MultiSpring<number[]> | Spring;

  if (Array.isArray(startValue)) {
    spring = new MultiSpring(springSystem, new SpringConfig(tension, friction));
    spring.setCurrentValue(startValue);
  } else {
    spring = springSystem.createSpringWithConfig(
      new SpringConfig(tension, friction)
    );
    spring.setCurrentValue(startValue);
  }

  return spring as SpringForAnimatableProp<Prop>;
};

/**
 * The default options for the animation.
 */
const defaultOptions: UseAnimationOptions = {
  animate: true,
  tension: 230,
  friction: 22,
  delay: 0,
  displacementThreshold: 0.001,
  speedThreshold: 0.001,
  clamp: false,
};

/**
 * React animation hook that animates the properties of an element.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 *
 * const springs = useAnimation(ref, {
 *   opacity: 1,
 *   scale: 1,
 * });
 *
 * return (
 *   <div
 *     ref={ref}
 *     style={{
 *       opacity: springs.opacity,
 *       scale: springs.scale
 *     }}
 *   >
 *     I'm animated!
 *   </div>
 * );
 * ```
 *
 * @param ref The reference to the element to animate.
 * @param props The properties to animate.
 * @param options (Optional) The options for the animation.
 * @param options.animate (Optional) Whether to animate the properties.
 * @param options.tension (Optional) The tension of the spring.
 * @param options.friction (Optional) The friction of the spring.
 * @param options.delay (Optional) The delay of the animation.
 * @param options.displacementThreshold (Optional) The displacement threshold of the spring.
 * @param options.speedThreshold (Optional) The speed threshold of the spring.
 * @param options.clamp (Optional) Whether to clamp the spring.
 * @param options.onStart (Optional) The callback to call when the animation starts.
 * @param options.onEnd (Optional) The callback to call when the animation ends.
 * @returns An object with the springs as values for the `props` keys.
 */
export const useAnimation = <TProps extends keyof Partial<AnimatableProps>>(
  ref: React.RefObject<HTMLElement | null | undefined>,
  props: { [Prop in TProps]?: AnimatableProps[Prop] },
  options: UseAnimationOptions = defaultOptions
): UseAnimationReturn<TProps> => {
  const {
    animate = true,
    tension = 230,
    friction = 22,
    delay = 0,
    displacementThreshold = 0.001,
    speedThreshold = 0.001,
    clamp = false,
    onEnd,
    onStart,
  } = options;

  const springsRef = useRef({} as UseAnimationReturn<TProps>);
  const animatingRef = useRef(0);

  const onStartRef = useLatest(onStart);
  const onSpringActivate = useCallback(() => {
    animatingRef.current += 1;
    if (animatingRef.current === 1) {
      onStartRef.current?.();
    }
  }, [onStartRef]);

  const onEndRef = useLatest(onEnd);
  const onSpringAtRest = useCallback(() => {
    animatingRef.current -= 1;
    if (animatingRef.current === 0) {
      onEndRef.current?.();
    }
  }, [onEndRef]);

  const requestRef = useRef<number | null>(null);
  const onSpringUpdate = useCallback(() => {
    const performUpdate = () => {
      if (!ref.current) {
        return;
      }

      requestRef.current = null;

      const currentValues: { [Prop in TProps]?: AnimatableProps[Prop] } = {};

      for (const prop in springsRef.current) {
        currentValues[prop] = springsRef.current[
          prop
        ].getCurrentValue() as AnimatableProps[Extract<TProps, string>];
      }

      const style = toStyle(currentValues);

      for (const p in style) {
        const prop = p as keyof React.CSSProperties;

        // @ts-expect-error: `style` is a CSSStyleDeclaration
        ref.current.style[
          prop as Exclude<keyof CSSStyleDeclaration, "length" | "parentRule">
        ] = style[prop];
      }
    };

    if (!requestRef.current) {
      requestAnimationFrame(performUpdate);
    }
  }, [ref]);

  useEffect(() => {
    for (const prop in props) {
      const value = props[prop];
      if (value === undefined) {
        continue;
      }

      let spring = springsRef.current[prop];
      if (!spring) {
        spring = springsRef.current[prop] = createSpring(
          value,
          tension,
          friction
        );

        spring.setRestSpeedThreshold(speedThreshold);
        spring.setRestDisplacementThreshold(displacementThreshold);
        spring.setOvershootClampingEnabled(clamp);
        spring.addListener({
          onSpringActivate,
          onSpringAtRest,
          onSpringUpdate,
        });
      }

      if (!animate) {
        spring.setCurrentValue(
          value as number & AnimatableProps[Extract<TProps, string>]
        );
        continue;
      }

      if (delay) {
        setTimeout(
          () =>
            spring.setEndValue(
              value as number & AnimatableProps[Extract<TProps, string>]
            ),
          delay
        );
      } else {
        spring.setEndValue(
          value as number & AnimatableProps[Extract<TProps, string>]
        );
      }
    }
  });

  useEffectOnce(() => {
    return () => {
      for (const prop in springsRef.current) {
        springsRef.current[prop].setAtRest();
        springsRef.current[prop].destroy();
      }
    };
  });

  return springsRef.current;
};
