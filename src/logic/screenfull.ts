import type { Screenfull, ScreenfullEventName } from "../types/logic.ts";

/**
 * The different methods and events used by the `screenfull` API.
 */
const methodMap = [
  // New standard API
  [
    "requestFullscreen",
    "exitFullscreen",
    "fullscreenElement",
    "fullscreenEnabled",
    "fullscreenchange",
    "fullscreenerror",
  ],
  // New WebKit
  [
    "webkitRequestFullscreen",
    "webkitExitFullscreen",
    "webkitFullscreenElement",
    "webkitFullscreenEnabled",
    "webkitfullscreenchange",
    "webkitfullscreenerror",
  ],
  // Old WebKit
  [
    "webkitRequestFullScreen",
    "webkitCancelFullScreen",
    "webkitCurrentFullScreenElement",
    "webkitCancelFullScreen",
    "webkitfullscreenchange",
    "webkitfullscreenerror",
  ],
  // Mozilla
  [
    "mozRequestFullScreen",
    "mozCancelFullScreen",
    "mozFullScreenElement",
    "mozFullScreenEnabled",
    "mozfullscreenchange",
    "mozfullscreenerror",
  ],
  // Microsoft
  [
    "msRequestFullscreen",
    "msExitFullscreen",
    "msFullscreenElement",
    "msFullscreenEnabled",
    "MSFullscreenChange",
    "MSFullscreenError",
  ],
] as const;

/**
 * The native API used by the `screenfull` API.
 *
 * If the API is not supported then this will be `null`.
 */
const nativeAPI = (() => {
  if (typeof document === "undefined") {
    return null;
  }

  const unprefixedMethods = methodMap[0];
  const returnValue: { [K in (typeof unprefixedMethods)[number]]: string } = {
    requestFullscreen: "",
    exitFullscreen: "",
    fullscreenElement: "",
    fullscreenEnabled: "",
    fullscreenchange: "",
    fullscreenerror: "",
  };

  for (const methodList of methodMap) {
    const exitFullscreenMethod = methodList[1];
    if (exitFullscreenMethod in document) {
      for (const [index, method] of methodList.entries()) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        returnValue[unprefixedMethods[index]!] = method;
      }

      return returnValue;
    }
  }

  return null;
})();

/**
 * The `screenfull` API object used to interact with the browser's
 * fullscreen API.
 */
let screenfullApi: Screenfull = {} as Screenfull;

if (nativeAPI) {
  /**
   * The event names used internally.
   */
  const eventNameMap = {
    change: nativeAPI?.fullscreenchange,
    error: nativeAPI?.fullscreenerror,
  };

  // @ts-expect-error: This will be finished with `Object.defineProperties`
  screenfullApi = {
    /**
     * Make an element fullscreen.
     *
     * If your page is inside an `<iframe>` you will need to add a `allowfullscreen` attribute (+ `webkitallowfullscreen` and `mozallowfullscreen`).
     *
     * Keep in mind that the browser will only enter fullscreen when initiated by user events like click, touch, key.
     *
     * @example
     * ```ts
     * import { screenfull } from 'hook-utils';
     *
     * // Fullscreen the page
     * document.getElementById('button').addEventListener('click', () => {
     *   if (screenfull.isEnabled) {
     *     screenfull.request();
     *   } else {
     *     // Ignore or do something else
     *   }
     * });
     *
     * // Fullscreen an element
     * const element = document.getElementById('target');
     *
     * document.getElementById('button').addEventListener('click', () => {
     *   if (screenfull.isEnabled) {
     *     screenfull.request(element);
     *   }
     * });
     *
     * // Fullscreen an element with options
     * const element = document.getElementById('target');
     *
     * document.getElementById('button').addEventListener('click', () => {
     *   if (screenfull.isEnabled) {
     *     screenfull.request(element, {navigationUI: 'hide'});
     *   }
     * });
     *
     * // Fullscreen an element with jQuery
     * const element = $('#target')[0]; // Get DOM element from jQuery collection
     *
     * $('#button').on('click', () => {
     *   if (screenfull.isEnabled) {
     *     screenfull.request(element);
     *   }
     * });
     * ```
     *
     * @param element (Optional) Default is `<html>`. If called with another element than the currently active, it will switch to that if it's a descendant.
     * @param options (Optional) [`FullscreenOptions`](https://developer.mozilla.org/en-US/docs/Web/API/FullscreenOptions).
     * @returns A promise that resolves after the element enters fullscreen.
     */
    request(
      element: Element = document.documentElement,
      options?: FullscreenOptions
    ) {
      return new Promise((resolve, reject) => {
        const onFullScreenEntered = () => {
          // @ts-expect-error: TS isn't aware this will exist
          screenfullApi.off("change", onFullScreenEntered);
          resolve(void 0);
        };

        // @ts-expect-error: TS isn't aware this will exist
        screenfullApi.on("change", onFullScreenEntered);

        // @ts-expect-error: TS isn't aware this will exist
        const returnPromise = element[nativeAPI.requestFullscreen](options);

        if (returnPromise instanceof Promise) {
          returnPromise.then(onFullScreenEntered).catch(reject);
        }
      });
    },
    /**
     * Brings you out of fullscreen.
     *
     * @returns A promise that resolves after the element exits fullscreen.
     */
    exit() {
      return new Promise((resolve, reject) => {
        // @ts-expect-error: TS isn't aware this will exist
        if (!screenfullApi.isFullscreen) {
          resolve(void 0);
          return;
        }

        const onFullScreenExit = () => {
          // @ts-expect-error: TS isn't aware this will exist
          screenfullApi.off("change", onFullScreenExit);
          resolve(void 0);
        };

        // @ts-expect-error: TS isn't aware this will exist
        screenfullApi.on("change", onFullScreenExit);

        // @ts-expect-error: TS isn't aware this will exist
        const returnPromise = document[nativeAPI.exitFullscreen]();

        if (returnPromise instanceof Promise) {
          returnPromise.then(onFullScreenExit).catch(reject);
        }
      });
    },
    /**
     * Requests fullscreen if not active, otherwise exits.
     *
     * @example
     * ```ts
     * import { screenfull } from 'hook-utils';
     *
     * // Toggle fullscreen on a image with jQuery
     *
     * $('img').on('click', event => {
     *   if (screenfull.isEnabled) {
     *     screenfull.toggle(event.target);
     * 	 }
     * });
     * ```
     *
     * @param element (Optional) The default is `<html>`. If called with another element than the currently active, it will switch to that if it's a descendant.
     * @param options (Optional) [`FullscreenOptions`](https://developer.mozilla.org/en-US/docs/Web/API/FullscreenOptions).
     * @returns A promise that resolves after the element enters/exits fullscreen.
     */
    toggle(element?: Element, options?: FullscreenOptions) {
      // @ts-expect-error: TS isn't aware this will exist
      return screenfullApi.isFullscreen
        ? // @ts-expect-error: TS isn't aware this will exist
          screenfullApi.exit()
        : // @ts-expect-error: TS isn't aware this will exist
          screenfullApi.request(element, options);
    },
    /**
     * Add a listener for when the browser switches in and out of fullscreen or when there is an error.
     *
     * @example
     * ```ts
     * import { screenfull } from 'hook-utils';
     *
     * // Detect fullscreen change
     * if (screenfull.isEnabled) {
     *   screenfull.on('change', () => {
     *     console.log('Am I fullscreen?', screenfull.isFullscreen ? 'Yes' : 'No');
     *   });
     * }
     *
     * // Detect fullscreen error
     * if (screenfull.isEnabled) {
     *   screenfull.on('error', event => {
     *     console.error('Failed to enable fullscreen', event);
     *   });
     * }
     * ```
     *
     * @param name The name of the event to listen for
     * @param handler The event handler
     */
    on(event: ScreenfullEventName, callback: (event: Event) => void) {
      const eventName = eventNameMap[event];
      if (eventName) {
        document.addEventListener(eventName, callback, false);
      }
    },
    /**
     * Remove a previously registered event listener.
     *
     * @example
     * ```ts
     * import { screenfull } from 'hook-utils';
     *
     * screenfull.off('change', callback);
     * ```
     *
     * @param name The name of the event to listen for
     * @param handler The event handler
     */
    off(event: ScreenfullEventName, callback: (event: Event) => void) {
      const eventName = eventNameMap[event];
      if (eventName) {
        document.removeEventListener(eventName, callback, false);
      }
    },
    /**
     * Alias for `.on('change', function)`.
     *
     * @param handler The event handler
     */
    onchange(callback: (event: Event) => void) {
      // @ts-expect-error: TS doesn't know that `on` is a method
      screenfullApi.on("change", callback);
    },
    /**
     * Alias for `.on('error', function)`.
     *
     * @param handler The event handler
     */
    onerror(callback: (event: Event) => void) {
      // @ts-expect-error: TS doesn't know that `on` is a method
      screenfullApi.on("error", callback);
    },
    /**
     * Exposes the raw properties (prefixed if needed) used internally.
     */
    raw: nativeAPI,
  };

  // Define the properties for when the API is supported
  Object.defineProperties(screenfullApi, {
    isFullscreen: {
      enumerable: true,
      // @ts-expect-error: TS doesn't know that `fullscreenElement` is a property
      get: () => Boolean(document[nativeAPI.fullscreenElement]),
    },
    element: {
      enumerable: true,
      // @ts-expect-error: TS doesn't know that `fullscreenElement` is a property
      get: () => document[nativeAPI.fullscreenElement] ?? undefined,
    },
    isEnabled: {
      enumerable: true,
      // Coerce to boolean in case of old WebKit.
      // @ts-expect-error: TS doesn't know that `fullscreenEnabled` is a property
      get: () => Boolean(document[nativeAPI.fullscreenEnabled]),
    },
  });
} else {
  // Define the properties for when the API is not supported
  Object.defineProperties(screenfullApi, {
    isEnabled: {
      enumerable: true,
      get: () => false,
    },
  });
}

/**
 * The `screenfull` API object used to interact with the browser's
 * fullscreen API.
 *
 * **Methods**
 * - `request`: Make an element fullscreen.
 * - `exit`: Brings you out of fullscreen.
 * - `toggle`: Requests fullscreen if not active, otherwise exits.
 * - `on`: Add a listener for when the browser switches in and out of fullscreen or when there is an error.
 * - `off`: Remove a previously registered event listener.
 * - `onchange`: Alias for `.on('change', function)`.
 * - `onerror`: Alias for `.on('error', function)`.
 *
 * **Properties**
 * - `isFullscreen`: Whether fullscreen is active.
 * - `element`: The element currently in fullscreen, otherwise `undefined`.
 * - `isEnabled`: Whether you are allowed to enter fullscreen. If your page is inside an `<iframe>` you will need to add a `allowfullscreen` attribute (+ `webkitallowfullscreen` and `mozallowfullscreen`).
 * - `raw`: Exposes the raw properties (prefixed if needed) used internally.
 *
 * @example
 * ```ts
 * import { screenfull } from 'hook-utils';
 *
 * if (screenfull.isEnabled) {
 *   console.log(
 *     "Is fullscreen active?",
 *     screenfull.isFullscreen
 *   );
 *   console.log("Fullscreened element:", screenfull.element);
 *
 *   screenfull.toggle();
 *   screenfull.toggle(document.getElementById('target'));
 *   screenfull.toggle(
 *     document.getElementById('target'),
 *     { navigationUI: 'hide' }
 *   );
 *
 *   screenfull.off('change', () => {});
 *   screenfull.off('error', () => {});
 *
 *   screenfull.onchange(() => {});
 *   screenfull.onerror(() => {});
 *
 *   screenfull.on('change', () => {});
 *   screenfull.on('error', () => {});
 *
 *   screenfull.request();
 *   screenfull.request(document.getElementById('target'));
 *   screenfull.request(
 *     document.getElementById('target'),
 *     { navigationUI: 'hide' }
 *   );
 *
 *   screenfull.exit();
 * }
 * ```
 */
export const screenfull: Screenfull = screenfullApi;
