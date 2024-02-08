import { useCallback, useEffect, useRef } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type { UseBodyLockInfoItem } from "../../types/effects.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import { isIOSDevice } from "../../utils/isIOSDevice.ts";
import { isWeb } from "../../utils/isWeb.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

/**
 * Gets the body element for the given element.
 *
 * @param el The element to lock the body scroll for
 * @returns The closest body element to `el`
 */
export const getClosestBody = (
  el: Element | HTMLElement | HTMLIFrameElement | null
): HTMLElement | null => {
  if (!el) {
    return null;
  } else if (el.tagName === "BODY") {
    return el as HTMLElement;
  } else if (el.tagName === "IFRAME") {
    const contentDocument = (el as HTMLIFrameElement).contentDocument;
    return contentDocument ? contentDocument.body : null;
  } else if (!(el as HTMLElement).offsetParent) {
    return null;
  }

  return getClosestBody((el as HTMLElement).offsetParent);
};

/**
 * Prevents the default behavior of the given event.
 *
 * @param rawEvent The raw touch event to process
 * @returns `true` if the event default was prevented, `false` otherwise
 */
const preventDefault = (rawEvent: TouchEvent): boolean => {
  const e = rawEvent ?? (window.event as TouchEvent);

  // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom).
  if (e?.touches?.length > 1) {
    return true;
  }

  if (e?.preventDefault) {
    e.preventDefault();
  }

  return false;
};

/**
 * A map that keeps track of the bodies being controlled.
 */
const bodies: Map<HTMLElement, UseBodyLockInfoItem> = new Map();
/**
 * Whether the document listener has been added.
 */
let documentListenerAdded: boolean = false;

/**
 * React side-effect hook that locks scrolling on the body element.
 * Useful for modal and other overlay components.
 *
 * Accepts ref object pointing to any HTML element as second parameter.
 * Parent body element will be found and it's scroll will be locked/unlocked.
 * It is needed to proper iFrame handling. By default it uses body element
 * of script's parent window.
 *
 * ***Note:** To improve performance you can pass body's or iframe's ref object,
 * thus no parent lookup will be performed*
 *
 * @example
 * ```tsx
 * const [locked, toggleLocked] = useBoolean(false)
 *
 * useLockBodyScroll(locked);
 *
 * return (
 *   <div>
 *     <button onClick={toggleLocked}>
 *       {locked ? 'Unlock' : 'Lock'}
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @param locked Whether to lock the body scroll
 * @param elementRef (Optional) The ref object pointing to the element to lock the body scroll for
 *
 * @category Effect
 * @since 0.0.1
 */
export const useLockBodyScroll = isWeb()
  ? (
      locked: HookStateInitAction<boolean> = true,
      elementRef?: React.RefObject<HTMLElement>
    ): void => {
      const lockedState = resolveHookState(locked);

      const _body = useRef(document.body);
      elementRef = elementRef ?? _body;

      const unlock = useCallback((body: HTMLElement) => {
        const bodyInfo = bodies.get(body);

        if (bodyInfo) {
          if (bodyInfo.counter === 1) {
            bodies.delete(body);

            if (isIOSDevice) {
              body.ontouchmove = null;

              if (documentListenerAdded) {
                off(document, "touchmove", preventDefault);
                documentListenerAdded = false;
              }
            } else {
              body.style.overflow = bodyInfo.initialOverflow;
            }
          } else {
            bodies.set(body, {
              counter: bodyInfo.counter - 1,
              initialOverflow: bodyInfo.initialOverflow,
            });
          }
        }
      }, []);

      useEffect(() => {
        const lock = (body: HTMLElement) => {
          const bodyInfo = bodies.get(body);

          if (bodyInfo) {
            bodies.set(body, {
              counter: bodyInfo.counter + 1,
              initialOverflow: bodyInfo.initialOverflow,
            });
          } else {
            bodies.set(body, {
              counter: 1,
              initialOverflow: body.style.overflow,
            });

            if (isIOSDevice) {
              if (!documentListenerAdded) {
                on(document, "touchmove", preventDefault, { passive: false });
                documentListenerAdded = true;
              }
            } else {
              body.style.overflow = "hidden";
            }
          }
        };

        const body = getClosestBody(elementRef?.current ?? null);

        if (body) {
          if (lockedState) {
            lock(body);
          } else {
            unlock(body);
          }
        }
      }, [lockedState, elementRef, unlock]);

      // clean up on unmount
      useEffectOnce(() => {
        const body = getClosestBody(elementRef?.current ?? null);

        return () => {
          if (body) {
            unlock(body);
          }
        };
      });
    }
  : (
      locked: HookStateInitAction<boolean> = true,
      elementRef?: React.RefObject<HTMLElement>
    ): void => {
      const lockedState = resolveHookState(locked);

      warn(
        "The `useLockBodyScroll` should be used in a browser environment. The body scroll will not be locked.",
        { locked: lockedState, elementRef }
      );
    };
