import type {
  CookieAttributes,
  CookieConverter,
  CookiesStatic,
} from "../types/logic.ts";
import { hasDocument } from "../utils/hasDocument.ts";
import { isNumber } from "../utils/isNumber.ts";
import { merge } from "../utils/merge.ts";

/**
 * Default converter for reading and writing cookies.
 */
const defaultConverter = {
  read: <T = string>(value: T | string) => {
    if ((value as string)[0] === '"') {
      value = (value as string).slice(1, -1);
    }
    return (value as string).replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
  },
  write: <T = string>(value: T | string) =>
    encodeURIComponent(value as string).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent
    ),
};

/**
 * A class for reading, writing and removing cookies.
 *
 * **Methods**:
 * - `set` — Create cookie.
 * - `get` — Read cookie.
 * - `remove` — Delete cookie.
 * - `withAttributes` - Create a new instance of the api that overrides the default attributes. Cookie attribute defaults can be set globally by creating an instance of the api via withAttributes(), or individually for each call to Cookies.set(...) by passing a plain object as the last argument. Per-call attributes override the default attributes.
 * - `withConverter` — Create a new instance of the api that overrides the default decoding implementation. All methods that rely in a proper decoding to work, such as Cookies.remove() and Cookies.get(), will run the converter first for each cookie. The returned string will be used as the cookie value.
 *
 * **Properties**
 * - `attributes` — Attributes used when setting cookies.
 * - `converter` — Read and write converter for cookies.
 */
class Cookies<T = string> implements CookiesStatic<T> {
  /**
   * Attributes used when setting cookies.
   */
  readonly attributes: CookieAttributes = {
    path: "/",
  };

  /**
   * Read and write converter for cookies.
   */
  readonly converter: Required<CookieConverter<T>> = defaultConverter;

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
  ): string | undefined {
    if (!hasDocument()) {
      return;
    }

    options = merge({}, this.attributes, options ?? {});

    if (isNumber(options.expires)) {
      options.expires = new Date(Date.now() + options.expires * 864e5);
    }

    name = encodeURIComponent(name)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape);

    let stringifiedAttributes = "";

    for (const optName in options) {
      if (!options[optName]) {
        continue;
      }

      stringifiedAttributes += `; ${optName}`;

      if (options[optName] === true) {
        continue;
      }

      // Considers RFC 6265 section 5.2:
      // ...
      // 3.  If the remaining unparsed-attributes contains a %x3B (";")
      //     character:
      // Consume the characters of the unparsed-attributes up to,
      // not including, the first %x3B (";") character.
      // ...
      if (optName === "expires") {
        stringifiedAttributes += `=${(options[optName] as Date).toUTCString()}`;
      } else {
        stringifiedAttributes += `=${options[optName].split(";")[0]}`;
      }
    }

    return (document.cookie = `${name}=${this.converter.write(
      value,
      name
    )}${stringifiedAttributes}`);
  }

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
   * Read cookie.
   *
   * If no `name` is provided, all available cookies will be returned.
   *
   * @param name (Optional) The name of the cookie.
   * @returns The value of the cookie, or `undefined` if the cookie does not exist. If no `name` is provided, an object containing all available cookies will be returned.
   */
  get(name?: string): string | T | undefined | { [key: string]: string | T } {
    /* 
		  biome-ignore lint/style/noArguments:
		  Using `arguments` is necessary here because the
		  `name` parameter is optional. If `name` is not
		  provided, then `arguments.length` will be `0`,
		  which is a falsy value.
		 */
    if (!hasDocument() || (arguments.length && !name)) {
      return;
    }

    // To prevent the for loop in the first place assign an empty array
    // in case there are no cookies at all.
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const jar: { [key: string]: string | T } = {};

    for (const cookie of cookies) {
      const parts = cookie.split("=");
      const value = parts.slice(1).join("=");

      try {
        const key = parts[0];
        if (!key) {
          continue;
        }

        const found = decodeURIComponent(key);
        if (!(found in jar)) {
          jar[found] = this.converter.read(value, found);
        }
        if (name === found) {
          break;
        }
      } catch {
        // Do nothing...
      }
    }

    return name ? jar[name] : jar;
  }

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
  remove(name: string, options?: CookieAttributes): void {
    this.set(name, "", merge({}, options ?? {}, { expires: -1 }));
  }

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
  withAttributes(attributes: CookieAttributes): CookiesStatic<T> {
    return new Cookies<T>(
      this.converter,
      merge({}, this.attributes, attributes)
    );
  }

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
  ): CookiesStatic<TConv> {
    return new Cookies<TConv>(converter, this.attributes);
  }

  /**
   * @constructor
   * @param converter The converter to use.
   * @param converter.write The serializer function to convert a cookie being written.
   * @param converter.read The deserializer function to convert a cookie being read.
   * @param attributes The attributes to set.
   * @param attributes.expires (Optional) Define when the cookie will be removed. Value can be a Number which will be interpreted as days from time of creation or a Date instance. If omitted, the cookie becomes a session cookie.
   * @param attributes.path (Optional) Define the path where the cookie is available (Defaults to '/').
   * @param attributes.domain (Optional) Define the domain where the cookie is available. Defaults to the domain of the page where the cookie was created.
   * @param attributes.secure (Optional) A Boolean indicating if the cookie transmission requires a secure protocol (https). Defaults to false.
   * @param attributes.sameSite (Optional) Asserts that a cookie must not be sent with cross-origin requests, providing some protection against cross-site request forgery attacks (CSRF). One of: `"strict"` | `"Strict"` | `"lax"` | `"Lax"` | `"none"` | `"None"` | `undefined`.
   * @param attributes[property] (Optional) An attribute which will be serialized, conformably to RFC 6265 section 5.2.
   */
  constructor(
    converter: Required<CookieConverter<T>>,
    attributes: CookieAttributes
  ) {
    this.attributes = merge({}, this.attributes, attributes);
    this.converter = merge({}, this.converter, converter);
  }
}

/**
 * An object for reading, writing and removing cookies.
 *
 * The default type for the cookie value is `string`,
 * but this can be changed using the `withConverter`
 * method to implement a custom conversion logic.
 * If this is done, the `set` and `get` methods will respect
 * the new type and use the custom conversion logic.
 *
 * **Methods**:
 * - `set` — Create cookie.
 * - `get` — Read cookie.
 * - `remove` — Delete cookie.
 * - `withAttributes` - Create a new instance of the api that overrides the default attributes. Cookie attribute defaults can be set globally by creating an instance of the api via withAttributes(), or individually for each call to Cookies.set(...) by passing a plain object as the last argument. Per-call attributes override the default attributes.
 * - `withConverter` — Create a new instance of the api that overrides the default decoding implementation. All methods that rely in a proper decoding to work, such as Cookies.remove() and Cookies.get(), will run the converter first for each cookie. The returned string will be used as the cookie value.
 *
 * **Properties**
 * - `attributes` — Attributes used when setting cookies.
 * - `converter` — Read and write converter for cookies.
 *
 * @example
 * ```ts
 * import { Cookies } from "hook-utils";
 *
 * // Default usage
 * Cookies.set("name", "value");
 * Cookies.get("name"); // => "value"
 * Cookies.get(); // => { name: "value" }
 * Cookies.remove("name");
 *
 * // Create a new instance of the api that overrides
 * // the default attributes
 * const CookiesWithCustomAttributes = Cookies.withAttributes(
 *   {
 *     path: "/custom",
 *     // ...
 *   }
 * );
 *
 * // Create a new instance of the api that overrides
 * // the default encoding/decoding implementation.
 * // You can also use this to change the type of the
 * // cookie value using this method.
 * const CookiesWithCustomConverter = Cookies.withConverter(
 *   {
 *     write: (value, name) => {
 *       // custom value serialization
 *       // return the custom value
 *     },
 *     read: (value, name) => {
 *       // custom value deserialization
 *       // return the custom value
 *     }
 *   }
 * )
 * ```
 */
const cookies = new Cookies<string>(defaultConverter, { path: "/" });

export { cookies as Cookies };
