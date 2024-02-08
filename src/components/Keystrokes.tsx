import React from "react";

import { getGlobalKeystrokes } from "../logic/keystrokes.ts";
import {
  KeystrokesContextData,
  KeystrokesProviderProps,
} from "../types/components.ts";

/**
 * The default Keystrokes context.
 */
export const defaultKeystrokesContext: KeystrokesContextData = () =>
  getGlobalKeystrokes();

/**
 * The Keystrokes context.
 *
 * This context provides access to the global
 * keystrokes instance. It is used to provide
 * the keystrokes instance to components that
 * need it. It is also used to provide a default
 * keystrokes instance to components that do not
 * have a provider.
 *
 * @example
 * ```tsx
 * const keystrokes = useContext(KeystrokesContext)()
 * ```
 *
 * @category Context
 * @since 0.0.1
 */
export const KeystrokesContext = React.createContext(defaultKeystrokesContext);

/**
 * The Keystrokes provider.
 *
 * This provider is used to provide the keystrokes
 * instance to components in case you would like to
 * use a custom configuration or instance.
 *
 * To learn more about the keystrokes instance options,
 * see the `{@link Keystrokes}` class.
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const isComboPressed = useKeyCombo("a + b")
 *   const isKeyPressed = useKeyCombo("c")
 *
 *  // ...
 * }
 *
 * const App = () => {
 *   const keystrokes = new Keystrokes({
 *     // custom options here
 *   })
 *
 *   return (
 *     <KeystrokesProvider keystrokes={keystrokes}>
 *       <Component />
 *     </KeystrokesProvider>
 *   )
 * }
 * ```
 *
 * @param props The keystrokes provider props to use
 * @param props.keystrokes The keystrokes instance to provide
 * @param props.children The children to render within the provider
 * @returns The keystrokes provider component
 *
 * @category Context
 * @since 0.0.1
 */
export const KeystrokesProvider = (props: KeystrokesProviderProps) => {
  const { keystrokes, children } = props;

  return (
    <KeystrokesContext.Provider value={() => keystrokes}>
      {children}
    </KeystrokesContext.Provider>
  );
};
