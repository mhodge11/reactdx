import { useEffect, useRef } from "react";

import { hasDocument } from "../../utils/hasDocument.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";

/**
 * The default click events.
 */
const defaultEvents = ["mousedown", "touchstart"];

/**
 * React UI hook that triggers a callback when
 * the user clicks outside the target element.
 *
 * @example
 * ```tsx
 * const ref = useRef(null);
 *
 * useClickAway(ref, () => {
 *   console.log('OUTSIDE CLICKED');
 * });
 *
 * return (
 *   <div
 *     ref={ref}
 *     style={{
 *       width: 200,
 *       height: 200,
 *       background: 'red',
 *     }}
 *   />
 * );
 * ```
 *
 * @param ref The ref of the target element
 * @param onClickAway The callback to trigger when the user clicks outside the target element
 * @param events The names of the events to listen to
 *
 * @category UI
 * @since 0.0.1
 */
export const useClickAway = hasDocument()
  ? <TEvent extends Event = Event>(
      ref: React.RefObject<HTMLElement | null>,
      onClickAway: (event: TEvent) => void,
      events: string[] = defaultEvents
    ): void => {
      const _callback = useRef(onClickAway);
      _callback.current = onClickAway;

      useEffect(() => {
        const handler = (event: TEvent) => {
          if (ref?.current?.contains(event.target as Node)) {
            _callback.current(event);
          }
        };

        for (const eventName of events) {
          on(document, eventName, handler);
        }

        return () => {
          for (const eventName of events) {
            off(document, eventName, handler);
          }
        };
      }, [events, ref]);
    }
  : <TEvent extends Event = Event>(
      ref: React.RefObject<HTMLElement | null>,
      onClickAway: (event: TEvent) => void,
      events: string[] = defaultEvents
    ): void => {
      warn("`useClickAway` is not supported in this environment", {
        ref,
        onClickAway,
        events,
      });
    };
