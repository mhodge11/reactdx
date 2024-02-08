import React, { cloneElement, useImperativeHandle, useRef } from "react";

import { useAnimation } from "../hooks/animations/useAnimation.ts";
import { useUpdate } from "../hooks/animations/useUpdate.ts";
import { ensuredForwardRef } from "../hooks/misc/ensuredForwardRef.ts";
import type {
  AnimateComponentProps,
  AnimateComponentRef,
} from "../types/components.ts";
import type { AnimatableProps } from "../types/logic.ts";
import { isFunction } from "../utils/isFunction.ts";
import { isObjectType } from "../utils/isObject.ts";

/**
 * The Animate component.
 *
 * This component is used to animate children using the
 * `{@link useAnimation}` hook. It is used to animate
 * elements using spring physics.
 *
 * To use this component, you can pass the children to
 * animate as the children prop. You can also pass the
 * animation options to use for the animation.
 *
 * @example
 * ```tsx
 * const ref = useRef<AnimateComponentRef>()
 *
 * <Animate
 *   ref={ref}
 *   animate={true}
 *   tension={230}
 *   friction={22}
 *   delay={0}
 *   displacementThreshold={0.001}
 *   speedThreshold={0.001}
 *   clamp={false}
 *   onStart={() => console.log("Animating...")}
 *   onEnd={() => console.log("Done animating...")}
 * >
 *   <div>Animating this component</div>
 * </Animate>
 * ```
 *
 * @param props The Animate component props to use
 * @param props.children The children to animate
 * @param props.animate (Optional) Whether to animate the children
 * @param props.tension (Optional) The tension to use for the spring
 * @param props.friction (Optional) The friction to use for the spring
 * @param props.delay (Optional) The delay to use for the spring
 * @param props.displacementThreshold (Optional) The displacement threshold to use for the spring
 * @param props.speedThreshold (Optional) The speed threshold to use for the spring
 * @param props.clamp (Optional) Whether to clamp the spring
 * @param props.onStart (Optional) The callback to call when the animation starts
 * @param props.onEnd (Optional) The callback to call when the animation ends
 * @param props.[...rest] (Optional) The rest of the animation options
 * @param forwardedRef The forwarded ref to use
 * @category Component
 * @since 0.0.1
 */
export const Animate = ensuredForwardRef(
  (
    {
      animate = true,
      tension = 230,
      friction = 22,
      delay = 0,
      displacementThreshold = 0.001,
      speedThreshold = 0.001,
      clamp = false,
      onStart,
      onEnd,
      children,
      ...props
    }: AnimateComponentProps,
    forwardedRef: React.Ref<AnimateComponentRef>
  ) => {
    const update = useUpdate();

    const ref = useRef<HTMLElement>();
    const animatingRef = useRef(false);
    const latestChildrenRef = useRef(children);

    latestChildrenRef.current = children;

    const springs = useAnimation(ref, props, {
      animate,
      tension,
      friction,
      delay,
      displacementThreshold,
      speedThreshold,
      clamp,
      onStart: () => {
        animatingRef.current = true;

        // Trigger a re-render
        if (isFunction(latestChildrenRef.current)) {
          update();
        }

        onStart?.();
      },
      onEnd: () => {
        animatingRef.current = false;

        // Trigger a re-render
        if (isFunction(latestChildrenRef.current)) {
          update();
        }

        onEnd?.();
      },
    });

    /*
    biome-ignore lint/correctness/useExhaustiveDependencies:
    This is a bug in the biome linter. It should not be flagging this line.
    */
    useImperativeHandle(
      forwardedRef,
      () => ({
        setVelocity<Prop extends keyof AnimatableProps>(
          prop: Prop,
          value: AnimatableProps[Prop]
        ) {
          const spring = springs[prop];
          spring?.setVelocity(value as any);
        },
        setCurrentValue<Prop extends keyof AnimatableProps>(
          prop: Prop,
          value: AnimatableProps[Prop]
        ) {
          const spring = springs[prop];
          spring?.setCurrentValue(value as any);
        },
        getCurrentValue<Prop extends keyof AnimatableProps>(prop: Prop) {
          const spring = springs[prop];
          return spring?.getCurrentValue() as AnimatableProps[Prop];
        },
      }),
      [springs]
    );

    if (isFunction(children)) {
      children = children(animatingRef.current);
    }

    const child = React.Children.only(children);

    return cloneElement(child, {
      ref: (element: HTMLElement | undefined) => {
        ref.current = element;

        if (
          "ref" in child &&
          isObjectType(child.ref) &&
          "current" in child.ref
        ) {
          child.ref.current = element;
          // @ts-expect-error: This is a hack to forward the ref to the caller
        } else if (isFunction(child.ref)) {
          // @ts-expect-error: This is a hack to forward the ref to the caller
          child.ref(element);
        }
      },
    });
  }
);

Animate.displayName = "Animate";
