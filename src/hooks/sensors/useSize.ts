import { Children, cloneElement, createElement, useRef, useState } from "react";

import type {
  UseSizeElement,
  UseSizeReturn,
  UseSizeState,
} from "../../types/sensors.ts";
import { hasWindow } from "../../utils/hasWindow.ts";
import { isFunction } from "../../utils/isFunction.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useEffectOnce } from "../lifecycles/useEffectOnce.ts";

const defaultOptions: UseSizeState = { width: Infinity, height: Infinity };

/**
 * Delays the execution of a callback until the next animation frame.
 *
 * @param callback The callback to be executed
 * @returns A timeout ID
 */
const DRAF = (callback: () => void) => setTimeout(callback, 125);

/**
 * React sensor hook that tracks size of an HTML element.
 *
 * @example
 * ```tsx
 * const [sized, { width, height }] = useSize(
 *   ({ width }) => (
 *     <div style={{ background: "red" }}>
 *       Size me up! ({width}px)
 *     </div>
 *   ),
 *   { width: 100, height: 100 }
 * );
 *
 * return (
 *   <div>
 *     {sized}
 *     <div>width: {width}</div>
 *     <div>height: {height}</div>
 *   </div>
 * );
 * ```
 *
 * @param element The element to track the size of
 * @param initialState (Optional) The initial state of the size sensor
 * @param initialState.width (Optional) The initial value of the `width` property (Defaults to `Infinity`)
 * @param initialState.height (Optional) The initial value of the `height` property (Defaults to `Infinity`)
 * @returns A tuple containing the element and the state of the size sensor
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useSize = hasWindow()
  ? (
      element: UseSizeElement,
      options: Partial<UseSizeState> = defaultOptions
    ): UseSizeReturn => {
      const { width = Infinity, height = Infinity } = options;
      const [state, setState] = useState<UseSizeState>({ width, height });

      const ref = useRef<HTMLIFrameElement | null>(null);

      useEffectOnce(() => {
        const iframe: HTMLIFrameElement | null = ref.current;

        if (!iframe) {
          return;
        }

        let window: Window | null = null;

        const setSize = () => {
          const _iframe = ref.current;
          const size = _iframe
            ? { width: _iframe.offsetWidth, height: _iframe.offsetHeight }
            : { width, height };

          setState(size);
        };

        const onWindow = (windowToListenTo: Window) => {
          on(windowToListenTo, "resize", setSize);
          DRAF(setSize);
        };

        if (iframe.contentWindow) {
          window = iframe.contentWindow;
          onWindow(window);
        } else {
          const onLoad = () => {
            on(iframe, "load", onLoad);
            window = iframe.contentWindow;
            if (window) {
              onWindow(window);
            }
          };

          on(iframe, "load", onLoad);
        }

        return () => {
          if (window?.removeEventListener) {
            off(window, "resize", setSize);
          }
        };
      });

      if (isFunction(element)) {
        element = element(state);
      }

      const style = element.props.style ?? {};
      style.position = "relative";

      const sized = cloneElement(
        element,
        { style },
        ...[
          createElement("iframe", {
            ref,
            style: {
              background: "transparent",
              border: "none",
              height: "100%",
              left: 0,
              position: "absolute",
              top: 0,
              width: "100%",
              zIndex: -1,
            },
          }),
          ...Children.toArray(element.props.children),
        ]
      );

      return [sized, state];
    }
  : (
      element: UseSizeElement,
      options: Partial<UseSizeState> = defaultOptions
    ) => {
      warn("`useSize` is not supported on server side", { element, options });
      return [element, defaultOptions];
    };
