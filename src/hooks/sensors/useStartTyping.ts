import { useRef } from "react";

import { hasDocument } from "../../utils/hasDocument.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";
import { useIsomorphicLayoutEffect } from "../lifecycles/useIsomorphicLayoutEffect.ts";

/**
 * Check if the currently focused element is editable.
 *
 * @returns `true` if the currently focused element is editable, otherwise `false`.
 */
const isFocusedElementEditable = () => {
  const { activeElement, body } = document;

  if (!activeElement) {
    return false;
  }

  // If element doesn't have focus, we assume it is not editable too.
  if (activeElement === body) {
    return false;
  }

  // Assume <input> and <textarea> elements are editable.
  switch (activeElement.tagName) {
    case "INPUT":
    case "TEXTAREA":
      return true;
  }

  // Check if the active element is contenteditable.
  return activeElement.hasAttribute("contenteditable");
};

/**
 * Check if the typed character is 0 - 9 or a - z.
 *
 * @param event The keyboard event.
 * @returns `true` if the typed character is good, otherwise `false`.
 */
const isTypedCharGood = ({ key, metaKey, ctrlKey, altKey }: KeyboardEvent) => {
  if (metaKey || ctrlKey || altKey) {
    return false;
  }

  switch (key) {
    case "a":
    case "b":
    case "c":
    case "d":
    case "e":
    case "f":
    case "g":
    case "h":
    case "i":
    case "j":
    case "k":
    case "l":
    case "m":
    case "n":
    case "o":
    case "p":
    case "q":
    case "r":
    case "s":
    case "t":
    case "u":
    case "v":
    case "w":
    case "x":
    case "y":
    case "z":
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      return true;
  }

  return false;
};

/**
 * React sensor hook that fires a callback when user starts typing.
 * Can be used to focus default input field on the page.
 *
 * @example
 * ```tsx
 * useStartTyping(() => alert("Started typing..."));
 * ```
 *
 * @param onStartTyping The callback to fire when user starts typing.
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useStartTyping = hasDocument()
  ? (onStartTyping: (event: KeyboardEvent) => void): void => {
      const _onStartTyping = useRef(onStartTyping);
      _onStartTyping.current = onStartTyping;

      useIsomorphicLayoutEffect(() => {
        const keydown = (event: KeyboardEvent) => {
          if (!isFocusedElementEditable() && isTypedCharGood(event)) {
            _onStartTyping.current(event);
          }
        };

        on(document, "keydown", keydown);

        return () => {
          off(document, "keydown", keydown);
        };
      }, []);
    }
  : (onStartTyping: (event: KeyboardEvent) => void): void => {
      warn(
        "The `useStartTyping` hook should be used in a browser environment.",
        {
          onStartTyping,
        }
      );
    };
