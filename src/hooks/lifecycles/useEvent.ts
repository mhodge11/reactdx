import { useEffect } from "react";

import type {
  AddEventListener,
  UseEventListener,
  UseEventOnOff,
  UseEventOptions,
  UseEventTarget,
} from "../../types/lifecycles.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { isObject } from "../../utils/isObject.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";

/**
 * The default target to use with `useEvent`.
 */
const defaultTarget = hasWindow() ? window : null;

/**
 * Checks if the target is a `Listener`.
 *
 * @param target The target to check
 * @returns `true` if the target is a `Listener`, `false` otherwise
 */
const isListener = (
  target: Window | UseEventTarget
): target is UseEventListener => "addEventListener" in target;

/**
 * Checks if the target is an `OnOff`.
 *
 * @param target The target to check
 * @returns `true` if the target is an `OnOff`, `false` otherwise
 */
const isOnOff = (target: unknown): target is UseEventOnOff =>
  isObject(target) && "on" in target;

/**
 * React sensor hook that subscribes a handler to events.
 *
 * This is a wrapper around `addEventListener` and `on` that
 * automatically subscribes the handler on mount and
 * unsubscribes the handler on unmount.
 *
 * @example
 * ```tsx
 * const [list, { push, clear }] = useList();
 *
 * const onKeyDown = useCallback(({ key }) => {
 *   if (key === 'r') clear();
 *   push(key);
 * }, []);
 *
 * useEvent('keydown', onKeyDown);
 * ```
 *
 * @param name The name of the event to listen to
 * @param handler (Optional) The handler to run when the event is triggered
 * @param target (Optional) The target to listen to the event on
 * @param options (Optional) The options to pass to `addEventListener` or `on`
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useEvent = <TEventTarget extends UseEventTarget>(
  name: Parameters<AddEventListener<TEventTarget>>[0],
  handler?: Parameters<AddEventListener<TEventTarget>>[1] | null,
  target: TEventTarget | Window | null = defaultTarget,
  options?: UseEventOptions<TEventTarget>
): void => {
  useEffect(() => {
    if (!handler || !target) {
      return;
    }

    if (isListener(target)) {
      on(target, name, handler, options);
    } else if (isOnOff(target)) {
      target.on(name, handler, options);
    }

    return () => {
      if (isListener(target)) {
        off(target, name, handler, options);
      } else if (isOnOff(target)) {
        target.off(name, handler, options);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, handler, target, JSON.stringify(options)]);
};
