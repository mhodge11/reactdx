import { useContext, useEffect, useRef, useState } from "react";

import { KeystrokesContext } from "../../components/Keystrokes.ts";

/**
 * React UI sensor hook to watch a key and
 * return whether it is pressed.
 *
 * If you would rather track a combination of keys,
 * use the `{@link useKeyCombo}` hook instead.
 *
 * If you would like to use acustom keystroke instance,
 * you can use this hook in combination with the
 * `{@link KeystrokesProvider}` component. Otherwise,
 * the default keystrokes instance will be used.
 *
 * @example
 * ```tsx
 * const isKeyPressed = useKeyCombo("Control + z");
 * ```
 *
 * @param key The key to watch
 * @returns `true` if `key` is pressed, otherwise `false`
 *
 * @category Sensor
 * @since 0.0.1
 */
export const useKey = (key: string): boolean => {
  const [isPressed, setIsPressed] = useState(false);

  const keystrokes = useContext(KeystrokesContext)();

  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    const staticKey = keyRef.current;

    const handler = {
      onPressed: () => setIsPressed(true),
      onReleased: () => setIsPressed(false),
    };

    keystrokes.bindKey(staticKey, handler);

    return () => {
      keystrokes.unbindKey(staticKey, handler);
    };
  }, [keystrokes]);

  return isPressed;
};
