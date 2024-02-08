import { useEffect, useMemo, useRef, useState } from "react";

import { Spring, SpringSystem } from "../../logic/springs.ts";

/**
 * React animation hook that updates a single numeric value
 * over time according to spring dynamics.
 *
 * @example
 * ```tsx
 * const [target, setTarget] = useState(50);
 * const value = useSpring(target);
 *
 * return (
 *   <div>
 *     {value}
 *     <br />
 *     <button onClick={() => setTarget(0)}>
 *       Set 0
 *     </button>
 *     <button onClick={() => setTarget(100)}>
 *       Set 100
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @param targetValue The target value to tween to
 * @param tension The tension of the spring
 * @param friction The friction of the spring
 * @returns The spring value
 *
 * @category Animation
 * @since 0.0.1
 */
export const useSpring = (
  targetValue: number = 0,
  tension: number = 50,
  friction: number = 3
): number => {
  const [spring, setSpring] = useState<Spring | null>(null);
  const [value, setValue] = useState(targetValue);

  // Memoize listener to being able to unsubscribe later properly, otherwise
  // listener fn will be different on each re-render and wouldn't unsubscribe properly.
  const listener = useMemo(
    () => ({
      onSpringUpdate: (currentSpring: Spring) => {
        const newValue = currentSpring.getCurrentValue();
        setValue(newValue);
      },
    }),
    []
  );

  const targetValueRef = useRef(targetValue);
  targetValueRef.current = targetValue;

  useEffect(() => {
    if (!spring) {
      const newSpring = new SpringSystem().createSpring(tension, friction);
      newSpring.setCurrentValue(targetValueRef.current);
      setSpring(newSpring);
      newSpring.addListener(listener);
    }

    return () => {
      if (spring) {
        spring.removeListener(listener);
        setSpring(null);
      }
    };
  }, [tension, friction, listener, spring]);

  useEffect(() => {
    if (spring) {
      spring.setEndValue(targetValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue]);

  return value;
};
