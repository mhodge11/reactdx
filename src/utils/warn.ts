import { prettify } from "./prettify.ts";

/**
 * Logs a warning message to the console only in development.
 *
 * @param message The warning message
 * @param args An objects of the arguments to log
 */
export const warn = (message: string, args?: Record<string, unknown>): void => {
  if (process.env.NODE_ENV !== "production") {
    const msg = args ? [message, `Args: ${prettify(args)}`] : [message];
    // eslint-disable-next-line no-console
    console.warn(...msg);
  }
};
