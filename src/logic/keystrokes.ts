import type {
  BindEnvironmentOptions,
  BrowserKeyEventProps,
  Handler,
  HandlerFn,
  KeyComboEvent,
  KeyComboEventMapper,
  KeyEvent,
  KeyPress,
  KeystrokesOptions,
  MaybeBrowserKeyComboEventProps,
  MaybeBrowserKeyEventProps,
  OnActiveEventBinder,
  OnKeyEventBinder,
} from "../types/logic.ts";
import { isFunction } from "../utils/isFunction.ts";
import { isObjectType } from "../utils/isObject.ts";

// NOTE: These stubs are only used if the library is used in a non-browser
// environment with default binders.

/**
 * A stub for the document object.
 */
const documentStub = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addEventListener: (..._: any[]): any => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeEventListener: (..._: any[]): any => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchEvent: (..._: any[]): any => {},
};

/**
 * A stub for the navigator object.
 */
const navigatorStub = {
  userAgent: "",
};

/**
 * Gets the document object.
 *
 * @returns The document object if it is available, otherwise a stub.
 */
const getDoc = () =>
  typeof document !== "undefined" ? document : documentStub;

/**
 * Gets the navigator object.
 *
 * @returns The navigator object if it is available, otherwise a stub.
 */
const getNav = () =>
  typeof navigator !== "undefined" ? navigator : navigatorStub;

// ----------------

// NOTE: Because MacOS does not fire keyup events for the Command key, we need
// to track the state of the Command key ourselves so we can release it
// ourselves.

/**
 * Checks if the user agent is macOS.
 *
 * @returns Whether the user agent is macOS.
 */
const isMacOs = () => getNav().userAgent.toLowerCase().includes("mac");
/**
 * Whether the Command key is currently pressed.
 */
let isMacOsCommandKeyPressed = false;

/**
 * Handles the Command key being pressed, so we can release it ourselves
 * if necessary.
 *
 * @param event The keyboard event to handle
 */
const maybeHandleMacOsCommandKeyPressed = (event: KeyboardEvent) => {
  if (!isMacOs() || event.key !== "Meta") {
    return;
  }
  isMacOsCommandKeyPressed = true;
};

/**
 * Handles the Command key being released.
 *
 * @param event The keyboard event to handle
 */
const maybeHandleMacOsCommandKeyReleased = (event: KeyboardEvent) => {
  if (!isMacOsCommandKeyPressed || event.key !== "Meta") {
    return;
  }
  isMacOsCommandKeyPressed = false;
  dispatchKeyUpForAllActiveKeys();
};

// ----------------

/**
 * A map of active key events.
 */
const activeKeyEvents = new Map<string, KeyboardEvent>();

/**
 * Adds a keyboard event to the active key events.
 *
 * @param event The keyboard event to add to the active key events
 */
const addActiveKeyEvent = (event: KeyboardEvent) => {
  activeKeyEvents.set(event.key, event);
};

/**
 * Removes a keyboard event from the active key events.
 *
 * @param event The keyboard event to remove from the active key events
 */
const removeActiveKeyEvent = (event: KeyboardEvent) => {
  activeKeyEvents.delete(event.key);
};

/**
 * Dispatches a keyup event for all active key events.
 */
const dispatchKeyUpForAllActiveKeys = () => {
  for (const activeKeyEvent of activeKeyEvents.values()) {
    const event = new KeyboardEvent("keyup", {
      key: activeKeyEvent.key,
      code: activeKeyEvent.code,
      bubbles: true,
      cancelable: true,
    });

    getDoc().dispatchEvent(event);
  }

  activeKeyEvents.clear();
};

/**
 * Event binder for the browser on active event.
 *
 * @param handler The handler to call when the browser becomes active
 * @returns A function to remove the event listener
 */
export const browserOnActiveBinder: OnActiveEventBinder = handler => {
  try {
    const handlerWrapper = () => handler();

    addEventListener("focus", handlerWrapper);

    return () => {
      removeEventListener("focus", handlerWrapper);
    };
  } catch {
    return () => {};
  }
};

/**
 * Event binder for the browser on inactive event.
 *
 * @param handler The handler to call when the browser becomes inactive
 * @returns A function to remove the event listener
 */
export const browserOnInactiveBinder: OnActiveEventBinder = handler => {
  try {
    const handlerWrapper = () => {
      dispatchKeyUpForAllActiveKeys();
      handler();
    };

    addEventListener("blur", handlerWrapper);

    return () => {
      removeEventListener("blur", handlerWrapper);
    };
  } catch {
    return () => {};
  }
};

/**
 * Event binder for the browser on key pressed event.
 *
 * @param handler The handler to call when a key is pressed
 * @returns A function to remove the event listener
 */
export const browserOnKeyPressedBinder: OnKeyEventBinder<
  KeyboardEvent,
  BrowserKeyEventProps
> = handler => {
  try {
    const handlerWrapper = (e: KeyboardEvent) => {
      addActiveKeyEvent(e);
      maybeHandleMacOsCommandKeyPressed(e);

      handler({
        key: e.key,
        aliases: [`@${e.code}`],
        originalEvent: e,
        composedPath: () => e.composedPath(),
        preventDefault: () => e.preventDefault(),
      });
    };

    getDoc().addEventListener("keydown", handlerWrapper);

    return () => {
      getDoc().removeEventListener("keydown", handlerWrapper);
    };
  } catch {
    return () => {};
  }
};

/**
 * Event binder for the browser on key released event.
 *
 * @param handler The handler to call when a key is released
 * @returns A function to remove the event listener
 */
export const browserOnKeyReleasedBinder: OnKeyEventBinder<
  KeyboardEvent,
  BrowserKeyEventProps
> = handler => {
  try {
    const handlerWrapper = (e: KeyboardEvent) => {
      removeActiveKeyEvent(e);
      maybeHandleMacOsCommandKeyReleased(e);

      handler({
        key: e.key,
        aliases: [`@${e.code}`],
        originalEvent: e,
        composedPath: () => e.composedPath(),
        preventDefault: () => e.preventDefault(),
      });
    };

    getDoc().addEventListener("keyup", handlerWrapper);

    return () => {
      getDoc().removeEventListener("keyup", handlerWrapper);
    };
  } catch {
    return () => {};
  }
};

/**
 * Represents the state of an event handler. This is used internally
 * by the `Keystrokes` class to keep track of the state of key and key
 * combination handlers.
 *
 * **Methods**
 * - `isOwnHandler` - Checks if the handler is the identity of the current handler state
 * - `executePressed` - Executes the on pressed event handler
 * - `executeReleased` - Executes the on released event handler
 *
 * **Properties**
 * - `isEmpty` - Whether the handler is empty
 */
export class HandlerState<Event> {
  /**
   * Whether the handler is empty.
   */
  get isEmpty(): boolean {
    return !this._onPressed && !this._onPressedWithRepeat && !this._onReleased;
  }

  /**
   * The on pressed event handler.
   */
  private _onPressed?: HandlerFn<Event>;
  /**
   * The on pressed with repeat event handler.
   */
  private _onPressedWithRepeat?: HandlerFn<Event>;
  /**
   * The on released event handler.
   */
  private _onReleased?: HandlerFn<Event>;
  /**
   * The identity of the handler.
   */
  private _identity: Handler<Event>;
  /**
   * Whether the handler is currently pressed.
   */
  private _isPressed: boolean;

  /**
   * @constructor
   * @param handler The event handler to create a state for
   */
  constructor(handler: Handler<Event>) {
    this._identity = handler;
    this._isPressed = false;

    if (isFunction(handler)) {
      this._onPressedWithRepeat = handler;
      return;
    }

    if (handler.onPressed) {
      this._onPressed = handler.onPressed;
    }
    if (handler.onPressedWithRepeat) {
      this._onPressedWithRepeat = handler.onPressedWithRepeat;
    }
    if (handler.onReleased) {
      this._onReleased = handler.onReleased;
    }
  }

  /**
   * Checks if the handler is the identity of the current handler state.
   *
   * @param handler The event handler to check
   * @returns `true` if the handler is the identity of the current handler state, otherwise `false`
   */
  isOwnHandler(handler: Handler<Event>): boolean {
    return this._identity === handler;
  }

  /**
   * Executes the on pressed event handler.
   *
   * @param event The event to pass to the handler
   */
  executePressed(event: Event): void {
    if (!this._isPressed) {
      this._onPressed?.(event);
    }

    this._isPressed = true;
    this._onPressedWithRepeat?.(event);
  }

  /**
   * Executes the on released event handler.
   *
   * @param event The event to pass to the handler
   */
  executeReleased(event: Event): void {
    if (this._isPressed) {
      this._onReleased?.(event);
    }

    this._isPressed = false;
  }
}

/**
 * The state of a key combo. This is used to track the state of a key combo
 * and execute the appropriate handler when the key combo is pressed.
 *
 * **Static Methods**
 * - `parseKeyCombo` - Parses a key combo string into a nested array of keys.
 * - `stringifyKeyCombo` - Converts a parsed key combo into a string.
 * - `normalizeKeyCombo` - Normalizes a key combo string.
 *
 * **Methods**
 * - `isOwnHandler` - Checks if the handler is the same as the current handler.
 * - `executePressed` - Executes the onPressed event for the key combo.
 * - `executeReleased` - Executes the onReleased event for the key combo.
 * - `updateState` - Updates the state of the key combo.
 *
 * **Properties**
 * - `isPressed` - Whether the key combo is currently pressed.
 * - `sequenceIndex` - The index of the current sequence.
 */
export class KeyComboState<OriginalEvent, KeyEventProps, KeyComboEventProps> {
  /**
   * A cache of parsed key combos. This is used to avoid parsing
   * the same key combo multiple times.
   */
  private static _parseCache: Record<string, string[][][]> = {};
  /**
   * A cache of normalized key combos. This is used to avoid normalizing
   * the same key combo multiple times.
   */
  private static _normalizationCache: Record<string, string> = {};

  /**
   * Parses a key combo string into a nested array of keys.
   *
   * @param keyComboStr The key combo string to parse.
   * @returns The parsed key combo.
   */
  static parseKeyCombo(keyComboStr: string): string[][][] {
    if (KeyComboState._parseCache[keyComboStr]) {
      return KeyComboState._parseCache[keyComboStr] as string[][][];
    }

    const s = keyComboStr.toLowerCase();

    // operator
    let o = "";

    // key
    let key: string[] = [];

    // unit
    let unit: string[][] = [];

    // sequence
    let sequence: string[][][] = [];

    // combo
    const rawCombo: string[][][][] = [];

    let isEscaped = false;

    for (let i = 0; i < keyComboStr.length; i++) {
      // begin escape
      if (s[i] === "\\") {
        isEscaped = true;
      }
      // a non-escaped operator
      else if ((s[i] === "+" || s[i] === ">" || s[i] === ",") && !isEscaped) {
        if (o) {
          throw new Error("Cannot have two operators in a row");
        }
        o = s[i] as string;
      }
      // any charactor that is not a space
      else if (s[i]?.match(/[^\s]/)) {
        // if we had an operator in the last iteration then apply it
        if (o) {
          // start the next sequence
          if (o === ",") {
            key = [];
            unit = [key];
            sequence = [unit];
            rawCombo.push(sequence);
          }
          // start the next unit
          else if (o === ">") {
            key = [];
            unit = [key];
            sequence.push(unit);
          }
          // start the next key
          else if (o === "+") {
            key = [];
            unit.push(key);
          }

          o = "";
        }

        // clear escape
        isEscaped = false;

        // add the character to the key
        key.push(s[i] as string);
      }

      // spaces are ignored
    }

    const combo = rawCombo.map(s => s.map(u => u.map(k => k.join(""))));
    KeyComboState._parseCache[keyComboStr] = combo;
    return combo;
  }

  /**
   * Converts a parsed key combo into a string.
   *
   * @param keyCombo The parsed key combo to stringify.
   * @returns The stringified key combo.
   */
  static stringifyKeyCombo(keyCombo: string[][][]): string {
    return keyCombo
      .map(s =>
        s
          .map(u =>
            u
              .map(k => {
                if (k === "+") {
                  return "\\+";
                }
                if (k === ">") {
                  return "\\>";
                }
                if (k === ",") {
                  return "\\,";
                }
                return k;
              })
              .join("+")
          )
          .join(">")
      )
      .join(",");
  }

  /**
   * Normalizes a key combo string. This is used to ensure that the same
   * key combo string always represents the same key combo.
   *
   * @param keyComboStr The key combo string to normalize.
   * @returns The normalized key combo string.
   */
  static normalizeKeyCombo(keyComboStr: string): string {
    if (KeyComboState._normalizationCache[keyComboStr]) {
      return KeyComboState._normalizationCache[keyComboStr] as string;
    }

    const normalized = KeyComboState.stringifyKeyCombo(
      KeyComboState.parseKeyCombo(keyComboStr)
    );
    KeyComboState._normalizationCache[keyComboStr] = normalized;

    return normalized;
  }

  /**
   * Whether the key combo is currently pressed.
   */
  get isPressed(): boolean {
    return !!this._isPressedWithFinalUnit;
  }

  /**
   * The index of the current sequence.
   */
  get sequenceIndex(): number {
    if (this.isPressed) {
      return this._parsedKeyCombo.length - 1;
    }
    return this._sequenceIndex;
  }

  /**
   * The normalized key combo string.
   */
  private _normalizedKeyCombo: string;
  /**
   * The parsed key combo.
   */
  private _parsedKeyCombo: string[][][];
  /**
   * The handler state for the key combo.
   */
  private _handlerState: HandlerState<
    KeyComboEvent<OriginalEvent, KeyEventProps, KeyComboEventProps>
  >;
  /**
   * The key combo event mapper.
   */
  private _keyComboEventMapper: KeyComboEventMapper<
    OriginalEvent,
    KeyEventProps,
    KeyComboEventProps
  >;
  /**
   * The time at which the key combo will move to the next sequence.
   */
  private _movingToNextSequenceAt: number;
  /**
   * The index of the current sequence.
   */
  private _sequenceIndex: number;
  /**
   * The index of the current unit.
   */
  private _unitIndex: number;
  /**
   * The active key presses for the last active key combo.
   */
  private _lastActiveKeyPresses: KeyPress<OriginalEvent, KeyEventProps>[][];
  /**
   * The number of active keys in the last active key combo.
   */
  private _lastActiveKeyCount: number;
  /**
   * The keys that are pressed with the final unit.
   */
  private _isPressedWithFinalUnit: Set<string> | null;

  /**
   * @constructor
   * @param keyCombo The key combo string
   * @param keyComboEventMapper The key combo event mapper
   * @param handler The handler for the key combo
   */
  constructor(
    keyCombo: string,
    keyComboEventMapper: KeyComboEventMapper<
      OriginalEvent,
      KeyEventProps,
      KeyComboEventProps
    >,
    handler: Handler<
      KeyComboEvent<OriginalEvent, KeyEventProps, KeyComboEventProps>
    > = {}
  ) {
    this._normalizedKeyCombo = KeyComboState.normalizeKeyCombo(keyCombo);
    this._parsedKeyCombo = KeyComboState.parseKeyCombo(keyCombo);
    this._handlerState = new HandlerState(handler);
    this._keyComboEventMapper = keyComboEventMapper;
    this._movingToNextSequenceAt = 0;
    this._sequenceIndex = 0;
    this._unitIndex = 0;
    this._lastActiveKeyPresses = [];
    this._lastActiveKeyCount = 0;
    this._isPressedWithFinalUnit = null;
  }

  /**
   * Checks if the handler is the same as the current handler.
   *
   * @param handler The handler to check
   * @returns `true` if the handler is the same as the current handler, otherwise `false`
   */
  isOwnHandler(
    handler: Handler<
      KeyComboEvent<OriginalEvent, KeyEventProps, KeyComboEventProps>
    >
  ): boolean {
    return this._handlerState.isOwnHandler(handler);
  }

  /**
   * Executes the onPressed event for the key combo.
   *
   * @param event The key event to execute
   */
  executePressed(event: KeyEvent<OriginalEvent, KeyEventProps>): void {
    if (
      !this._isPressedWithFinalUnit?.has(event.key) &&
      !event.aliases?.some(a => this._isPressedWithFinalUnit?.has(a))
    ) {
      return;
    }

    this._handlerState.executePressed(
      this._wrapEvent(this._lastActiveKeyPresses, {
        key: event.key,
        aliases: new Set(event.aliases),
        event,
      })
    );
  }

  /**
   * Executes the onReleased event for the key combo.
   *
   * @param event The key event to execute
   */
  executeReleased(event: KeyEvent<OriginalEvent, KeyEventProps>): void {
    if (
      !this._isPressedWithFinalUnit?.has(event.key) &&
      !event.aliases?.some(a => this._isPressedWithFinalUnit?.has(a))
    ) {
      return;
    }
    this._handlerState.executeReleased(
      this._wrapEvent(this._lastActiveKeyPresses, {
        key: event.key,
        aliases: new Set(event.aliases),
        event,
      })
    );
    this._isPressedWithFinalUnit = null;
  }

  /**
   * Updates the state of the key combo.
   *
   * @param activeKeyPresses The active key presses
   * @param sequenceTimeout The sequence timeout
   */
  updateState(
    activeKeyPresses: KeyPress<OriginalEvent, KeyEventProps>[],
    sequenceTimeout: number
  ) {
    const activeKeysCount = activeKeyPresses.length;
    const hasReleasedKeys = activeKeysCount < this._lastActiveKeyCount;
    this._lastActiveKeyCount = activeKeysCount;

    const sequence = this._parsedKeyCombo[this._sequenceIndex] as string[][];
    const previousUnits = sequence.slice(0, this._unitIndex);
    const remainingUnits = sequence.slice(this._unitIndex);

    const reset = () => {
      this._movingToNextSequenceAt = 0;
      this._sequenceIndex = 0;
      this._unitIndex = 0;
      this._lastActiveKeyPresses.length = 0;

      // In the case of key combos that are used by checkKeyCombo, we need to
      // clear the final unit for it because the executeReleased will not be
      // called.
      if (this._handlerState.isEmpty) {
        this._isPressedWithFinalUnit = null;
      }
    };

    let activeKeyIndex = 0;

    // if we do not have new keys pressed, and we are not advancing to the next
    // sequence, then we reset. If we are advancing to the next sequence but
    // the timeout has passed then we reset. If no keys are pressed then we
    // advance to the next sequence.
    if (hasReleasedKeys) {
      if (this._movingToNextSequenceAt === 0) {
        return reset();
      }
      if (this._movingToNextSequenceAt + sequenceTimeout < Date.now()) {
        return;
      }
      if (activeKeysCount !== 0) {
        return;
      }
      this._movingToNextSequenceAt = 0;
      this._sequenceIndex += 1;
      this._unitIndex = 0;
      return;
    }

    // go through each each previous unit. If any are no longer pressed then
    // we reset to the beginning of the combo.
    for (const previousUnit of previousUnits) {
      for (const key of previousUnit) {
        let keyFound = false;

        for (
          let i = activeKeyIndex;
          i < activeKeyPresses.length &&
          i < activeKeyIndex + previousUnit.length;
          i += 1
        ) {
          if (
            (activeKeyPresses[i] as KeyPress<OriginalEvent, KeyEventProps>)
              .key === key ||
            (
              activeKeyPresses[i] as KeyPress<OriginalEvent, KeyEventProps>
            ).aliases.has(key)
          ) {
            keyFound = true;
            break;
          }
        }

        if (!keyFound) {
          return reset();
        }
      }

      activeKeyIndex += previousUnit.length;
    }

    // If we are already marked to move to the next sequence then we will stop
    // here. When moving to the next sequence we only need to make sure that
    // the keys in the current sequence are still pressed.
    if (this._movingToNextSequenceAt !== 0) {
      return;
    }

    // loop through the remaining units. For each unit that is pressed, advance
    // the unit counter. If all units are pressed then advance the sequence.
    for (const unit of remainingUnits) {
      for (const key of unit) {
        let keyFound = false;
        for (
          let i = activeKeyIndex;
          i < activeKeyPresses.length && i < activeKeyIndex + unit.length;
          i += 1
        ) {
          if (
            (activeKeyPresses[i] as KeyPress<OriginalEvent, KeyEventProps>)
              .key === key ||
            (
              activeKeyPresses[i] as KeyPress<OriginalEvent, KeyEventProps>
            ).aliases.has(key)
          ) {
            keyFound = true;
            break;
          }
        }

        // if the unit is incomplete do nothing, the user could still press
        // the remaining keys.
        if (!keyFound) {
          return;
        }
      }

      this._unitIndex += 1;
      activeKeyIndex += unit.length;
    }

    // Now that we have completed the sequence we need to check for overshoot.
    // If there are any keys pressed that are not in the current sequence then
    // we reset.
    if (activeKeyIndex < activeKeysCount - 1) {
      return reset();
    }

    // store the active key presses for the sequence so they can be used in
    // the event.
    this._lastActiveKeyPresses[this._sequenceIndex] = activeKeyPresses.slice();

    // Now that we know the sequence is complete we need to check to see if
    // we can advance to the next sequence. If there is no sequence to advance
    // to then we set the final unit.
    if (this._sequenceIndex < this._parsedKeyCombo.length - 1) {
      this._movingToNextSequenceAt = Date.now();
      return;
    }

    // Setting the final unit marks the combo as active. It also allows for
    // something to match key repeat against.
    this._isPressedWithFinalUnit = new Set(sequence[sequence.length - 1]);
  }

  /**
   * Wraps the active key presses and the final key press into a key combo event.
   *
   * @param activeKeyPresses The active key presses
   * @param finalKeyPress The final key press
   * @returns The key combo event
   */
  private _wrapEvent(
    activeKeyPresses: KeyPress<OriginalEvent, KeyEventProps>[][],
    finalKeyPress: KeyPress<OriginalEvent, KeyEventProps>
  ): KeyComboEvent<OriginalEvent, KeyEventProps, KeyComboEventProps> {
    const mappedEventProps = this._keyComboEventMapper(
      activeKeyPresses,
      finalKeyPress
    );

    return {
      ...mappedEventProps,
      keyCombo: this._normalizedKeyCombo,
      keyEvents: activeKeyPresses.flat().map(p => p.event),
      finalKeyEvent: finalKeyPress.event,
    };
  }
}

/**
 * The default sequence timeout.
 */
export const defaultSequenceTimeout = 1000;

/**
 * The `Keystrokes` class is used to bind handlers to
 * key presses and key combos. It can be used to bind
 * handlers to keys and key combos, and to check if
 * keys and key combos are currently pressed.
 *
 * The `Keystrokes` class is designed to be used in
 * the browser, but can be used in any environment by
 * providing custom event binders.
 *
 * **Methods**
 * - `bindKey` - Binds a key to a handler
 * - `unbindKey` - Unbinds a key from a handler
 * - `bindKeyCombo` - Binds a key combo to a handler
 * - `unbindKeyCombo` - Unbinds a key combo from a handler
 * - `checkKey` - Checks if a key is currently pressed
 * - `checkKeyCombo` - Checks if a key combo is currently pressed
 * - `checkKeyComboSequenceIndex` - Gets the sequence index of a key combo
 * - `bindEnvironment` - Binds the keystrokes instance to the environment
 * - `unbindEnvironment` - Unbinds the keystrokes instance from the environment
 *
 * **Properties**
 * - `pressedKeys` - The currently pressed keys
 * - `sequenceTimeout` - The sequence timeout used to determine when a key combo sequence should be reset
 *
 * @example
 * ```ts
 * const keystrokes = new Keystrokes()
 *
 * // All of the functions we've reviewed above are methods on the instance
 * keystrokes.bindKey(...)
 * keystrokes.bindKeyCombo(...)
 * keystrokes.unbindKey(...)
 * keystrokes.unbindKeyCombo(...)
 * keystrokes.checkKey(...)
 * keystrokes.checkKeyCombo(...)
 * ```
 */
export class Keystrokes<
  OriginalEvent = KeyboardEvent,
  KeyEventProps = MaybeBrowserKeyEventProps<OriginalEvent>,
  KeyComboEventProps = MaybeBrowserKeyComboEventProps<OriginalEvent>,
> {
  /**
   * The sequence timeout used to determine when a key
   * combo sequence should be reset.
   */
  sequenceTimeout: number;

  /**
   * The currently pressed keys.
   */
  get pressedKeys(): string[] {
    return this._activeKeyPresses.map(p => p.key);
  }

  /**
   * Whether the keystrokes instance is active.
   */
  private _isActive: boolean;

  /**
   * The function used to unbind any bound keys.
   */
  private _unbinder: (() => void) | undefined;

  /**
   * The function used to bind the `onActive` handler.
   */
  private _onActiveBinder: OnActiveEventBinder;
  /**
   * The function used to bind the `onInactive` handler.
   */
  private _onInactiveBinder: OnActiveEventBinder;
  /**
   * The function used to bind the `onKeyPressed` handler.
   */
  private _onKeyPressedBinder: OnKeyEventBinder<OriginalEvent, KeyEventProps>;
  /**
   * The function used to bind the `onKeyReleased` handler.
   */
  private _onKeyReleasedBinder: OnKeyEventBinder<OriginalEvent, KeyEventProps>;
  /**
   * The function used to map the active key presses to a key combo event.
   */
  private _keyComboEventMapper: KeyComboEventMapper<
    OriginalEvent,
    KeyEventProps,
    KeyComboEventProps
  >;

  /**
   * Key names added to selfReleasingKeys will be marked as
   * released after any other key is released. Provided
   * to deal with buggy platforms.
   */
  private _selfReleasingKeys: string[];
  /**
   * An object of key value pairs with the key being
   * the key to rename, and the value being the new name.
   */
  private _keyRemap: Record<string, string>;

  /**
   * The handler states for each key.
   */
  private _handlerStates: Record<
    string,
    HandlerState<KeyEvent<OriginalEvent, KeyEventProps>>[]
  >;
  /**
   * The key combo states for each key combo.
   */
  private _keyComboStates: Record<
    string,
    KeyComboState<OriginalEvent, KeyEventProps, KeyComboEventProps>[]
  >;
  /**
   * The list of key combo states.
   */
  private _keyComboStatesArray: KeyComboState<
    OriginalEvent,
    KeyEventProps,
    KeyComboEventProps
  >[];
  /**
   * The currently active key presses.
   */
  private _activeKeyPresses: KeyPress<OriginalEvent, KeyEventProps>[];
  /**
   * The currently active key map.
   */
  private _activeKeyMap: Map<string, KeyPress<OriginalEvent, KeyEventProps>>;

  /**
   * The watched key combo states.
   */
  private _watchedKeyComboStates: Record<
    string,
    KeyComboState<OriginalEvent, KeyEventProps, KeyComboEventProps>
  >;

  /**
   * @constructor
   * @param options The options to use for the keystrokes instance
   * @param options.onActive The handler to call when the keystrokes instance becomes active
   * @param options.onInactive The handler to call when the keystrokes instance becomes inactive
   * @param options.onKeyPressed The handler to call when a key is pressed
   * @param options.onKeyReleased The handler to call when a key is released
   * @param options.mapKeyComboEvent The function to map the active key presses to a key combo event
   * @param options.selfReleasingKeys Key names added to selfReleasingKeys will be marked as released after any other key is released. Provided to deal with buggy platforms
   * @param options.keyRemap An object of key value pairs with the key being the key to rename, and the value being the new name
   */
  constructor(
    options: KeystrokesOptions<
      OriginalEvent,
      KeyEventProps,
      KeyComboEventProps
    > = {}
  ) {
    this.sequenceTimeout = defaultSequenceTimeout;

    this._isActive = true;

    this._onActiveBinder = () => {};
    this._onInactiveBinder = () => {};
    this._onKeyPressedBinder = () => {};
    this._onKeyReleasedBinder = () => {};
    this._keyComboEventMapper = () => ({}) as any;
    this._selfReleasingKeys = [];
    this._keyRemap = {};

    this._handlerStates = {};
    this._keyComboStates = {};
    this._keyComboStatesArray = [];
    this._activeKeyPresses = [];
    this._activeKeyMap = new Map();

    this._watchedKeyComboStates = {};

    this.bindEnvironment(options);
  }

  /**
   * Binds a key to a handler.
   *
   * @param key Key to bind
   * @param handler The handler to call when the key is pressed
   */
  bindKey(
    key: string | string[],
    handler: Handler<KeyEvent<OriginalEvent, KeyEventProps>>
  ): void {
    if (isObjectType(key)) {
      for (const k of key) {
        this.bindKey(k, handler);
      }
      return;
    }

    key = key.toLowerCase();

    const handlerState = new HandlerState(handler);
    this._handlerStates[key] ??= [];
    this._handlerStates[key]?.push(handlerState);
  }

  /**
   * Unbinds a key from a handler.
   *
   * @param key Key to unbind
   * @param handler The handler to unbind
   */
  unbindKey(
    key: string | string[],
    handler?: Handler<KeyEvent<OriginalEvent, KeyEventProps>>
  ): void {
    if (isObjectType(key)) {
      for (const k of key) {
        this.unbindKey(k, handler);
      }
      return;
    }

    key = key.toLowerCase();

    const handlerStates = this._handlerStates[key];
    if (!handlerStates) {
      return;
    }

    if (handler) {
      for (let i = 0; i < handlerStates.length; i += 1) {
        if (handlerStates[i]?.isOwnHandler(handler)) {
          handlerStates.splice(i, 1);
          i -= 1;
        }
      }
    } else {
      handlerStates.length = 0;
    }
  }

  /**
   * Binds a key combo to a handler.
   *
   * @param keyCombo Key combo to bind
   * @param handler The handler to call when the key combo is activated
   */
  bindKeyCombo(
    keyCombo: string | string[],
    handler: Handler<
      KeyComboEvent<OriginalEvent, KeyEventProps, KeyComboEventProps>
    >
  ): void {
    if (isObjectType(keyCombo)) {
      for (const k of keyCombo) {
        this.bindKeyCombo(k, handler);
      }
      return;
    }

    keyCombo = KeyComboState.normalizeKeyCombo(keyCombo);

    const keyComboState = new KeyComboState<
      OriginalEvent,
      KeyEventProps,
      KeyComboEventProps
    >(keyCombo, this._keyComboEventMapper, handler);

    this._keyComboStates[keyCombo] ??= [];
    this._keyComboStates[keyCombo]?.push(keyComboState);
    this._keyComboStatesArray.push(keyComboState);
  }

  /**
   * Unbinds a key combo from a handler.
   *
   * @param keyCombo Key combo to unbind
   * @param handler The handler to unbind
   */
  unbindKeyCombo(
    keyCombo: string | string[],
    handler?: Handler<
      KeyComboEvent<OriginalEvent, KeyEventProps, KeyComboEventProps>
    >
  ): void {
    if (isObjectType(keyCombo)) {
      for (const k of keyCombo) {
        this.unbindKeyCombo(k, handler);
      }
      return;
    }

    keyCombo = KeyComboState.normalizeKeyCombo(keyCombo);

    const keyComboStates = this._keyComboStates[keyCombo];
    if (!keyComboStates) {
      return;
    }

    if (handler) {
      for (let i = 0; i < keyComboStates.length; i += 1) {
        if (keyComboStates[i]?.isOwnHandler(handler)) {
          for (let j = 0; j < this._keyComboStatesArray.length; j += 1) {
            if (this._keyComboStatesArray[j] === keyComboStates[i]) {
              this._keyComboStatesArray.splice(j, 1);
              j -= 1;
            }
          }

          keyComboStates.splice(i, 1);
          i -= 1;
        }
      }
    } else {
      keyComboStates.length = 0;
    }
  }

  /**
   * Checks if a key is currently pressed.
   *
   * @param key The key to check
   * @returns `true` if the key is pressed, otherwise `false`
   */
  checkKey(key: string): boolean {
    return this._activeKeyMap.has(key.toLowerCase());
  }

  /**
   * Checks if a key combo is currently pressed.
   *
   * @param keyCombo The key combo to check
   * @returns `true` if the key combo is pressed, otherwise `false`
   */
  checkKeyCombo(keyCombo: string): boolean {
    const keyComboState = this._ensureCachedKeyComboState(keyCombo);
    return !!keyComboState?.isPressed;
  }

  /**
   * Gets the sequence index of a key combo.
   *
   * @param keyCombo The key combo to check
   * @returns The sequence index of the key combo
   */
  checkKeyComboSequenceIndex(keyCombo: string): number {
    const keyComboState = this._ensureCachedKeyComboState(keyCombo);
    return keyComboState?.sequenceIndex as number;
  }

  /**
   * Binds the keystrokes instance to the environment.
   *
   * @param options The options to use for the keystrokes instance
   * @param options.onActive The handler to call when the keystrokes instance becomes active
   * @param options.onInactive The handler to call when the keystrokes instance becomes inactive
   * @param options.onKeyPressed The handler to call when a key is pressed
   * @param options.onKeyReleased The handler to call when a key is released
   * @param options.mapKeyComboEvent The function to map the active key presses to a key combo event
   * @param options.selfReleasingKeys Key names added to selfReleasingKeys will be marked as released after any other key is released. Provided to deal with buggy platforms
   * @param options.keyRemap An object of key value pairs with the key being the key to rename, and the value being the new name
   */
  bindEnvironment(
    options: BindEnvironmentOptions<
      OriginalEvent,
      KeyEventProps,
      KeyComboEventProps
    > = {}
  ): void {
    this.unbindEnvironment();

    this._onActiveBinder = options.onActive ?? browserOnActiveBinder;
    this._onInactiveBinder = options.onInactive ?? browserOnInactiveBinder;
    this._onKeyPressedBinder =
      options.onKeyPressed ??
      (browserOnKeyPressedBinder as OnKeyEventBinder<
        OriginalEvent,
        KeyEventProps
      >);
    this._onKeyReleasedBinder =
      options.onKeyReleased ??
      (browserOnKeyReleasedBinder as OnKeyEventBinder<
        OriginalEvent,
        KeyEventProps
      >);
    this._keyComboEventMapper = options.mapKeyComboEvent ?? (() => ({}) as any);
    this._selfReleasingKeys = options.selfReleasingKeys ?? [];
    this._keyRemap = options.keyRemap ?? {};

    const unbindActive = this._onActiveBinder(() => {
      this._isActive = true;
    });
    const unbindInactive = this._onInactiveBinder(() => {
      this._isActive = false;
    });
    const unbindKeyPressed = this._onKeyPressedBinder(e => {
      this._handleKeyPress(e);
    });
    const unbindKeyReleased = this._onKeyReleasedBinder(e => {
      this._handleKeyRelease(e);
    });

    this._unbinder = () => {
      unbindActive?.();
      unbindInactive?.();
      unbindKeyPressed?.();
      unbindKeyReleased?.();
    };
  }

  /**
   * Unbinds the keystrokes instance from the environment.
   */
  unbindEnvironment(): void {
    this._unbinder?.();
  }

  /**
   * Ensures the cached state for a key combo.
   *
   * @param keyCombo The key combo to ensure the cached state for
   * @returns The key combo state
   */
  private _ensureCachedKeyComboState(
    keyCombo: string
  ): KeyComboState<OriginalEvent, KeyEventProps, KeyComboEventProps> {
    keyCombo = KeyComboState.normalizeKeyCombo(keyCombo);

    if (!this._watchedKeyComboStates[keyCombo]) {
      this._watchedKeyComboStates[keyCombo] = new KeyComboState(
        keyCombo,
        this._keyComboEventMapper
      );
    }

    const keyComboState = this._watchedKeyComboStates[keyCombo];
    keyComboState?.updateState(this._activeKeyPresses, this.sequenceTimeout);
    return keyComboState as KeyComboState<
      OriginalEvent,
      KeyEventProps,
      KeyComboEventProps
    >;
  }

  /**
   * Handles a key press event.
   *
   * @param event The event caused by the key press to handle
   */
  private _handleKeyPress(event: KeyEvent<OriginalEvent, KeyEventProps>): void {
    if (!this._isActive) {
      return;
    }

    event = {
      ...event,
      key: event.key.toLowerCase(),
      aliases: event.aliases?.map(a => a.toLowerCase()) ?? [],
    };

    const remappedKey = this._keyRemap[event.key];
    if (remappedKey) {
      event.key = remappedKey;
    }
    if (event.aliases) {
      for (let i = 0; i < event.aliases.length; i += 1) {
        const remappedAlias = this._keyRemap[event.aliases[i] as string];
        if (remappedAlias) {
          event.aliases[i] = remappedAlias;
        }
      }
    }

    const keyPressHandlerStates = this._handlerStates[event.key];
    if (keyPressHandlerStates) {
      for (const s of keyPressHandlerStates) {
        s.executePressed(event);
      }
    }

    const existingKeypress = this._activeKeyMap.get(event.key);
    if (existingKeypress) {
      existingKeypress.event = event;
    } else {
      const keypress = {
        key: event.key,
        aliases: new Set(event.aliases),
        event,
      };
      this._activeKeyMap.set(event.key, keypress);
      this._activeKeyPresses.push(keypress);
    }

    this._updateKeyComboStates();

    for (const keyComboState of this._keyComboStatesArray) {
      keyComboState.executePressed(event);
    }
  }

  /**
   * Handles a key release event.
   *
   * @param event The event caused by the key release to handle
   */
  private _handleKeyRelease(
    event: KeyEvent<OriginalEvent, KeyEventProps>
  ): void {
    event = {
      ...event,
      key: event.key.toLowerCase(),
      aliases: event.aliases?.map(a => a.toLowerCase()) ?? [],
    };

    const remappedKey = this._keyRemap[event.key];
    if (remappedKey) {
      event.key = remappedKey;
    }
    if (event.aliases) {
      for (let i = 0; i < event.aliases.length; i += 1) {
        const remappedAlias = this._keyRemap[event.aliases[i] as string];
        if (remappedAlias) {
          event.aliases[i] = remappedAlias;
        }
      }
    }

    const keyPressHandlerStates = this._handlerStates[event.key];
    if (keyPressHandlerStates) {
      for (const s of keyPressHandlerStates) {
        s.executeReleased(event);
      }
    }

    if (this._activeKeyMap.has(event.key)) {
      this._activeKeyMap.delete(event.key);

      for (let i = 0; i < this._activeKeyPresses.length; i += 1) {
        if (this._activeKeyPresses[i]?.key === event.key) {
          this._activeKeyPresses.splice(i, 1);
          i -= 1;
          break;
        }
      }
    }

    this._tryReleaseSelfReleasingKeys();
    this._updateKeyComboStates();

    for (const keyComboState of this._keyComboStatesArray) {
      keyComboState.executeReleased(event);
    }
  }

  /**
   * Updates the state of the key combo states.
   */
  private _updateKeyComboStates(): void {
    for (const keyComboState of this._keyComboStatesArray) {
      keyComboState.updateState(this._activeKeyPresses, this.sequenceTimeout);
    }
  }

  /**
   * Tries to release the self-releasing keys.
   */
  private _tryReleaseSelfReleasingKeys(): void {
    for (const activeKey of this._activeKeyPresses) {
      for (const selfReleasingKey of this._selfReleasingKeys) {
        if (activeKey.key === selfReleasingKey) {
          this._handleKeyRelease(activeKey.event);
        }
      }
    }
  }
}

/**
 * The global keystrokes options.
 */
let globalKeystrokesOptions: KeystrokesOptions;
/**
 * The global keystrokes instance.
 */
let globalKeystrokes: Keystrokes;

/**
 * Sets the global keystrokes instance.
 *
 * @param keystrokes (Optional) The keystrokes instance
 */
export const setGlobalKeystrokes = (keystrokes?: Keystrokes) => {
  globalKeystrokes = keystrokes ?? new Keystrokes(globalKeystrokesOptions);
};

/**
 * Gets the global keystrokes instance.
 *
 * @returns The global keystrokes instance
 */
export const getGlobalKeystrokes = () => {
  if (!globalKeystrokes) {
    setGlobalKeystrokes();
  }
  return globalKeystrokes;
};

/**
 * Sets the global keystrokes options.
 *
 * @param options The keystrokes options
 */
export const setGlobalKeystrokesOptions = (options: KeystrokesOptions) => {
  globalKeystrokesOptions = options;
};

/**
 * Binds a key to a handler.
 *
 * @param key The key to bind
 * @param handler The handler to call when the key is pressed
 */
export const bindKey: typeof globalKeystrokes.bindKey = (...args) =>
  getGlobalKeystrokes().bindKey(...args);

/**
 * Unbinds a key from a handler.
 *
 * @param key The key to unbind
 * @param handler The handler to unbind
 */
export const unbindKey: typeof globalKeystrokes.unbindKey = (...args) =>
  getGlobalKeystrokes().unbindKey(...args);

/**
 * Binds a key combo to a handler.
 *
 * @param keyCombo Key combo to bind
 * @param handler The handler to call when the key combo is pressed
 */
export const bindKeyCombo: typeof globalKeystrokes.bindKeyCombo = (...args) =>
  getGlobalKeystrokes().bindKeyCombo(...args);

/**
 * Unbinds a key combo from a handler.
 *
 * @param keyCombo Key combo to unbind
 * @param handler The handler to unbind
 */
export const unbindKeyCombo: typeof globalKeystrokes.unbindKeyCombo = (
  ...args
) => getGlobalKeystrokes().unbindKeyCombo(...args);

/**
 * Checks if a key is pressed.
 *
 * @param key The key to check
 * @returns `true` if the key is pressed, otherwise `false`
 */
export const checkKey: typeof globalKeystrokes.checkKey = (...args) =>
  getGlobalKeystrokes().checkKey(...args);

/**
 * Checks if a key combo is currently pressed.
 *
 * @param keyCombo The key combo to check
 * @returns `true` if the key combo is pressed, otherwise `false`
 */
export const checkKeyCombo: typeof globalKeystrokes.checkKeyCombo = (...args) =>
  getGlobalKeystrokes().checkKeyCombo(...args);

/**
 * Normalizes a key combo string. This is used to ensure that the
 * same key combo string always represents the same key combo.
 *
 * @param keyComboStr — The key combo string to normalize.
 * @returns — The normalized key combo string.
 */
export const normalizeKeyCombo = KeyComboState.normalizeKeyCombo;
/**
 * Converts a parsed key combo into a string.
 *
 * @param keyCombo The parsed key combo to stringify.
 * @returns The stringified key combo.
 */
export const stringifyKeyCombo = KeyComboState.stringifyKeyCombo;
/**
 * Normalizes a key combo string. This is used to ensure that the same
 * key combo string always represents the same key combo.
 *
 * @param keyComboStr The key combo string to normalize.
 * @returns The normalized key combo string.
 */
export const parseKeyCombo = KeyComboState.parseKeyCombo;

/**
 * Type alias for a test keystrokes instance.
 */
export type TestKeystrokes<OriginalEvent, KeyEventProps, KeyComboEventProps> =
  Keystrokes<OriginalEvent, KeyEventProps, KeyComboEventProps> & {
    /**
     * Activates the keystrokes instance.
     */
    activate(): void;
    /**
     * Deactivates the keystrokes instance.
     */
    deactivate(): void;
    /**
     * Simulates a key press.
     *
     * @param key The key to press
     */
    press(key: Partial<KeyEvent<OriginalEvent, KeyEventProps>>): void;
    /**
     * Simulates a key release.
     *
     * @param key The key to release
     */
    release(key: Partial<KeyEvent<OriginalEvent, KeyEventProps>>): void;
  };

/**
 * Creates an instance of `{@link Keystrokes}` modified for test cases.
 * It has four additional methods for controlling the internal state.
 *
 * If your app uses the global instance of keystrokes then
 * this can be used in conjunction with `{@link setGlobalKeystrokes}`.
 *
 * @example
 * ```ts
 * import assert from "assert"
 * import { createTestKeystrokes } from "hook-utils"
 *
 * describe("MyApp", () => {
 *   it("correctly handles the key combo", () => {
 *     const keystrokes = createTestKeystrokes()
 *
 *     const app = new MyApp({ keystrokes })
 *
 *     keystrokes.press({ key: "a" })
 *     keystrokes.press({ key: "b" })
 *
 *     await app.update()
 *
 *     assert(app.didComboBoundThing)
 *   })
 * })
 *
 * // ---------------------
 *
 * import { describe, it, expect } from "vitest"
 * import { createTestKeystrokes, setGlobalKeystrokes } from "hook-utils"
 *
 * describe("MyApp", () => {
 *   it("correctly handles the key combo", () => {
 *     const keystrokes = createTestKeystrokes()
 *     setGlobalKeystrokes(keystrokes)
 *
 *     const app = new MyApp()
 *
 *     keystrokes.press({ key: "a" })
 *     keystrokes.press({ key: "b" })
 *
 *     await app.update()
 *
 *     expect(app.didComboBoundThing).toBe(true)
 *   })
 * })
 * ```
 *
 * @param options The keystrokes options
 * @param options.onActive The on active event handler
 * @param options.onInactive The on inactive event handler
 * @param options.onKeyPressed The on key pressed event handler
 * @param options.onKeyReleased The on key released event handler
 * @returns A test keystrokes instance
 */
export const createTestKeystrokes = <
  OriginalEvent = KeyboardEvent,
  KeyEventProps = MaybeBrowserKeyEventProps<OriginalEvent>,
  KeyComboEventProps = MaybeBrowserKeyComboEventProps<OriginalEvent>,
>(
  options: KeystrokesOptions<
    OriginalEvent,
    KeyEventProps,
    KeyComboEventProps
  > = {}
): TestKeystrokes<OriginalEvent, KeyEventProps, KeyComboEventProps> => {
  let activate: () => void;
  let deactivate: () => void;
  let press: (event: KeyEvent<OriginalEvent, KeyEventProps>) => void;
  let release: (event: KeyEvent<OriginalEvent, KeyEventProps>) => void;

  const testKeystrokes = Object.assign(
    new Keystrokes<OriginalEvent, KeyEventProps, KeyComboEventProps>({
      ...options,
      onActive(f) {
        activate = f;
      },
      onInactive(f) {
        deactivate = f;
      },
      onKeyPressed(f) {
        press = f;
      },
      onKeyReleased(f) {
        release = f;
      },
    }),
    {
      activate() {
        activate();
      },
      deactivate() {
        deactivate();
      },
      press(event: KeyEvent<OriginalEvent, KeyEventProps>) {
        press({ composedPath: () => [], ...event });
      },
      release(event: KeyEvent<OriginalEvent, KeyEventProps>) {
        release({ composedPath: () => [], ...event });
      },
    }
  ) as TestKeystrokes<OriginalEvent, KeyEventProps, KeyComboEventProps>;

  return testKeystrokes;
};
