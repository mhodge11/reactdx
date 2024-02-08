import type {
  numericalProperties,
  transformProperties,
} from "../logic/animation.ts";
import type { Spring, SpringSystem } from "../logic/springs.ts";

/**
 * Type alias for a cookie read converter.
 */
export type CookieReadConverter<T> = (
  value: string,
  name: string
) => string | T;

/**
 * Type alias for a cookie write converter.
 */
export type CookieWriteConverter<T> = (
  value: string | T,
  name: string
) => string;

/**
 * Type alias for a cookie converter.
 */
export interface CookieConverter<TConv> {
  /**
   * Serializer function to convert a cookie being written.
   */
  write?: CookieWriteConverter<TConv>;
  /**
   * Deserializer function to convert a cookie being read.
   */
  read?: CookieReadConverter<TConv>;
}

/**
 * Type alias for the cookie attributes.
 */
export interface CookieAttributes {
  /**
   * Define when the cookie will be removed. Value can be a Number
   * which will be interpreted as days from time of creation or a
   * Date instance. If omitted, the cookie becomes a session cookie.
   */
  expires?: number | Date | undefined;
  /**
   * Define the path where the cookie is available (Defaults to '/').
   */
  path?: string | undefined;
  /**
   * Define the domain where the cookie is available. Defaults to
   * the domain of the page where the cookie was created.
   */
  domain?: string | undefined;
  /**
   * A Boolean indicating if the cookie transmission requires a
   * secure protocol (https). Defaults to false.
   */
  secure?: boolean | undefined;
  /**
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery
   * attacks (CSRF).
   *
   * One of the following:
   * - `"strict"`
   * - `"Strict"`
   * - `"lax"`
   * - `"Lax"`
   * - `"none"`
   * - `"None"`
   * - `undefined`
   */
  sameSite?: "strict" | "Strict" | "lax" | "Lax" | "none" | "None" | undefined;
  /**
   * An attribute which will be serialized, conformably to RFC 6265
   * section 5.2.
   */
  [property: string]: any;
}

/**
 * Type alias for the Cookies class.
 */
export interface CookiesStatic<T = string> {
  /**
   * Attributes used when setting cookies.
   */
  readonly attributes: CookieAttributes;
  /**
   * Read and write converter for cookies.
   */
  readonly converter: Required<CookieConverter<T>>;
  /**
   * Create cookie.
   *
   * @param name The name of the cookie.
   * @param value The value of the cookie.
   * @param options (Optional) The options for the cookie.
   * @param options.expires (Optional) Define when the cookie will be removed. Value can be a Number which will be interpreted as days from time of creation or a Date instance. If omitted, the cookie becomes a session cookie.
   * @param options.path (Optional) Define the path where the cookie is available (Defaults to '/').
   * @param options.domain (Optional) Define the domain where the cookie is available. Defaults to the domain of the page where the cookie was created.
   * @param options.secure (Optional) A Boolean indicating if the cookie transmission requires a secure protocol (https). Defaults to false.
   * @param options.sameSite (Optional) Asserts that a cookie must not be sent with cross-origin requests, providing some protection against cross-site request forgery attacks (CSRF). One of: `"strict"` | `"Strict"` | `"lax"` | `"Lax"` | `"none"` | `"None"` | `undefined`.
   * @param options[property] (Optional) An attribute which will be serialized, conformably to RFC 6265 section 5.2.
   * @returns The cookie string.
   */
  set(
    name: string,
    value: string | T,
    options?: CookieAttributes
  ): string | undefined;
  /**
   * Read cookie.
   *
   * @param name The name of the cookie.
   * @returns The value of the cookie, or `undefined` if the cookie does not exist.
   */
  get(name: string): string | T | undefined;
  /**
   * Read all available cookies.
   *
   * @returns An object containing all available cookies.
   */
  get(): { [key: string]: string | T };
  /**
   * Delete cookie.
   *
   * @param name The name of the cookie.
   * @param options (Optional) The options for the cookie.
   * @param options.expires (Optional) Define when the cookie will be removed. Value can be a Number which will be interpreted as days from time of creation or a Date instance. If omitted, the cookie becomes a session cookie.
   * @param options.path (Optional) Define the path where the cookie is available (Defaults to '/').
   * @param options.domain (Optional) Define the domain where the cookie is available. Defaults to the domain of the page where the cookie was created.
   * @param options.secure (Optional) A Boolean indicating if the cookie transmission requires a secure protocol (https). Defaults to false.
   * @param options.sameSite (Optional) Asserts that a cookie must not be sent with cross-origin requests, providing some protection against cross-site request forgery attacks (CSRF). One of: `"strict"` | `"Strict"` | `"lax"` | `"Lax"` | `"none"` | `"None"` | `undefined`.
   * @param options[property] (Optional) An attribute which will be serialized, conformably to RFC 6265 section 5.2.
   */
  remove(name: string, options?: CookieAttributes): void;
  /**
   * Create a new instance of the api that overrides the default
   * attributes. Cookie attribute defaults can be set globally by
   * creating an instance of the api via withAttributes(), or
   * individually for each call to Cookies.set(...) by passing a
   * plain object as the last argument. Per-call attributes override
   * the default attributes.
   *
   * @param attributes The attributes to set.
   * @param attributes.expires (Optional) Define when the cookie will be removed. Value can be a Number which will be interpreted as days from time of creation or a Date instance. If omitted, the cookie becomes a session cookie.
   * @param attributes.path (Optional) Define the path where the cookie is available (Defaults to '/').
   * @param attributes.domain (Optional) Define the domain where the cookie is available. Defaults to the domain of the page where the cookie was created.
   * @param attributes.secure (Optional) A Boolean indicating if the cookie transmission requires a secure protocol (https). Defaults to false.
   * @param attributes.sameSite (Optional) Asserts that a cookie must not be sent with cross-origin requests, providing some protection against cross-site request forgery attacks (CSRF). One of: `"strict"` | `"Strict"` | `"lax"` | `"Lax"` | `"none"` | `"None"` | `undefined`.
   * @param attributes[property] (Optional) An attribute which will be serialized, conformably to RFC 6265 section 5.2.
   * @returns A new instance of the api with the given attributes.
   */
  withAttributes(attributes: CookieAttributes): CookiesStatic<T>;
  /**
   * Create a new instance of the api that overrides the default
   * decoding implementation. All methods that rely in a proper
   * decoding to work, such as Cookies.remove() and Cookies.get(),
   * will run the converter first for each cookie. The returned
   * string will be used as the cookie value.
   *
   * @param converter The converter to use.
   * @param converter.write The serializer function to convert a cookie being written.
   * @param converter.read The deserializer function to convert a cookie being read.
   * @returns A new instance of the api with the given converter.
   */
  withConverter<TConv = string>(
    converter: Required<CookieConverter<TConv>>
  ): CookiesStatic<TConv>;
}

export type HookStateInitialSetter<TState> = () => TState;

export type HookStateInitAction<TState> =
  | TState
  | HookStateInitialSetter<TState>;

export type HookStateSetter<TState> =
  | ((prevState: TState) => TState)
  | (() => TState);

export type HookStateSetAction<TState> = TState | HookStateSetter<TState>;

export type HookStateResolvable<TState> =
  | TState
  | HookStateInitialSetter<TState>
  | HookStateSetter<TState>;

/**
 * Type alias for the `{@link TimerReference} bucket.
 */
export interface HarmonicIntervalBucket {
  /**
   * The delay for the interval, in milliseconds.
   */
  ms: number;
  /**
   * The interval reference ID.
   */
  interval: ReturnType<typeof setInterval>;
  /**
   * The listeners for the interval.
   */
  listeners: Record<number, () => void>;
}

/**
 * Type alias for the interval reference.
 */
export interface HarmonicIntervalReference {
  /**
   * The `{@link Bucket}` for the interval reference.
   */
  bucket: HarmonicIntervalBucket;
  /**
   * The ID of the interval reference
   * (refers to the `{@link Bucket}.ms` property).
   */
  id: number;
}

/**
 * Type alias for the buckets object with the
 * `{@link Bucket}.ms` property as the key.
 */
export interface HarmonicIntervalBuckets {
  [ms: number]: HarmonicIntervalBucket;
}

export interface HarmonicIntervalData {
  /**
   * The buckets object with the `{@link Bucket}.ms`
   * property as the key.
   */
  buckets: HarmonicIntervalBuckets;
  /**
   * The counter for the interval reference IDs.
   */
  counter: number;
}

/**
 * Type alias of the easing functions for animations.
 *
 * @param time The time to get the easing value for
 * @returns The easing value
 */
export type EasingFn = (time: number) => number;

/**
 * Type alias for the map of easing functions.
 */
export interface Easing {
  /**
   * No easing, no acceleration.
   */
  linear: EasingFn;
  /**
   * Accelerates fast, then slows quickly towards end.
   */
  quadratic: EasingFn;
  /**
   * Overshoots 1 and then returns to 1 towards end.
   */
  cubic: EasingFn;
  /**
   * Overshoots 1 multiple times - wiggles around 1.
   */
  elastic: EasingFn;
  /**
   * Accelerating quadratically from zero velocity.
   */
  inQuad: EasingFn;
  /**
   * Decelerating quadratically to zero velocity.
   */
  outQuad: EasingFn;
  /**
   * Quadratic acceleration until halfway, then quadratic deceleration.
   */
  inOutQuad: EasingFn;
  /**
   * Accelerating cubicly from zero velocity.
   */
  inCubic: EasingFn;
  /**
   * Decelerating cubicly to zero velocity.
   */
  outCubic: EasingFn;
  /**
   * Cubic acceleration until halfway, then cubic deceleration.
   */
  inOutCubic: EasingFn;
  /**
   * Accelerating quarticly from zero velocity.
   */
  inQuart: EasingFn;
  /**
   * Decelerating quarticly to zero velocity.
   */
  outQuart: EasingFn;
  /**
   * Quartic acceleration until halfway, then quartic deceleration.
   */
  inOutQuart: EasingFn;
  /**
   * Accelerating quinticly from zero velocity.
   */
  inQuint: EasingFn;
  /**
   * Decelerating quinticly to zero velocity.
   */
  outQuint: EasingFn;
  /**
   * Quintic acceleration until halfway, then quintic deceleration.
   */
  inOutQuint: EasingFn;
  /**
   * Accelerating sinusoidally from zero velocity.
   */
  inSine: EasingFn;
  /**
   * Decelerating sinusoidally to zero velocity.
   */
  outSine: EasingFn;
  /**
   * Sinusoidal acceleration until halfway, then sinusoidal deceleration.
   */
  inOutSine: EasingFn;
  /**
   * Accelerating exponentially from zero velocity.
   */
  inExpo: EasingFn;
  /**
   * Decelerating exponentially to zero velocity.
   */
  outExpo: EasingFn;
  /**
   * Exponential acceleration until halfway, then exponential deceleration.
   */
  inOutExpo: EasingFn;
  /**
   * Accelerating circularly from zero velocity.
   */
  inCirc: EasingFn;
  /**
   * Decelerating circularly to zero velocity.
   *
   * Moves **VERY** fast at the beginning and then quickly slows down in the middle.
   * This tween can actually be used in continuous transitions where
   * target value changes all the time, because of the very quick start,
   * it hides the jitter between target value changes.
   */
  outCirc: EasingFn;
  /**
   * Circular acceleration until halfway, then circular deceleration.
   */
  inOutCirc: EasingFn;
}

/**
 * Type alias for the RGB color format.
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Type alias for a general Looper class.
 */
export interface Looper {
  /**
   * The springSystem property of the Looper class.
   */
  springSystem: SpringSystem | null | undefined;
  /**
   * The function to play each frame of the spring system.
   */
  run: () => unknown;
}

/**
 * Type alias for a SpringSystemListener used in the SpringSystem class.
 */
export interface SpringSystemListener {
  /**
   * Callback right before spring system is integrated.
   */
  onBeforeIntegrate?: ((springSystem: SpringSystem) => void) | undefined;
  /**
   * Callback right after spring system is integrated.
   */
  onAfterIntegrate?: ((springSystem: SpringSystem) => void) | undefined;
}

/**
 * Type alias for a SpringListener used in the Spring class.
 */
export interface SpringListener {
  /**
   * Callback when the spring state finishes changing.
   */
  onSpringEndStateChange?: ((spring: Spring) => void) | undefined;
  /**
   * Callback when the spring activates.
   */
  onSpringActivate?: ((spring: Spring) => void) | undefined;
  /**
   * Callback after the spring is updated.
   */
  onSpringUpdate?: ((spring: Spring) => void) | undefined;
  /**
   * Callback when the spring comes to rest.
   */
  onSpringAtRest?: ((spring: Spring) => void) | undefined;
}

/**
 * Type alias of a wrapper for mapping a tuple of numbers
 * to springs.
 */
type MappedSprings<Numbers extends number[], SpringType> = {
  [K in keyof Numbers]: SpringType;
};

/**
 * Type alias for mapping a tuple of numbers to springs.
 */
export type SpringsForNumbers<Numbers extends number[]> = MappedSprings<
  Numbers,
  Spring | undefined
>;

/**
 * Type alias for a key event.
 */
export type KeyEvent<OriginalEvent, KeyEventProps> = KeyEventProps & {
  /**
   * The key that was pressed.
   */
  key: string;
  /**
   * An array of aliases for the key.
   */
  aliases?: string[];
  /**
   * The original event that was fired.
   */
  originalEvent?: OriginalEvent;
};

/**
 * Type alias for an event handler function.
 */
export type HandlerFn<Event> = (event: Event) => void;

/**
 * Type alias for an event handler object.
 */
export type HandlerObj<Event> = {
  /**
   * The on pressed event handler.
   */
  onPressed?: HandlerFn<Event>;
  /**
   * The on pressed with repeat event handler.
   */
  onPressedWithRepeat?: HandlerFn<Event>;
  /**
   * The on released event handler.
   */
  onReleased?: HandlerFn<Event>;
};

/**
 * Type alias for an event handler. Can be either a function
 * or an object with event handler functions.
 */
export type Handler<Event> = HandlerFn<Event> | HandlerObj<Event>;

// These types are not used by the library internally, but are here to
// make it easier for users to work with the browser bindings in typescript
// projects.

/**
 * Type alias for the properties that are available on a
 * browser key event.
 */
export interface BrowserKeyEventProps {
  /**
   * Returns the invocation target objects of event's
   * path (objects on which listeners will be invoked),
   * except for any nodes in shadow trees of which the
   * shadow root's mode is "closed" that are not reachable
   * from event's currentTarget.
   */
  composedPath: () => EventTarget[];
  /**
   * If invoked when the cancelable attribute value is true,
   * and while executing a listener for the event with passive
   * set to false, signals to the operation that caused event
   * to be dispatched that it needs to be canceled.
   */
  preventDefault: () => void;
}

/**
 * Type alias for the Key Combo press event.
 */
export type KeyComboEvent<OriginalEvent, KeyEventProps, KeyComboEventProps> =
  KeyComboEventProps & {
    /**
     * The key combo that triggered the combo event.
     */
    keyCombo: string;
    /**
     * The key events that triggered the combo event.
     */
    keyEvents: KeyEvent<OriginalEvent, KeyEventProps>[];
    /**
     * The final key event that triggered the combo event.
     */
    finalKeyEvent: KeyEvent<OriginalEvent, KeyEventProps>;
  };

/**
 * Type alias for the `onActive` and `onInactive` handlers.
 */
export type OnActiveEventBinder = (handler: () => void) => (() => void) | void;

/**
 * Type alias for the `onKeyPressed` and `onKeyReleased` handlers.
 */
export type OnKeyEventBinder<OriginalEvent, KeyEventProps> = (
  handler: (event: KeyEvent<OriginalEvent, KeyEventProps>) => void
) => (() => void) | void;

/**
 * Type alias for the key combo event mapper function.
 *
 * This function is called when a key combo is activated,
 * and is used to map the active key presses to a key
 * combo event.
 */
export type KeyComboEventMapper<
  OriginalEvent,
  KeyEventProps,
  KeyComboEventProps,
> = (
  activeKeyPresses: KeyPress<OriginalEvent, KeyEventProps>[][],
  finalKeyPress: KeyPress<OriginalEvent, KeyEventProps>
) => KeyComboEvent<OriginalEvent, KeyEventProps, KeyComboEventProps>;

/**
 * Type alias for the key press event.
 */
export interface KeyPress<OriginalEvent, KeyEventProps> {
  /**
   * The key that was pressed.
   */
  key: string;
  /**
   * Any aliases for the key that was pressed.
   */
  aliases: Set<string>;
  /**
   * The original event that triggered the key press.
   */
  event: KeyEvent<OriginalEvent, KeyEventProps>;
}

/**
 * Type alias for the options that can be passed to the `Keystrokes` class.
 */
export type KeystrokesOptions<
  OriginalEvent = KeyboardEvent,
  KeyEventProps = MaybeBrowserKeyEventProps<OriginalEvent>,
  KeyComboEventProps = MaybeBrowserKeyComboEventProps<OriginalEvent>,
> = BindEnvironmentOptions<OriginalEvent, KeyEventProps, KeyComboEventProps>;

/**
 * Type alias for the options that can be passed to the
 * `Keystrokes.bindEnvironment` method.
 */
export type BindEnvironmentOptions<
  OriginalEvent = KeyboardEvent,
  KeyEventProps = MaybeBrowserKeyEventProps<OriginalEvent>,
  KeyComboEventProps = MaybeBrowserKeyComboEventProps<OriginalEvent>,
> = {
  /**
   * The handler to call when the keystrokes instance becomes active.
   */
  onActive?: OnActiveEventBinder;
  /**
   * The handler to call when the keystrokes instance becomes inactive.
   */
  onInactive?: OnActiveEventBinder;
  /**
   * The handler to call when a key is pressed.
   */
  onKeyPressed?: OnKeyEventBinder<OriginalEvent, KeyEventProps>;
  /**
   * The handler to call when a key is released.
   */
  onKeyReleased?: OnKeyEventBinder<OriginalEvent, KeyEventProps>;
  /**
   * The function to map the active key presses to a key combo event.
   */
  mapKeyComboEvent?: KeyComboEventMapper<
    OriginalEvent,
    KeyEventProps,
    KeyComboEventProps
  >;
  /**
   * Key names added to selfReleasingKeys will be marked as
   * released after any other key is released. Provided
   * to deal with buggy platforms.
   */
  selfReleasingKeys?: string[];
  /**
   * An object of key value pairs with the key being
   * the key to rename, and the value being the new name.
   */
  keyRemap?: Record<string, string>;
};

/**
 * Type alias for a browser key event.
 */
export type BrowserKeyEvent = KeyEvent<KeyboardEvent, BrowserKeyEventProps>;

/**
 * Type alias for a browser key combo event.
 */
export type BrowserKeyComboEvent = KeyComboEvent<
  KeyboardEvent,
  BrowserKeyEventProps,
  {}
>;

/**
 * Type alias for the properties that are available on a
 * browser key combo event.
 */
export type BrowserKeyComboEventProps = {};

/**
 * Type alias for the properties that are available on a
 * browser key event, or an empty object if the event is not
 * a browser key event.
 */
export type MaybeBrowserKeyEventProps<OriginalEvent> =
  OriginalEvent extends KeyboardEvent ? BrowserKeyEventProps : {};

/**
 * Type alias for the properties that are available on a
 * browser key combo event, or an empty object if the event is
 * not a browser key combo event.
 */
export type MaybeBrowserKeyComboEventProps<OriginalEvent> =
  OriginalEvent extends KeyboardEvent ? BrowserKeyComboEventProps : {};

/**
 * Type alias for the raw properties (prefixed if needed)
 * used internally.
 */
export type ScreenfullRawEventNames = {
  /**
   * The name of the method to request fullscreen.
   */
  readonly requestFullscreen: string;
  /**
   * The name of the method to exit fullscreen.
   */
  readonly exitFullscreen: string;
  /**
   * The name of the property to get the element that
   * is in fullscreen.
   */
  readonly fullscreenElement: string;
  /**
   * The name of the property to check if fullscreen is
   * enabled.
   */
  readonly fullscreenEnabled: string;
  /**
   * The name of the event that is fired when fullscreen
   * is entered or exited.
   */
  readonly fullscreenchange: string;
  /**
   * The name of the event that is fired when an error
   * occurs while trying to enable fullscreen.
   */
  readonly fullscreenerror: string;
};

/**
 * Type alias for the event names used by the `screenfull` API.
 */
export type ScreenfullEventName = "change" | "error";

/**
 * Simple wrapper for cross-browser usage of the JavaScript
 * [Fullscreen API](https://developer.mozilla.org/en/DOM/Using_full-screen_mode), which lets you bring the page or any element into fullscreen. Smoothens out the browser implementation differences, so you don't have to.
 */
export type Screenfull =
  | {
      /**
       * Whether you are allowed to enter fullscreen.
       * If your page is inside an `<iframe>` you will need to add
       * an `allowfullscreen` attribute
       * (+ `webkitallowfullscreen` and `mozallowfullscreen`).
       *
       * @example
       * ```ts
       * import { screenfull } from 'hook-utils';
       *
       * if (screenfull.isEnabled) {
       * 	 screenfull.request();
       * }
       * ```
       */
      isEnabled: false;
    }
  | {
      /**
       * Whether fullscreen is active.
       */
      readonly isFullscreen: boolean;

      /**
       * The element currently in fullscreen, otherwise `undefined`.
       */
      readonly element: Element | undefined;

      /**
       * Whether you are allowed to enter fullscreen.
       * If your page is inside an `<iframe>` you will need to add
       * an `allowfullscreen` attribute
       * (+ `webkitallowfullscreen` and `mozallowfullscreen`).
       *
       * @example
       * ```ts
       * import { screenfull } from 'hook-utils';
       *
       * if (screenfull.isEnabled) {
       * 	 screenfull.request();
       * }
       * ```
       */
      readonly isEnabled: boolean;

      /**
       * Exposes the raw properties (prefixed if needed) used internally.
       */
      raw: ScreenfullRawEventNames;

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
      request(element?: Element, options?: FullscreenOptions): Promise<void>;

      /**
       * Brings you out of fullscreen.
       *
       * @returns A promise that resolves after the element exits fullscreen.
       */
      exit(): Promise<void>;

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
      toggle(element?: Element, options?: FullscreenOptions): Promise<void>;

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
      on(name: ScreenfullEventName, handler: (event: Event) => void): void;

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
      off(name: ScreenfullEventName, handler: (event: Event) => void): void;

      /**
       * Alias for `.on('change', function)`.
       *
       * @param handler The event handler
       */
      onchange(handler: (event: Event) => void): void;

      /**
       * Alias for `.on('error', function)`.
       *
       * @param handler The event handler
       */
      onerror(handler: (event: Event) => void): void;
    };

/**
 * Type alias for the scrollbar width function.
 */
export interface ScrollbarWidth {
  /**
   * Returns the width of the scrollbar in pixels.
   *
   * @param force (Optional) Whether to force the recalculation of the scrollbar width (Defaults to `false`).
   * @returns The width of the scrollbar in pixels, or `undefined` if the DOM is not ready yet.
   */
  (force?: boolean): number | undefined;
  /**
   * The cached scrollbar width.
   */
  cache?: number;
}

/**
 * Type alias for the animatable numerical properties.
 */
export type AnimatableNumericalProperties = {
  [key in keyof typeof numericalProperties]: Parameters<
    (typeof numericalProperties)[key]
  >[0];
};

/**
 * Type alias for the animatable transform properties.
 */
export type AnimatableTransformProperties = {
  [key in keyof typeof transformProperties]: number;
};

/**
 * Type alias for the animatable properties.
 */
export type AnimatableProps = AnimatableTransformProperties &
  AnimatableNumericalProperties;
