import { useContext, useEffect, useRef, useState } from "react";

import { KeystrokesContext } from "../../components/Keystrokes.ts";

/**
 * React UI sensor hook to watch a key combo and
 * return whether it is pressed.
 *
 * The key combo is a string that represents a
 * combination of keys. It is a string of key names
 * separated by ` + ` characters, such as `Control + z`.
 *
 * If you would rather track a single key, use the
 * `{@link useKey}` hook instead.
 *
 * If you would like to use a custom keystroke instance,
 * you can use this hook in combination with the
 * `{@link KeystrokesProvider}` component. Otherwise,
 * the default keystrokes instance will be used.
 *
 * @example
 * ```tsx
 * const isKeyPressed = useKeyCombo("Control + z");
 * ```
 *
 * @param keyCombo The key combo to watch
 * @returns `true` if `keyCombo` is pressed, otherwise `false`
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useKeyCombo = (keyCombo: string): boolean => {
  const [isPressed, setIsPressed] = useState(false);

  const keystrokes = useContext(KeystrokesContext)();

  const keyComboRef = useRef(keyCombo);
  keyComboRef.current = keyCombo;

  useEffect(() => {
    const staticKeyCombo = keyComboRef.current;

    const handler = {
      onPressed: () => setIsPressed(true),
      onReleased: () => setIsPressed(false),
    };

    keystrokes.bindKeyCombo(staticKeyCombo, handler);

    return () => {
      keystrokes.unbindKeyCombo(staticKeyCombo, handler);
    };
  }, [keystrokes]);

  return isPressed;
};
