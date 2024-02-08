import type {
  AnimatableNumericalProperties,
  AnimatableProps,
  AnimatableTransformProperties,
} from "../types/logic.ts";
import { isNullOrUndefined } from "../utils/isNullOrUndefined.ts";
import { isUndefined } from "../utils/isUndefined.ts";
import { warn } from "../utils/warn.ts";

/**
 * Creates a CSS function with the given name and parameters.
 *
 * @param name The name of the CSS function
 * @param params The parameters of the CSS function
 * @returns A function that returns the CSS function with the given parameters
 */
const cssFunction =
  <Values extends (number | string)[]>(
    name: string,
    ...params: { [Value in keyof Values]: (k: Values[Value]) => string }
  ) =>
  (...values: Values) =>
    `${name}(${params.map((p, i) => p(values[i] as string | number))})`;

/**
 * Converts a number to pixels.
 *
 * @param n The number to convert to pixels
 * @returns The number as a string with "px" appended
 */
const px = (n: number) => `${n ?? 0}px`;

/**
 * Converts a number to alpha.
 *
 * @param x The number to convert to alpha
 * @returns The number as a stringified number between 0 and 1
 */
const alpha = (x: number) => `${x < 0 ? 0 : x > 1 ? 1 : x}`;

/**
 * Converts a number to a ratio.
 *
 * @param n The number to convert to a ratio
 * @returns The number as a string
 */
const ratio = (n: number) => `${n}`;

/**
 * Converts a number to degrees.
 *
 * @param n The number to convert to degrees
 * @returns The number as a string with "deg" appended
 */
const deg = (n: number) => `${n}deg`;

/**
 * Converts a number to a color component.
 *
 * @param x The number to convert to a color component
 * @returns The number as a stringified number between 0 and 255
 */
const colorComponent = (x: number) =>
  `${x < 0 ? 0 : x > 255 ? 255 : Math.round(x)}`;

/**
 * Converts a tuple of numbers to an RGB color.
 *
 * @param r The red component
 * @param g The green component
 * @param b The blue component
 * @returns The RGB color as a string
 */
const rgb = cssFunction<[r: number, g: number, b: number]>(
  "rgb",
  colorComponent,
  colorComponent,
  colorComponent
);

/**
 * Converts a tuple of numbers to an RGBA color.
 *
 * @param r The red component
 * @param g The green component
 * @param b The blue component
 * @param a The alpha component
 * @returns The RGBA color as a string
 */
const rgba = cssFunction<[r: number, g: number, b: number, a: number]>(
  "rgba",
  colorComponent,
  colorComponent,
  colorComponent,
  alpha
);

/**
 * Wraps the translate CSS function.
 */
const translate = cssFunction("translate", px, px);
/**
 * Wraps the translate3d CSS function.
 */
const translate3d = cssFunction("translate3d", px, px, px);
/**
 * Wraps the scale CSS function.
 */
const scale = cssFunction("scale", ratio, ratio);
/**
 * Wraps the rotate CSS function.
 */
const rotate = cssFunction("rotate", deg, deg);
/**
 * Wraps the rotateZ CSS function.
 */
const rotateZ = cssFunction("rotateZ", deg);
/**
 * Wraps the skew CSS function.
 */
const skew = cssFunction("skew", deg, deg);

/**
 * Converts a tuple of numbers to a color.
 *
 * @param r The red component
 * @param g The green component
 * @param b The blue component
 * @param a (Optional) The alpha component
 * @returns The color as a string
 */
function color([r, g, b]: [r: number, g: number, b: number]): string;
function color([r, g, b, a]: [r: number, g: number, b: number, a?: number]) {
  return typeof a === "undefined" ? rgb(r, g, b) : rgba(r, g, b, a);
}

/**
 * The animatable numerical properties.
 */
export const numericalProperties = {
  top: px,
  left: px,
  right: px,
  bottom: px,
  width: px,
  height: px,
  opacity: alpha,
  color,
  background: color,
  backgroundColor: color,
  borderBottomColor: color,
  borderColor: color,
  borderLeftColor: color,
  borderRightColor: color,
  borderTopColor: color,
  outlineColor: color,
  textDecorationColor: color,
  fontSize: px,
  lineHeight: px,
  letterSpacing: px,
};

/**
 * The animatable transform properties.
 */
export const transformProperties = {
  translateX: true,
  translateY: true,
  translateZ: true,
  scaleX: true,
  scaleY: true,
  rotateX: true,
  rotateY: true,
  rotateZ: true,
  skewX: true,
  skewY: true,
};

/**
 * Converts the animatable transform properties to a style object.
 *
 * @param props The properties to convert
 * @param props.translateX (Optional) The x translation
 * @param props.translateY (Optional) The y translation
 * @param props.translateZ (Optional) The z translation
 * @param props.scaleX (Optional) The x scale
 * @param props.scaleY (Optional) The y scale
 * @param props.rotateX (Optional) The x rotation
 * @param props.rotateY (Optional) The y rotation
 * @param props.rotateZ (Optional) The z rotation
 * @param props.skewX (Optional) The x skew
 * @param props.skewY (Optional) The y skew
 * @returns The style object
 */
const toTransformStyle = ({
  translateX: tx,
  translateY: ty,
  translateZ: tz,
  scaleX: sx,
  scaleY: sy,
  rotateX: rx,
  rotateY: ry,
  rotateZ: rz,
  skewX: kx,
  skewY: ky,
}: Partial<AnimatableTransformProperties>) => {
  const transforms: string[] = [];

  if (!isUndefined(tz)) {
    transforms.push(translate3d(tx ?? 0, ty ?? 0, tz ?? 0));
  } else if (!isUndefined(tx) || !isUndefined(ty)) {
    transforms.push(translate(tx ?? 0, ty ?? 0));
  }

  if (!isUndefined(sx) || !isUndefined(sy)) {
    transforms.push(scale(sx ?? 1, sy ?? 1));
  }

  if (!isUndefined(rx) || !isUndefined(ry)) {
    transforms.push(rotate(rx ?? 0, ry ?? 0));
  }

  if (!isUndefined(rz)) {
    transforms.push(rotateZ(rz || 0));
  }

  if (!isUndefined(kx) || !isUndefined(ky)) {
    transforms.push(skew(kx ?? 0, ky ?? 0));
  }

  if (transforms.length === 0) {
    return "none";
  }

  return transforms.join(" ");
};

/**
 * Converts the animatable properties to a CSS style object.
 *
 * @param props The animatable properties to convert to a CSS style object.
 * @param props.top (Optional) The top position
 * @param props.left (Optional) The left position
 * @param props.right (Optional) The right position
 * @param props.bottom (Optional) The bottom position
 * @param props.width (Optional) The width
 * @param props.height (Optional) The height
 * @param props.opacity (Optional) The opacity
 * @param props.color (Optional) The color
 * @param props.background (Optional) The background color
 * @param props.backgroundColor (Optional) The background color
 * @param props.borderBottomColor (Optional) The bottom border color
 * @param props.borderColor (Optional) The border color
 * @param props.borderLeftColor (Optional) The left border color
 * @param props.borderRightColor (Optional) The right border color
 * @param props.borderTopColor (Optional) The top border color
 * @param props.outlineColor (Optional) The outline color
 * @param props.textDecorationColor (Optional) The text decoration color
 * @param props.fontSize (Optional) The font size
 * @param props.lineHeight (Optional) The line height
 * @param props.letterSpacing (Optional) The letter spacing
 * @param props.translateX (Optional) The x translation
 * @param props.translateY (Optional) The y translation
 * @param props.translateZ (Optional) The z translation
 * @param props.scaleX (Optional) The x scale
 * @param props.scaleY (Optional) The y scale
 * @param props.rotateX (Optional) The x rotation
 * @param props.rotateY (Optional) The y rotation
 * @param props.rotateZ (Optional) The z rotation
 * @param props.skewX (Optional) The x skew
 * @param props.skewY (Optional) The y skew
 * @returns The CSS style object.
 */
export const toStyle = (
  props: Partial<AnimatableProps>
): Partial<React.CSSProperties> => {
  const transformProps: Partial<AnimatableTransformProperties> = {};
  const style: Partial<React.CSSProperties> = {};

  for (const p in props) {
    const val = props[p as keyof typeof props];

    if (isNullOrUndefined(val)) {
      continue;
    }

    if (p in transformProperties) {
      const prop = p as keyof AnimatableTransformProperties;
      transformProps[prop] = val as number;
    } else if (p in numericalProperties) {
      const prop = p as keyof AnimatableNumericalProperties;
      // @ts-expect-error: TS doesn't like the complexity of this type.
      style[prop as keyof typeof style] = numericalProperties[prop](val as any);
    } else {
      warn(`Unsuppored prop: ${p}`);
    }
  }

  return { ...style, transform: toTransformStyle(transformProps) };
};
