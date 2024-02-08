import { useEffect, useState } from "react";

import { isFunction } from "../../utils/isFunction.ts";

/**
 * React sensor hook that tracks the changes in the intersection of a
 * target element with an ancestor element or with a top-level document's
 * viewport. Uses the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
 * and returns an [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry).
 *
 * @example
 * ```tsx
 * const intersectionRef = useRef(null);
 *
 * const intersection = useIntersection(intersectionRef, {
 *   root: null,
 *   rootMargin: "0px",
 *   threshold: 1
 * });
 *
 * return (
 *   <div ref={intersectionRef}>
 *     {intersection && intersection.intersectionRatio < 1
 *       ? "Obscured"
 *       : "Fully in view"}
 *   </div>
 * );
 * ```
 *
 * @param ref The target element
 * @param options (Optional) The options to pass to the Intersection Observer
 * @param options.root (Optional) The element that is used as the viewport for checking visibility of the target (Defaults to the browser viewport if not specified or if null)
 * @param options.rootMargin (Optional) Margin around the root. Can have values similar to the CSS margin propert (Defaults to `0px`)
 * @param options.threshold (Optional) Either a single number or an array of numbers which indicate at what percentage of the target's visibility the observer's callback should be executed (Defaults to `1`)
 * @returns The IntersectionObserverEntry
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useIntersection = (
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): IntersectionObserverEntry | null => {
  const [intersectionObserverEntry, setIntersectionObserverEntry] =
    useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    if (!ref.current || !isFunction(IntersectionObserver)) {
      return;
    }

    const handler = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry) {
        setIntersectionObserverEntry(entry);
      }
    };

    const opts: IntersectionObserverInit = {
      root: options?.root ?? null,
      rootMargin: options?.rootMargin ?? "0px",
      threshold: options?.threshold ?? 1,
    };

    const observer = new IntersectionObserver(handler, opts);
    observer.observe(ref.current);

    return () => {
      setIntersectionObserverEntry(null);
      observer.disconnect();
    };
  }, [ref, options?.root, options?.rootMargin, options?.threshold]);

  return intersectionObserverEntry;
};
