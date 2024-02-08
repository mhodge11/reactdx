import { useEffect, useRef, useState } from "react";

import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";

/**
 * React sensor hook that keeps track of whether the user
 * is scrolling or not.
 *
 * @example
 * ```tsx
 * const scrollRef = useRef(null);
 * const scrolling = useScrolling(scrollRef);
 *
 * return (
 *   <div ref={scrollRef}>
 *     {<div>{scrolling ? "Scrolling" : "Not scrolling"}</div>}
 *   </div>
 * );
 * ```
 *
 * @param ref The ref object that points to the element to track whether it is scrolling or not.
 * @returns `true` if the element is scrolling, `false` otherwise.
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useScrolling = (ref: React.RefObject<HTMLElement>): boolean => {
  const [scrolling, setScrolling] = useState(false);

  const _scrolling = useRef(scrolling);
  _scrolling.current = scrolling;

  useEffect(() => {
    if (!ref?.current) {
      return;
    }

    const el = ref.current;

    const handleScrollEnd = () => {
      if (_scrolling.current) {
        setScrolling(false);
      }
    };

    const handleScroll = () => {
      if (!_scrolling.current) {
        setScrolling(true);
      }
    };

    on(el, "scroll", handleScroll, false);
    on(el, "scrollend", handleScrollEnd, false);

    return () => {
      if (!_scrolling.current) {
        setScrolling(false);
      }
      off(el, "scroll", handleScroll, false);
      off(el, "scrollend", handleScrollEnd, false);
    };
  }, [ref]);

  return scrolling;
};
