import type {
  Looper,
  RGBColor,
  SpringListener,
  SpringsForNumbers,
  SpringSystemListener,
} from "../types/logic.ts";
import { isNullOrUndefined } from "../utils/isNullOrUndefined.ts";

let _onFrame: ((callback: () => unknown) => number | void) | undefined;

// Get the `requestAnimationFrame` function for the current environment.
if (typeof window !== "undefined") {
  _onFrame =
    window.requestAnimationFrame ||
    // @ts-expect-error: legacy API for Safari
    window.webkitRequestAnimationFrame ||
    // @ts-expect-error: legacy API for Firefox
    window.mozRequestAnimationFrame ||
    // @ts-expect-error: legacy API for IE
    window.msRequestAnimationFrame ||
    // @ts-expect-error: legacy API for Opera
    window.oRequestAnimationFrame;
}

// If the current environment is Node.js and `_onFrame` is `undefined`,
// use `setImmediate` instead.
if (!_onFrame && typeof process !== "undefined" && process.title === "node") {
  _onFrame = (callback: () => unknown) => {
    setImmediate(callback);
  };
}

// If `_onFrame` is still `undefined`, use `setTimeout` instead.
_onFrame ??= (callback: () => unknown) => {
  setTimeout(callback, 1000 / 60);
};

/**
 * Bind a function to a context object.
 *
 * @param fn The function to bind
 * @param context The context object to bind the function to
 * @param outerArgs The arguments to pass to the function
 * @returns The bound function
 */
export const bind =
  (fn: (...args: any) => any, context: object, ...outerArgs: unknown[]) =>
  (...innerArgs: unknown[]) => {
    fn.apply(
      context,
      Array.prototype.concat.call(
        outerArgs,
        Array.prototype.slice.call(innerArgs)
      )
    );
  };

/**
 * Add all the properties in the source to the target.
 *
 * @param target The target object to add the properties to
 * @param source The source object to add the properties from
 */
export const extend = (target: object, source: object): void => {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      (target as any)[key] = (source as any)[key];
    }
  }
};

/**
 * Provides a requestAnimationFrame function that works
 * across multiple browsers.
 *
 * @param callback The function to call on each frame
 * @returns The `requestAnimationFrame` return value
 */
export const onFrame = (callback: () => unknown): number | void =>
  (_onFrame as (callback: () => unknown) => number | void)(callback);

/**
 * Lop off the first occurrence of the reference in the array.
 *
 * @param array The array to remove the item from
 * @param item The item to remove from the array
 */
export const removeFirst = <T>(array: T[], item: T): void => {
  const i = array.indexOf(item);
  if (i > -1) {
    array.splice(i, 1);
  }
};

/**
 * Cache for color strings to RGB objects.
 */
const colorCache: { [color: string]: RGBColor } = {};

/**
 * Converts a hex color string to an RGB object.
 *
 * Handy for performing tweening animations.
 *
 * @param color The color string to convert
 * @returns The RGB color object
 */
export const hexToRGB = (colorStr: string): RGBColor => {
  if (colorCache[colorStr]) {
    return colorCache[colorStr] as RGBColor;
  }

  let normalizedColor = colorStr.replace("#", "");

  if (normalizedColor.length === 3) {
    normalizedColor = `${normalizedColor[0]}${normalizedColor[0]}${normalizedColor[1]}${normalizedColor[1]}${normalizedColor[2]}${normalizedColor[2]}`;
  }

  const parts = normalizedColor.match(/.{2}/g);

  if (!parts || parts.length < 3) {
    throw new Error("Expected a color string of format '#rrggbb'");
  }

  const ret: RGBColor = {
    r: parseInt(parts[0] as string, 16),
    g: parseInt(parts[1] as string, 16),
    b: parseInt(parts[2] as string, 16),
  };

  colorCache[colorStr] = ret;

  return ret;
};

/**
 * Converts an RGB object to a hex color string.
 *
 * Handy for performing tweening animations.
 *
 * @param rNum The red value
 * @param gNum The green value
 * @param bNum The blue value
 * @returns The hex-formatted color string
 */
export const rgbToHex = (rNum: number, gNum: number, bNum: number): string => {
  let r = rNum.toString(16);
  let g = gNum.toString(16);
  let b = bNum.toString(16);

  r = r.length < 2 ? `0${r}` : r;
  g = g.length < 2 ? `0${g}` : g;
  b = b.length < 2 ? `0${b}` : b;

  return `#${r}${g}${b}`;
};

/**
 * This helper function does a linear interpolation of a value from
 * one range to another. This can be very useful for converting the
 * motion of a Spring to a range of UI property values. For example a
 * spring moving from position 0 to 1 could be interpolated to move a
 * view from pixel 300 to 350 and scale it from 0.5 to 1. The current
 * position of the `Spring` just needs to be run through this method
 * taking its input range in the _from_ parameters with the property
 * animation range in the _to_ parameters.
 *
 * @param value The value to interpolate
 * @param fromLow The low end of the `value`'s range
 * @param fromHigh The high end of the `value`'s range
 * @param toLow The low end of the `value`'s target range
 * @param toHigh The high end of the `value`'s target range
 * @returns The interpolated value
 */
export const mapValueInRange = (
  value: number,
  fromLow: number,
  fromHigh: number,
  toLow: number,
  toHigh: number
): number => {
  const fromRangeSize = fromHigh - fromLow;
  const toRangeSize = toHigh - toLow;
  const valueScale = (value - fromLow) / fromRangeSize;

  return toLow + valueScale * toRangeSize;
};

/**
 * Interpolate two hex colors in a 0 - 1 range or optionally provide a
 * custom range with fromLow,fromHight. The output will be in hex by default
 * unless asRGB is true in which case it will be returned as an rgb string.
 *
 * @param value The value to interpolate
 * @param startColorStr The color string to interpolate from
 * @param endColorStr The color string to interpolate to
 * @param fromLow (Optional) The low end of the `value`'s range (Defaults to 0)
 * @param fromHigh (Optional) The high end of the `value`'s range (Defaults to 1)
 * @param asRGB (Optional) Whether to return an rgb-style string
 * @return A string in hex color format unless asRGB is true, in which case a string in rgb format
 */
export const interpolateColor = (
  value: number,
  startColorStr: string,
  endColorStr: string,
  fromLow: number = 0,
  fromHigh: number = 1,
  asRGB?: boolean
): string => {
  const startColor = hexToRGB(startColorStr);
  const endColor = hexToRGB(endColorStr);

  const r = Math.floor(
    mapValueInRange(value, fromLow, fromHigh, startColor.r, endColor.r)
  );
  const g = Math.floor(
    mapValueInRange(value, fromLow, fromHigh, startColor.g, endColor.g)
  );
  const b = Math.floor(
    mapValueInRange(value, fromLow, fromHigh, startColor.b, endColor.b)
  );

  if (asRGB) {
    return `rgb(${r},${g},${b})`;
  }
  return rgbToHex(r, g, b);
};

/**
 * Convert degrees to radians.
 *
 * @param deg The degrees to convert to radians
 * @returns The converted radians
 */
export const degreesToRadians = (deg: number): number => deg * (Math.PI / 180);

/**
 * Convert radians to degrees.
 *
 * @param rad The radians to convert to degrees
 * @returns The converted degrees
 */
export const radiansToDegrees = (rad: number): number => rad * (180 / Math.PI);

/**
 * Math for converting from
 * [Origami](http://facebook.github.io/origami/) to
 * [Rebound](http://facebook.github.io/rebound).
 * You mostly don't need to worry about this, just use
 * SpringConfig.fromOrigamiTensionAndFriction(v, v).
 */
export const OrigamiValueConverter = {
  /**
   * Converts an Origami value to a tension value.
   *
   * @param oValue The Origami value to convert to a tension value
   * @returns The converted tension value
   */
  tensionFromOrigami: (oValue: number): number =>
    (oValue - 30.0) * 3.62 + 194.0,
  /**
   * Converts a tension value to an Origami value.
   *
   * @param tension The tension value to convert to an Origami value
   * @returns The converted Origami value
   */
  origamiFromTension: (tension: number): number =>
    (tension - 194.0) / 3.62 + 30.0,
  /**
   * Converts an Origami value to a friction value.
   *
   * @param oValue The Origami value to convert to a friction value
   * @returns The converted friction value
   */
  frictionFromOrigami: (oValue: number): number => (oValue - 8.0) * 3.0 + 25.0,
  /**
   * Converts a friction value to an Origami value.
   *
   * @param friction The friction value to convert to an Origami value
   * @returns The converted Origami value
   */
  origamiFromFriction: (friction: number): number =>
    (friction - 25.0) / 3.0 + 8.0,
};

/**
 * Consists of a position and velocity. A Spring uses
 * this internally to keep track of its current and
 * prior position and velocity values.
 *
 * **Properties**
 * - `position` - The position to track
 * - `velocity` - The velocity to track
 */
export class PhysicsState {
  /**
   * The position to track.
   */
  position: number = 0;
  /**
   * The velocity to track.
   */
  velocity: number = 0;
}

/**
 * Provides math for converting from Origami PopAnimation
 * config values to regular Origami tension and friction values.
 * If you are trying to replicate prototypes made with
 * PopAnimation patches in Origami, then you should create your
 * springs with SpringSystem.createSpringWithBouncinessAndSpeed,
 * which uses this Math internally to create a spring to match
 * the provided PopAnimation configuration from Origami.
 *
 * **Methods**
 * - `normalize` - Normalizes a value between a start and end value
 * - `projectNormal` - Projects a value between a start and end value
 * - `linearInterpolation` - Linearly interpolates a value between a start and end value
 * - `quadraticOutInterpolation` - Quadratically interpolates a value between a start and end value
 * - `b3Friction1` - Calculates the friction for a value with low tension using the B3 friction curve
 * - `b3Friction2` - Calculates the friction for a value with medium tension using the B3 friction curve
 * - `b3Friction3` - Calculates the friction for a value with high tension using the B3 friction curve
 * - `b3Nobounce` - Calculates the friction for a value using the B3 friction curve
 *
 * **Properties**
 * - `bounciness` - The bounciness to use for the conversion
 * - `bouncyFriction` - The friction calculated from the provided bounciness
 * - `bouncyTension` - The tension calculated from the provided speed
 * - `speed` - The speed to use for the conversion
 */
export class BouncyConversion {
  /**
   * The bounciness to use for the conversion.
   */
  bounciness: number;
  /**
   * The friction calculated from the provided bounciness.
   */
  bouncyFriction: number;
  /**
   * The tension calculated from the provided speed.
   */
  bouncyTension: number;
  /**
   * The speed to use for the conversion.
   */
  speed: number;

  /**
   * @constructor
   * @param bounciness The bounciness to use for the conversion.
   * @param speed The speed to use for the conversion.
   */
  constructor(bounciness: number, speed: number) {
    this.bounciness = bounciness;
    this.speed = speed;

    let b = this.normalize(bounciness / 1.7, 0, 20.0);
    b = this.projectNormal(b, 0.0, 0.8);

    const s = this.normalize(speed / 1.7, 0, 20.0);

    this.bouncyTension = this.projectNormal(s, 0.5, 200);

    this.bouncyFriction = this.quadraticOutInterpolation(
      b,
      this.b3Nobounce(this.bouncyTension),
      0.01
    );
  }

  /**
   * Normalizes a value between a start and end value.
   *
   * @param value The value to normalize
   * @param startValue The start value
   * @param endValue The end value
   * @returns The normalized value
   */
  normalize(value: number, startValue: number, endValue: number): number {
    return (value - startValue) / (endValue - startValue);
  }

  /**
   * Projects a value between a start and end value.
   *
   * @param n The value to project
   * @param start The start value
   * @param end The end value
   * @returns The projected value
   */
  projectNormal(n: number, start: number, end: number): number {
    return start + n * (end - start);
  }

  /**
   * Linearly interpolates a value between a start and end value.
   *
   * @param t The value to interpolate
   * @param start The start value
   * @param end The end value
   * @returns The interpolated value
   */
  linearInterpolation(t: number, start: number, end: number): number {
    return t * end + (1.0 - t) * start;
  }

  /**
   * Quadratically interpolates a value between a start and end value.
   *
   * @param t The value to interpolate
   * @param start The start value
   * @param end The end value
   * @returns The interpolated value
   */
  quadraticOutInterpolation(t: number, start: number, end: number): number {
    return this.linearInterpolation(2 * t - t * t, start, end);
  }

  /**
   * Calculates the friction for a value with low tension
   * using the B3 friction curve.
   *
   * @param x The value to calculate the friction for
   * @returns The friction for the provided value
   */
  b3Friction1(x: number): number {
    return 0.0007 * x ** 3 - 0.031 * x ** 2 + 0.64 * x + 1.28;
  }

  /**
   * Calculates the friction for a value with medium tension
   * using the B3 friction curve.
   *
   * @param x The value to calculate the friction for
   * @returns The friction for the provided value
   */
  b3Friction2(x: number): number {
    return 0.000044 * x ** 3 - 0.006 * x ** 2 + 0.36 * x + 2;
  }

  /**
   * Calculates the friction for a value with high tension
   * using the B3 friction curve.
   *
   * @param x The value to calculate the friction for
   * @returns The friction for the provided value
   */
  b3Friction3(x: number): number {
    return 0.00000045 * x ** 3 - 0.000332 * x ** 2 + 0.1078 * x + 5.84;
  }

  /**
   * Calculates the friction for a value using the B3 friction curve.
   *
   * @param tension The tension to calculate the friction for
   * @returns The friction for the provided tension
   */
  b3Nobounce(tension: number): number {
    let friction = 0;

    if (tension <= 18) {
      friction = this.b3Friction1(tension);
    } else if (tension > 18 && tension <= 44) {
      friction = this.b3Friction2(tension);
    } else {
      friction = this.b3Friction3(tension);
    }

    return friction;
  }
}

/**
 * Gets the SpringSystem instance used by the Looper.
 *
 * @param this The Looper instance
 * @returns The SpringSystem instance used by the Looper
 */
function getSpringSystem(this: Looper): SpringSystem {
  if (isNullOrUndefined(this.springSystem)) {
    throw new Error("Cannot run looper without a springSystem");
  }

  return this.springSystem;
}

/**
 * Plays each frame of the SpringSystem on animation
 * timing loop. This is the default type of looper for a new spring system
 * as it is the most common when developing UI.
 *
 * **Methods**
 * - `run` - Play each frame of the SpringSystem on animation timing loop
 *
 * **Properties**
 * - `springSystem` - The SpringSystem to run on each frame
 */
export class AnimationLooper {
  /**
   *  The SpringSystem to run on each frame.
   */
  springSystem: SpringSystem | null | undefined = null;

  /**
   * Play each frame of the SpringSystem on animation timing loop.
   */
  run() {
    const springSystem = getSpringSystem.call(this);

    onFrame(() => {
      springSystem.loop(Date.now());
    });
  }
}

/**
 * Resolves the SpringSystem to a resting state in a
 * tight and blocking loop. This is useful for synchronously generating
 * pre-recorded animations that can then be played on a timing loop later.
 * Sometimes this lead to better performance to pre-record a single spring
 * curve and use it to drive many animations; however, it can make dynamic
 * response to user input a bit trickier to implement.
 *
 * **Methods**
 * - `run` - Play each frame of the SpringSystem on simulation timing loop
 *
 * **Properties**
 * - `springSystem` - The SpringSystem to run on each frame
 * - `timestep` - The time step to add to the time on each frame
 * - `time` - The time tracker that is added to on each frame
 * - `running` - Whether the looper is currently running
 */
export class SimulationLooper {
  /**
   * The SpringSystem to run on each frame.
   */
  springSystem: SpringSystem | null | undefined = null;
  /**
   * The time step to add to the time on each frame.
   */
  timestep: number;
  /**
   * The time tracker that is added to on each frame.
   */
  time: number = 0;
  /**
   * Whether the looper is currently running.
   */
  running: boolean = false;

  /**
   * @constructor
   * @param timeStep The time step to add to the time on each frame
   */
  constructor(timestep?: number) {
    this.timestep = timestep ?? 16.667;
  }

  /**
   * Play each frame of the SpringSystem on simulation timing loop.
   */
  run(): void {
    if (this.running) {
      return;
    }

    const springSystem = getSpringSystem.call(this);

    this.running = true;

    while (!springSystem.getIsIdle()) {
      springSystem.loop((this.time += this.timestep));
    }

    this.running = false;
  }
}

/**
 * Resolves the SpringSystem to a resting state in a
 * tight and blocking loop. This is useful for synchronously generating
 * pre-recorded animations that can then be played on a timing loop later.
 * Sometimes this lead to better performance to pre-record a single spring
 * curve and use it to drive many animations; however, it can make dynamic
 * response to user input a bit trickier to implement.
 *
 * **Methods**
 * - `step` - Perform one step toward resolving the SpringSystem
 *
 * **Properties**
 * - `springSystem` - The SpringSystem to run on each frame
 * - `time` - The time tracker that is added to on each frame
 */
export class SteppingSimulationLooper {
  /**
   * The SpringSystem to run on each frame.
   */
  springSystem: SpringSystem | null | undefined = null;
  /**
   * The time tracker that is added to on each frame.
   */
  time: number = 0;

  /**
   * NOOP function to allow control from the outside using this.step.
   */
  run(): void {
    /*
    this.run is NOOP'd here to allow control from
		the outside using this.step.
    */
  }

  /**
   * Perform one step toward resolving the SpringSystem.
   *
   * @param timestep The time step to add to the time on each frame
   */
  step(timestep: number): void {
    const springSystem = getSpringSystem.call(this);
    springSystem.loop((this.time += timestep));
  }
}

/**
 * Maintains a set of tension and friction constants
 * for a Spring. You can use fromOrigamiTensionAndFriction to convert
 * values from the [Origami](http://facebook.github.io/origami/)
 * design tool directly to Rebound spring constants.
 *
 * **Static Methods**
 * - `fromOrigamiTensionAndFriction` - Convert an origami Spring tension and friction to Rebound spring constants
 * - `fromBouncinessAndSpeed` - Convert an origami PopAnimation Spring bounciness and speed to Rebound spring constants
 * - `coastingConfigWithOrigamiFriction` - Create a SpringConfig with no tension or a coasting spring with some amount of Friction so that it does not coast infininitely
 *
 * **Static Properties**
 * - `DEFAULT_ORIGAMI_SPRING_CONFIG` - The default origami spring config that can be used directly
 *
 * **Properties**
 * - `friction` - The friction constant to maintain
 * - `tension` - The tension constant to maintain
 */
export class SpringConfig {
  /**
   * The friction constant to maintain.
   */
  friction: number;
  /**
   *  The tension constant to maintain.
   */
  tension: number;

  /**
   * The default origami spring config that can be used directly.
   */
  static DEFAULT_ORIGAMI_SPRING_CONFIG =
    SpringConfig.fromOrigamiTensionAndFriction(40, 7);

  /**
   * Convert an origami Spring tension and friction to Rebound spring
   * constants. If you are prototyping a design with Origami, this
   * makes it easy to make your springs behave exactly the same in
   * Rebound.
   *
   * @param tension The tension value to convert
   * @param friction The friction value to convert
   * @returns The new SpringConfig
   */
  static fromOrigamiTensionAndFriction(
    tension: number,
    friction: number
  ): SpringConfig {
    return new SpringConfig(
      OrigamiValueConverter.tensionFromOrigami(tension),
      OrigamiValueConverter.frictionFromOrigami(friction)
    );
  }

  /**
   * Convert an origami PopAnimation Spring bounciness and speed to Rebound
   * spring constants. If you are using PopAnimation patches in Origami, this
   * utility will provide springs that match your prototype.
   *
   * @param bounciness The bounciness value to convert
   * @param speed The speed value to convert
   * @returns The new SpringConfig
   */
  static fromBouncinessAndSpeed(
    bounciness: number,
    speed: number
  ): SpringConfig {
    const bouncyConversion = new BouncyConversion(bounciness, speed);

    return SpringConfig.fromOrigamiTensionAndFriction(
      bouncyConversion.bouncyTension,
      bouncyConversion.bouncyFriction
    );
  }

  /**
   * Create a SpringConfig with no tension or a coasting spring with some
   * amount of Friction so that it does not coast infininitely.
   *
   * @param friction The amount of friction to apply to the coasting spring
   * @returns The new coasting SpringConfig
   */
  static coastingConfigWithOrigamiFriction(friction: number): SpringConfig {
    return new SpringConfig(
      0,
      OrigamiValueConverter.frictionFromOrigami(friction)
    );
  }

  /**
   * @constructor
   * @param tension The tension value
   * @param friction The friction value
   */
  constructor(tension: number, friction: number) {
    this.tension = tension;
    this.friction = friction;
  }
}

/**
 * A set of Springs that all run on the same physics
 * timing loop. To get started with a Rebound animation, first
 * create a new SpringSystem and then add springs to it.
 *
 * **Methods**
 * - `setLooper` - Set the looper to use for the SpringSystem
 * - `createSpring` - Add a new spring to this SpringSystem
 * - `createSpringWithBouncinessAndSpeed` - Add a spring with a specified bounciness and speed
 * - `createSpringWithConfig` - Add a spring with the provided SpringConfig
 * - `getIsIdle` - Check if a SpringSystem is idle or active
 * - `getSpringById` - Retrieve a specific Spring from the SpringSystem by id
 * - `getAllSprings` - Get a listing of all the springs registered with this SpringSystem
 * - `registerSpring` - Manually add a spring to this system
 * - `deregisterSpring` - Deregister a spring with this SpringSystem
 * - `advance` - Advance the spring system by a specified amount of time in milliseconds
 * - `loop` - This is the main solver loop called to move the simulation forward through time
 * - `activateSpring` - Used to notify the SpringSystem that a Spring has become displaced
 * - `addListener` - Add a listener to the SpringSystem to receive before/after integration notifications
 * - `removeListener` - Remove a previously added listener on the SpringSystem
 * - `removeAllListeners` - Remove all previously added listeners on the SpringSystem
 *
 * **Properties**
 * - `listeners` - The spring system listeners
 * - `looper` - The looper to use for the SpringSystem
 */
export class SpringSystem {
  /**
   * The spring system listeners.
   */
  listeners: SpringSystemListener[] = [];
  /**
   * The looper to use for the SpringSystem.
   */
  looper: Looper;

  /**
   * The currently active springs.
   */
  private activeSprings: Spring[] = [];
  /**
   * The indices of the currently idle springs.
   */
  private idleSpringIndices: number[] = [];
  /**
   *  Whether the spring system is idle.
   */
  private isIdle: boolean = true;
  /**
   * Tracks the time the last loop was run.
   */
  private lastTimeMillis: number = -1;
  /**
   * The registry of all springs in the system.
   */
  private springRegistry: { [id: string]: Spring } = {};

  /**
   * @constructor
   * @param looper The looper to use for the SpringSystem
   */
  constructor(looper?: Looper) {
    this.looper = looper ?? new AnimationLooper();
    this.looper.springSystem = this;
  }

  /**
   * A SpringSystem is iterated by a looper. The looper is responsible
   * for executing each frame as the SpringSystem is resolved to idle.
   * There are three types of Loopers described below AnimationLooper,
   * SimulationLooper, and SteppingSimulationLooper. AnimationLooper is
   * the default as it is the most useful for common UI animations.
   *
   * @param looper The looper to use for the SpringSystem
   */
  setLooper(looper: Looper): void {
    this.looper = looper;
    looper.springSystem = this;
  }

  /**
   * Add a new spring to this SpringSystem. This Spring will now be solved for
   * during the physics iteration loop. By default the spring will use the
   * default Origami spring config with 40 tension and 7 friction, but you can
   * also provide your own values here.
   *
   * @param tension (Optional) The tension value for the new spring
   * @param friction (Optional) The friction value for the new spring
   * @returns The spring that was added
   */
  createSpring(tension?: number, friction?: number): Spring {
    let springConfig: SpringConfig;

    if (isNullOrUndefined(tension) || isNullOrUndefined(friction)) {
      springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
    } else {
      springConfig = SpringConfig.fromOrigamiTensionAndFriction(
        tension,
        friction
      );
    }

    return this.createSpringWithConfig(springConfig);
  }

  /**
   * Add a spring with a specified bounciness and speed. To replicate Origami
   * compositions based on PopAnimation patches, use this factory method to
   * create matching springs.
   *
   * @param bounciness (Optional) The bounciness value for the new spring
   * @param speed (Optional) The speed value for the new spring
   * @returns The spring that was added
   */
  createSpringWithBouncinessAndSpeed(
    bounciness?: number,
    speed?: number
  ): Spring {
    let springConfig: SpringConfig;

    if (isNullOrUndefined(bounciness) || isNullOrUndefined(speed)) {
      springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
    } else {
      springConfig = SpringConfig.fromBouncinessAndSpeed(bounciness, speed);
    }

    return this.createSpringWithConfig(springConfig);
  }

  /**
   * Add a spring with the provided SpringConfig.
   *
   * @param springConfig The SpringConfig for the new spring
   * @returns The spring that was added
   */
  createSpringWithConfig(springConfig: SpringConfig): Spring {
    const spring = new Spring(this);
    this.registerSpring(spring);
    spring.setSpringConfig(springConfig);
    return spring;
  }

  /**
   * Check if a SpringSystem is idle or active. If all of the Springs in the
   * SpringSystem are at rest, i.e. the physics forces have reached
   * equilibrium, then this method will return true.
   */
  getIsIdle(): boolean {
    return this.isIdle;
  }

  /**
   * Retrieve a specific Spring from the SpringSystem by id. This
   * can be useful for inspecting the state of a spring before
   * or after an integration loop in the SpringSystem executes.
   *
   * @param id The id of the spring to retrieve
   * @returns The spring for the specified id
   */
  getSpringById(id: string): Spring {
    return this.springRegistry[id] as Spring;
  }

  /**
   * Get a listing of all the springs registered with
   * this SpringSystem.
   *
   * @returns All of the springs in the registry
   */
  getAllSprings(): Spring[] {
    const springs: Spring[] = [];

    for (const id in this.springRegistry) {
      if (Object.prototype.hasOwnProperty.call(this.springRegistry, id)) {
        springs.push(this.springRegistry[id] as Spring);
      }
    }

    return springs;
  }

  /**
   * Manually add a spring to this system. This is called automatically
   * if a Spring is created with `SpringSystem.createSpring`.
   *
   * This method sets the spring up in the registry so that
   * it can be solved in the solver loop.
   *
   * @param spring The spring to add to the system
   */
  registerSpring(spring: Spring): void {
    this.springRegistry[spring.getId()] = spring;
  }

  /**
   * Deregister a spring with this SpringSystem. The SpringSystem will
   * no longer consider this Spring during its integration loop once
   * this is called. This is normally done automatically for you when
   * you call `Spring.destroy`.
   *
   * @param spring The spring to remove from the system
   */
  deregisterSpring(spring: Spring): void {
    removeFirst(this.activeSprings, spring);

    const springId = spring.getId();
    const { [springId]: _, ...springRegistry } = this.springRegistry;
    this.springRegistry = springRegistry;
  }

  /**
   * Advance the spring system by a specified amount of time
   * in milliseconds.
   *
   * @param time The time to advance to
   * @param deltaTime The delta time since the last time this method was called
   */
  advance(time: number, deltaTime: number): void {
    while (this.idleSpringIndices.length > 0) {
      this.idleSpringIndices.pop();
    }

    for (let i = 0, len = this.activeSprings.length; i < len; i++) {
      const spring = this.activeSprings[i] as Spring;

      if (spring.systemShouldAdvance()) {
        spring.advance(time / 1000.0, deltaTime / 1000.0);
      } else {
        this.idleSpringIndices.push(this.activeSprings.indexOf(spring));
      }
    }

    while (this.idleSpringIndices.length > 0) {
      const i = this.idleSpringIndices.pop() as number;
      if (i > -1) {
        this.activeSprings.splice(i, 1);
      }
    }
  }

  /**
   * This is the main solver loop called to move the simulation
   * forward through time. Before each pass in the solver loop
   * onBeforeIntegrate is called on an any listeners that have
   * registered themeselves with the SpringSystem. This gives you
   * an opportunity to apply any constraints or adjustments to
   * the springs that should be enforced before each iteration
   * loop. Next the advance method is called to move each Spring in
   * the systemShouldAdvance forward to the current time. After the
   * integration step runs in advance, onAfterIntegrate is called
   * on any listeners that have registered themselves with the
   * SpringSystem. This gives you an opportunity to run any post
   * integration constraints or adjustments on the Springs in the
   * SpringSystem.
   *
   * @param currentTimeMillis The current time in milliseconds
   */
  loop(currentTimeMillis: number): void {
    let listener: SpringSystemListener;

    if (this.lastTimeMillis === -1) {
      this.lastTimeMillis = currentTimeMillis - 1;
    }

    const ellapsedMillis = currentTimeMillis - this.lastTimeMillis;
    this.lastTimeMillis = currentTimeMillis;

    let i = 0;
    const len = this.listeners.length;

    for (i = 0; i < len; i++) {
      listener = this.listeners[i] as SpringSystemListener;
      if (listener.onBeforeIntegrate) {
        listener.onBeforeIntegrate(this);
      }
    }

    this.advance(currentTimeMillis, ellapsedMillis);

    if (this.activeSprings.length === 0) {
      this.isIdle = true;
      this.lastTimeMillis = -1;
    }

    for (i = 0; i < len; i++) {
      listener = this.listeners[i] as SpringSystemListener;
      if (listener.onAfterIntegrate) {
        listener.onAfterIntegrate(this);
      }
    }

    if (!this.isIdle) {
      this.looper.run();
    }
  }

  /**
   * Used to notify the SpringSystem that a Spring has
   * become displaced. The system responds by starting
   * its solver loop up if it is currently idle.
   *
   * @param springId The id of the spring that has become displaced
   */
  activateSpring(springId: string): void {
    const spring = this.springRegistry[springId] as Spring;

    if (this.activeSprings.indexOf(spring) === -1) {
      this.activeSprings.push(spring);
    }

    if (this.getIsIdle()) {
      this.isIdle = false;
      this.looper.run();
    }
  }

  /**
   * Add a listener to the SpringSystem to receive before/after
   * integration notifications allowing Springs to be constrained
   * or adjusted.
   *
   * @param listener The listener to add
   */
  addListener(listener: SpringSystemListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a previously added listener on the SpringSystem.
   *
   * @param listener The listener to remove
   */
  removeListener(listener: SpringSystemListener): void {
    removeFirst(this.listeners, listener);
  }

  /** Remove all previously added listeners on the SpringSystem. */
  removeAllListeners(): void {
    this.listeners = [];
  }
}

/**
 * Provides a model of a classical spring acting to
 * resolve a body to equilibrium. Springs have configurable
 * tension which is a force multipler on the displacement of the
 * spring from its rest point or `endValue` as defined by [Hooke's
 * Law](http://en.wikipedia.org/wiki/Hooke's_law). Springs also have
 * configurable friction, which ensures that they do not oscillate
 * infinitely. When a Spring is displaced by updating it's resting
 * or `currentValue`, the SpringSystems that contain that Spring
 * will automatically start looping to solve for equilibrium. As each
 * timestep passes, `SpringListener` objects attached to the Spring
 * will be notified of the updates providing a way to drive an
 * animation off of the spring's resolution curve.
 *
 * **Methods**
 * - `destroy` - Remove a Spring from simulation and clear its listeners
 * - `getId` - Get the id of the spring
 * - `setSpringConfig` - Set the configuration values for this Spring
 * - `getSpringConfig` - Retrieve the SpringConfig used by this Spring
 * - `setCurrentValue` - Set the current position of this Spring
 * - `getStartValue` - Retrieve the start value of the Spring
 * - `getCurrentValue` - Retrieve the current value of the Spring
 * - `getCurrentDisplacementDistance` - Get the absolute distance of the Spring from its resting endValue position
 * - `getDisplacementDistanceForState` - Get the absolute distance of the Spring from a given state value
 * - `setEndValue` - Set the endValue or resting position of the spring
 * - `getEndValue` - Retrieve the endValue or resting position of this spring
 * - `setVelocity` - Set the current velocity of the Spring
 * - `getVelocity` - Get the current velocity of the Spring
 * - `setRestSpeedThreshold` - Set a threshold value for the movement speed of the Spring
 * - `getRestSpeedThreshold` - Retrieve the rest speed threshold for this Spring
 * - `setRestDisplacementThreshold` - Set a threshold value for displacement below which the Spring will be considered to be not displaced
 * - `getRestDisplacementThreshold` - Retrieve the rest displacement threshold for this spring
 * - `setOvershootClampingEnabled` - Enable overshoot clamping
 * - `isOvershootClampingEnabled` - Check if overshoot clamping is enabled for this spring
 * - `isOvershooting` - Check if the Spring has gone past its end point
 * - `advance` - The main solver method for the Spring
 * - `notifyPositionUpdated` - Notify all listeners of the position changes for this Spring
 * - `systemShouldAdvance` - Check if the SpringSystem should advance
 * - `wasAtRest` - Check if the Spring was at rest in the prior iteration
 * - `isAtRest` - Check if the Spring is at rest
 * - `setAtRest` - Force the spring to be at rest at its current position
 * - `getListeners` - Retrieve the listeners for the Spring
 * - `addListener` - Add a listener to the Spring
 * - `removeListener` - Remove a previously added listener on the Spring
 * - `removeAllListeners` - Remove all listeners from the Spring
 * - `currentValueIsApproximately` - Check if the current value of the spring is approximately equal to a given value
 *
 * **Static Properties**
 * - `ID_COUNTER` - Helper for iterating spring IDs
 * - `MAX_DELTA_TIME_SEC` - Max delta time allowed when advancing a spring
 * - `SOLVER_TIMESTEP_SEC` - The timestep value when advancing a spring
 *
 * **Properties**
 * - `listeners` - The listeners attached to the current Spring
 */
export class Spring {
  /**
   * Helper for iterating spring IDs.
   */
  static ID_COUNTER: number = 0;
  /**
   * Max delta time allowed when advancing a spring.
   */
  static MAX_DELTA_TIME_SEC: number = 0.064;
  /**
   * The timestep value when advancing a spring.
   */
  static SOLVER_TIMESTEP_SEC: number = 0.001;

  /**
   * The listeners attached to the current Spring.
   */
  listeners: SpringListener[] = [];

  /**
   * The ID of the spring.
   */
  private _id: string;
  /**
   * The SpringSystem for the current Spring.
   */
  private _springSystem: SpringSystem;
  /**
   * The spring config for the current Spring.
   */
  private _springConfig: SpringConfig =
    SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
  /**
   * The current Physics State of the current Spring.
   */
  private _currentState: PhysicsState = new PhysicsState();
  /**
   * The previous Physics State of the current Spring.
   */
  private _previousState: PhysicsState = new PhysicsState();
  /**
   * The Physics State for the current Spring at the previous timestep.
   */
  private _tempState: PhysicsState = new PhysicsState();
  /**
   * The start value of the current Spring.
   */
  private _startValue: number = 0;
  /**
   * The end value of the current Spring.
   */
  private _endValue: number = 0;
  /**
   * Tracks the accumulation of time as the current Spring advances.
   */
  private _timeAccumulator: number = 0;
  /**
   * The rest speed threshold of the current Spring.
   */
  private _restSpeedThreshold: number = 0.001;
  /**
   * The current displacement of the current Spring for the rest speed threshold.
   */
  private _displacementFromRestThreshold: number = 0.001;
  /**
   * Whether overshooting is disallowed.
   */
  private _overshootClampingEnabled: boolean = false;
  /**
   * Whether the current Spring was at rest in the last iteration.
   */
  private _wasAtRest: boolean = true;

  /**
   * @constructor
   * @param springSystem The SpringSystem to which this Spring belongs
   */
  constructor(springSystem: SpringSystem) {
    this._id = `s${Spring.ID_COUNTER++}`;
    this._springSystem = springSystem;
  }

  /**
   * Remove a Spring from simulation and clear its listeners.
   */
  destroy(): void {
    this.listeners = [];
    this._springSystem.deregisterSpring(this);
  }

  /**
   * Get the id of the spring, which can be used to retrieve it from
   * the SpringSystems it participates in later.
   *
   * @returns The id of the spring
   */
  getId(): string {
    return this._id;
  }

  /**
   * Set the configuration values for this Spring. A SpringConfig
   * contains the tension and friction values used to solve for the
   * equilibrium of the Spring in the physics loop.
   *
   * @param springConfig The SpringConfig to set for this Spring
   * @returns The current Spring
   */
  setSpringConfig(springConfig: SpringConfig): this {
    this._springConfig = springConfig;
    return this;
  }

  /**
   * Retrieve the SpringConfig used by this Spring.
   *
   * @returns The SpringConfig used by this Spring
   */
  getSpringConfig(): SpringConfig {
    return this._springConfig;
  }

  /**
   * Set the current position of this Spring. Listeners will be updated
   * with this value immediately. If the rest or `endValue` is not
   * updated to match this value, then the spring will be displaced and
   * the SpringSystem will start to loop to restore the spring to the
   * `endValue`.
   *
   * A common pattern is to move a Spring around without animation by
   * calling:
   *
   * ```ts
   * spring.setCurrentValue(n).setAtRest();
   * ```
   *
   * This moves the Spring to a new position `n`, sets the endValue
   * to `n`, and removes any velocity from the `Spring`. By doing
   * this you can allow the `SpringListener` to manage the position
   * of UI elements attached to the spring even when moving without
   * animation. For example, when dragging an element you can
   * update the position of an attached view through a spring
   * by calling `spring.setCurrentValue(x)`. When
   * the gesture ends you can update the Springs
   * velocity and endValue
   * `spring.setVelocity(gestureEndVelocity).setEndValue(flingTarget)`
   * to cause it to naturally animate the UI element to the resting
   * position taking into account existing velocity. The codepaths for
   * synchronous movement and spring driven animation can
   * be unified using this technique.
   *
   * @param currentValue The new start and current value for the spring
   * @param skipSetAtRest (Optional) Whether to skip setting the spring at rest
   * @returns The current Spring
   */
  setCurrentValue(currentValue: number, skipSetAtRest?: boolean): this {
    this._startValue = currentValue;
    this._currentState.position = currentValue;

    if (!skipSetAtRest) {
      this.setAtRest();
    }

    this.notifyPositionUpdated(false, false);

    return this;
  }

  /**
   * Get the position that the most recent animation started at. This
   * can be useful for determining the number off oscillations that
   * have occurred.
   *
   * @returns The start value for the spring
   */
  getStartValue(): number {
    return this._startValue;
  }

  /**
   * Retrieve the current value of the Spring.
   *
   * @returns The current value of the spring
   */
  getCurrentValue(): number {
    return this._currentState.position;
  }

  /**
   * Get the absolute distance of the Spring from its
   * resting endValue position.
   *
   * @returns The distance of the spring from its rest position
   */
  getCurrentDisplacementDistance(): number {
    return this.getDisplacementDistanceForState(this._currentState);
  }

  /**
   * Get the absolute distance of the Spring from a
   * given state value.
   *
   * @param state The state to get the distance for
   * @returns The distance of the spring from the provided state
   */
  getDisplacementDistanceForState(state: PhysicsState): number {
    return Math.abs(this._endValue - state.position);
  }

  /**
   * Set the endValue or resting position of the spring. If this
   * value is different than the current value, the SpringSystem will
   * be notified and will begin running its solver loop to resolve
   * the Spring to equilibrium. Any listeners that are registered
   * for onSpringEndStateChange will also be notified of this update
   * immediately.
   *
   * @param endValue The new endValue or resting position of the spring
   * @returns The current Spring
   */
  setEndValue(endValue: number): this {
    if (this._endValue === endValue && this.isAtRest()) {
      return this;
    }

    this._startValue = this.getCurrentValue();
    this._endValue = endValue;
    this._springSystem.activateSpring(this.getId());

    for (let i = 0, len = this.listeners.length; i < len; i++) {
      const listener = this.listeners[i] as SpringListener;
      if (listener.onSpringEndStateChange) {
        listener.onSpringEndStateChange(this);
      }
    }

    return this;
  }

  /**
   * Retrieve the endValue or resting position of this spring.
   *
   * @returns The endValue or resting position of the spring
   */
  getEndValue(): number {
    return this._endValue;
  }

  /**
   * Set the current velocity of the Spring, in pixels per second. As
   * previously mentioned, this can be useful when you are performing
   * a direct manipulation gesture. When a UI element is released you
   * may call setVelocity on its animation Spring so that the Spring
   * continues with the same velocity as the gesture ended with. The
   * friction, tension, and displacement of the Spring will then
   * govern its motion to return to rest on a natural feeling curve.
   *
   * @param velocity The new velocity of the spring
   * @returns The current Spring
   */
  setVelocity(velocity: number): this {
    if (velocity === this._currentState.velocity) {
      return this;
    }

    this._currentState.velocity = velocity;
    this._springSystem.activateSpring(this.getId());

    return this;
  }

  /**
   * Get the current velocity of the Spring, in pixels per second.
   *
   * @returns The current velocity of the spring
   */
  getVelocity(): number {
    return this._currentState.velocity;
  }

  /**
   * Set a threshold value for the movement speed of the Spring below
   * which it will be considered to be not moving or resting.
   *
   * @param restSpeedThreshold The rest speed threshold value
   * @returns The current Spring
   */
  setRestSpeedThreshold(restSpeedThreshold: number): this {
    this._restSpeedThreshold = restSpeedThreshold;
    return this;
  }

  /**
   * Retrieve the rest speed threshold for this Spring.
   *
   * @returns The rest speed threshold value
   */
  getRestSpeedThreshold(): number {
    return this._restSpeedThreshold;
  }

  /**
   * Set a threshold value for displacement below which the Spring
   * will be considered to be not displaced i.e. at its resting
   * `endValue`.
   *
   * @param displacementFromRestThreshold The displacement threshold value
   * @returns The current Spring
   */
  setRestDisplacementThreshold(displacementFromRestThreshold: number): this {
    this._displacementFromRestThreshold = displacementFromRestThreshold;
    return this;
  }

  /**
   * Retrieve the rest displacement threshold for this spring.
   *
   * @returns The displacement threshold value
   */
  getRestDisplacementThreshold(): number {
    return this._displacementFromRestThreshold;
  }

  /**
   * Enable overshoot clamping. This means that the Spring will stop
   * immediately when it reaches its resting position regardless of
   * any existing momentum it may have. This can be useful for certain
   * types of animations that should not oscillate such as a scale
   * down to 0 or alpha fade.
   *
   * @param enabled Whether overshoot clamping is enabled
   * @returns The current Spring
   */
  setOvershootClampingEnabled(enabled: boolean): this {
    this._overshootClampingEnabled = enabled;
    return this;
  }

  /**
   * Check if overshoot clamping is enabled for this spring.
   *
   * @returns Whether overshoot clamping is enabled
   */
  isOvershootClampingEnabled(): boolean {
    return this._overshootClampingEnabled;
  }

  /**
   * Check if the Spring has gone past its end point by comparing
   * the direction it was moving in when it started to the current
   * position and end value.
   *
   * @returns Whether the spring has gone past its end point
   */
  isOvershooting(): boolean {
    const start = this._startValue;
    const end = this._endValue;

    return (
      this._springConfig.tension > 0 &&
      ((start < end && this.getCurrentValue() > end) ||
        (start > end && this.getCurrentValue() < end))
    );
  }

  /**
   * The main solver method for the Spring. It takes
   * the current time and delta since the last time step and performs
   * an RK4 integration to get the new position and velocity state
   * for the Spring based on the tension, friction, velocity, and
   * displacement of the Spring.
   *
   * @param _time The current time
   * @param realDeltaTime The time since the last time step
   */
  advance(_time: number, realDeltaTime: number): void {
    let isAtRest = this.isAtRest();

    if (isAtRest && this._wasAtRest) {
      return;
    }

    let adjustedDeltaTime = realDeltaTime;
    if (realDeltaTime > Spring.MAX_DELTA_TIME_SEC) {
      adjustedDeltaTime = Spring.MAX_DELTA_TIME_SEC;
    }

    this._timeAccumulator += adjustedDeltaTime;

    const tension = this._springConfig.tension;
    const friction = this._springConfig.friction;
    let position = this._currentState.position;
    let velocity = this._currentState.velocity;
    let tempPosition = this._tempState.position;
    let tempVelocity = this._tempState.velocity;
    let aVelocity: number;
    let aAcceleration: number;
    let bVelocity: number;
    let bAcceleration: number;
    let cVelocity: number;
    let cAcceleration: number;
    let dVelocity: number;
    let dAcceleration: number;
    let dxdt: number;
    let dvdt: number;

    while (this._timeAccumulator >= Spring.SOLVER_TIMESTEP_SEC) {
      this._timeAccumulator -= Spring.SOLVER_TIMESTEP_SEC;

      if (this._timeAccumulator < Spring.SOLVER_TIMESTEP_SEC) {
        this._previousState.position = position;
        this._previousState.velocity = velocity;
      }

      aVelocity = velocity;
      aAcceleration =
        tension * (this._endValue - tempPosition) - friction * velocity;

      tempPosition = position + aVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      tempVelocity =
        velocity + aAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;

      bVelocity = tempVelocity;
      bAcceleration =
        tension * (this._endValue - tempPosition) - friction * tempVelocity;

      tempPosition = position + bVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      tempVelocity =
        velocity + bAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;

      cVelocity = tempVelocity;
      cAcceleration =
        tension * (this._endValue - tempPosition) - friction * tempVelocity;

      tempPosition = position + cVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
      tempVelocity =
        velocity + cAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;

      dVelocity = tempVelocity;
      dAcceleration =
        tension * (this._endValue - tempPosition) - friction * tempVelocity;

      dxdt =
        (1.0 / 6.0) * (aVelocity + 2.0 * (bVelocity + cVelocity) + dVelocity);
      dvdt =
        (1.0 / 6.0) *
        (aAcceleration + 2.0 * (bAcceleration + cAcceleration) + dAcceleration);

      position += dxdt * Spring.SOLVER_TIMESTEP_SEC;
      velocity += dvdt * Spring.SOLVER_TIMESTEP_SEC;
    }

    this._tempState.position = tempPosition;
    this._tempState.velocity = tempVelocity;

    this._currentState.position = position;
    this._currentState.velocity = velocity;

    if (this._timeAccumulator > 0) {
      this.interpolate(this._timeAccumulator / Spring.SOLVER_TIMESTEP_SEC);
    }

    if (
      this.isAtRest() ||
      (this._overshootClampingEnabled && this.isOvershooting())
    ) {
      if (this._springConfig.tension > 0) {
        this._startValue = this._endValue;
        this._currentState.position = this._endValue;
      } else {
        this._endValue = this._currentState.position;
        this._startValue = this._endValue;
      }

      this.setVelocity(0);
      isAtRest = true;
    }

    let notifyActivate = false;

    if (this._wasAtRest) {
      this._wasAtRest = false;
      notifyActivate = true;
    }

    let notifyAtRest = false;

    if (isAtRest) {
      this._wasAtRest = true;
      notifyAtRest = true;
    }

    this.notifyPositionUpdated(notifyActivate, notifyAtRest);
  }

  /**
   * Notify all listeners of the position changes for this Spring.
   *
   * @param notifyActivate Whether to notify listeners of activation
   * @param notifyAtRest Whether to notify listeners of resting
   */
  notifyPositionUpdated(notifyActivate: boolean, notifyAtRest: boolean): void {
    for (let i = 0, len = this.listeners.length; i < len; i++) {
      const listener = this.listeners[i] as SpringListener;

      if (notifyActivate && listener.onSpringActivate) {
        listener.onSpringActivate(this);
      }

      if (listener.onSpringUpdate) {
        listener.onSpringUpdate(this);
      }

      if (notifyAtRest && listener.onSpringAtRest) {
        listener.onSpringAtRest(this);
      }
    }
  }

  /**
   * Check if the SpringSystem should advance. Springs are advanced
   * a final frame after they reach equilibrium to ensure that the
   * currentValue is exactly the requested endValue regardless of the
   * displacement threshold.
   *
   * @returns Whether the SpringSystem should advance
   */
  systemShouldAdvance(): boolean {
    return !this.isAtRest() || !this.wasAtRest();
  }

  /**
   * Check if the Spring was at rest in the prior iteration.
   *
   * @returns Whether the spring was at rest
   */
  wasAtRest(): boolean {
    return this._wasAtRest;
  }

  /**
   * Check if the Spring is atRest meaning that it's currentValue and
   * endValue are the same and that it has no velocity. The previously
   * described thresholds for speed and displacement define the bounds
   * of this equivalence check. If the Spring has 0 tension, then it will
   * be considered at rest whenever its absolute velocity drops below the
   * restSpeedThreshold.
   *
   * @returns Whether the spring is at rest
   */
  isAtRest(): boolean {
    return (
      Math.abs(this._currentState.velocity) < this._restSpeedThreshold &&
      (this.getDisplacementDistanceForState(this._currentState) <=
        this._displacementFromRestThreshold ||
        this._springConfig.tension === 0)
    );
  }

  /**
   * Force the spring to be at rest at its current position. As
   * described in the documentation for setCurrentValue, this method
   * makes it easy to do synchronous non-animated updates to ui
   * elements that are attached to springs via SpringListeners.
   *
   * @returns The current Spring
   */
  setAtRest(): this {
    this._endValue = this._currentState.position;
    this._tempState.position = this._currentState.position;
    this._currentState.velocity = 0;
    return this;
  }

  /**
   * Retrieve the listeners for the Spring.
   *
   * @returns The current Spring listeners
   */
  getListeners(): SpringListener[] {
    return this.listeners;
  }

  /**
   * Add a listener to the Spring. This listener will be notified of
   * position updates for the Spring.
   *
   * @param listener The listener to add
   * @returns The current Spring
   */
  addListener(listener: SpringListener): this {
    this.listeners.push(listener);
    return this;
  }

  /**
   * Remove a previously added listener on the Spring.
   *
   * @param listener The listener to remove
   * @returns The current Spring
   */
  removeListener(listener: SpringListener): this {
    removeFirst(this.listeners, listener);
    return this;
  }

  /**
   * Remove all previously added listeners on the Spring.
   *
   * @returns The current Spring
   */
  removeAllListeners(): this {
    this.listeners = [];
    return this;
  }

  /**
   * Check if the currentValue is approximately equal to
   * the provided value. The comparison checks if the absolute
   * distance of the two values is within the provided threshold.
   *
   * @param value The value to compare the currentValue to
   * @returns Whether the currentValue is approximately equal to the provided value
   */
  currentValueIsApproximately(value: number): boolean {
    return (
      Math.abs(this.getCurrentValue() - value) <=
      this.getRestDisplacementThreshold()
    );
  }

  /**
   * Interpolate the value of the spring to the
   * provided value taking into account the previously applied
   * tension and friction.
   *
   * @param alpha The alpha value to interpolate by
   */
  private interpolate(alpha: number): void {
    this._currentState.position =
      this._currentState.position * alpha +
      this._previousState.position * (1 - alpha);
    this._currentState.velocity =
      this._currentState.velocity * alpha +
      this._previousState.velocity * (1 - alpha);
  }
}

/**
 * A wrapper class for the `{@link Spring}` class that allows for
 * creating multiple springs at once.
 *
 * **Methods**
 * - `destroy` - Destroys all the springs
 * - `getCurrentValue` - Gets the current value of all the springs
 * - `setCurrentValue` - Sets the current value of all the springs
 * - `getEndValue` - Gets the end value of all the springs
 * - `setEndValue` - Sets the end value of all the springs
 * - `getVelocity` - Gets the velocity of all the springs
 * - `setAtRest` - Sets all the springs at rest
 * - `setVelocity` - Sets the velocity of all the springs
 * - `setRestSpeedThreshold` - Sets the rest speed threshold of all the springs
 * - `setRestDisplacementThreshold` - Sets the rest displacement threshold of all the springs
 * - `setOvershootClampingEnabled` - Sets the overshoot clamping enabled of all the springs
 * - `addListener` - Adds a listener to all the springs
 * - `removeListener` - Removes a listener from all the springs
 * - `removeAllListeners` - Removes all listeners from all the springs
 */
export class MultiSpring<Numbers extends number[]> {
  /**
   * The spring system to use.
   */
  private springSystem: SpringSystem;
  /**
   * The spring config to use.
   */
  private springConfig: SpringConfig;
  /**
   * The springs.
   */
  private springs: SpringsForNumbers<Numbers> =
    [] as SpringsForNumbers<Numbers>;

  /**
   * @constructor
   * @param springSystem The spring system to use.
   * @param springConfig The spring config to use.
   */
  constructor(springSystem: SpringSystem, springConfig: SpringConfig) {
    this.springSystem = springSystem;
    this.springConfig = springConfig;
  }

  /**
   * Remove all Springs from simulation and clear their listeners.
   */
  destroy(): void {
    for (const spring of this.springs) {
      spring?.destroy();
    }
  }

  /**
   * Retrieve the current value of the Springs.
   *
   * @returns The current value of the springs.
   */
  getCurrentValue(): Numbers {
    return this.springs
      .filter(s => !!s)
      .map(s => s?.getCurrentValue()) as Numbers;
  }

  /**
   * Set the current position of the Springs. Listeners will be updated
   * with this value immediately. If the rest or `endValue` is not
   * updated to match this value, then the springs will be displaced and
   * the SpringSystem will start to loop to restore the springs to the
   * `endValue`.
   *
   * @param currentValue The new start and current value for the springs
   * @param skipSetAtRest (Optional) Whether to skip setting the springs at rest
   */
  setCurrentValue(currentValue: Numbers, skipSetAtRest?: boolean): void {
    for (let i = 0; i < currentValue.length; i++) {
      if (!this.springs[i]) {
        this.springs[i] = this.springSystem.createSpring();
      }
      this.springs[i]?.setCurrentValue(
        currentValue[i] as number,
        skipSetAtRest
      );
    }
  }

  /**
   * Retrieve the endValue or resting position of the springs.
   *
   * @returns The endValue or resting position of the springs
   */
  getEndValue(): Numbers {
    return this.springs.filter(s => !!s).map(s => s?.getEndValue()) as Numbers;
  }

  /**
   * Set the endValue or resting position of the springs. If this
   * value is different than the current value, the SpringSystem will
   * be notified and will begin running its solver loop to resolve
   * the Springs to equilibrium. Any listeners that are registered
   * for onSpringEndStateChange will also be notified of this update
   * immediately.
   *
   * @param endValue The new endValue or resting position of the spring
   */
  setEndValue(endValue: Numbers): void {
    for (let i = 0; i < endValue.length; i++) {
      if (!this.springs[i]) {
        this.springs[i] = this.springSystem.createSpringWithConfig(
          this.springConfig
        );
      }
      this.springs[i]?.setEndValue(endValue[i] as number);
    }
  }

  /**
   * Get the current velocity of the springs, in pixels per second.
   *
   * @returns The current velocity of the springs
   */
  getVelocity(): Numbers {
    return this.springs.filter(s => !!s).map(s => s?.getVelocity()) as Numbers;
  }

  /**
   * Force the springs to be at rest at their current position. As
   * described in the documentation for setCurrentValue, this method
   * makes it easy to do synchronous non-animated updates to ui
   * elements that are attached to springs via SpringListeners.
   */
  setAtRest(): void {
    for (const spring of this.springs) {
      spring?.setAtRest();
    }
  }

  /**
   * Set the current velocity of the springs, in pixels per second. As
   * previously mentioned, this can be useful when you are performing
   * a direct manipulation gesture. When a UI element is released you
   * may call setVelocity on its animation Spring so that the Spring
   * continues with the same velocity as the gesture ended with. The
   * friction, tension, and displacement of the Spring will then
   * govern its motion to return to rest on a natural feeling curve.
   *
   * @param velocity The new velocity of the springs
   */
  setVelocity(velocity: number): void {
    for (const spring of this.springs) {
      spring?.setVelocity(velocity);
    }
  }

  /**
   * Set a threshold value for the movement speed of the Spring below
   * which it will be considered to be not moving or resting.
   *
   * @param restSpeedThreshold The rest speed threshold value
   * @returns The current Spring
   */
  setRestSpeedThreshold(restSpeedThreshold: number): void {
    for (const spring of this.springs) {
      spring?.setRestSpeedThreshold(restSpeedThreshold);
    }
  }

  /**
   * Set a threshold value for displacement below which the springs
   * will be considered to be not displaced i.e. at its resting
   * `endValue`.
   *
   * @param displacementFromRestThreshold The displacement threshold value
   */
  setRestDisplacementThreshold(displacementFromRestThreshold: number): void {
    for (const spring of this.springs) {
      spring?.setRestDisplacementThreshold(displacementFromRestThreshold);
    }
  }

  /**
   * Enable overshoot clamping. This means that the springs will stop
   * immediately when they reach their resting position regardless of
   * any existing momentum they may have. This can be useful for certain
   * types of animations that should not oscillate such as a scale
   * down to 0 or alpha fade.
   *
   * @param enabled Whether overshoot clamping is enabled
   */
  setOvershootClampingEnabled(enabled: boolean): void {
    for (const spring of this.springs) {
      spring?.setOvershootClampingEnabled(enabled);
    }
  }

  /**
   * Add a listener to the springs. This listener will be notified of
   * position updates for the springs.
   *
   * @param listener The listener to add
   */
  addListener(listener: SpringListener): void {
    for (const spring of this.springs) {
      spring?.addListener(listener);
    }
  }

  /**
   * Remove a previously added listener on the springs.
   *
   * @param listener The listener to remove
   */
  removeListener(listener: SpringListener): void {
    for (const spring of this.springs) {
      spring?.removeListener(listener);
    }
  }

  /**
   * Remove all previously added listeners on the springs.
   */
  removeAllListeners(): void {
    for (const spring of this.springs) {
      spring?.removeAllListeners();
    }
  }
}
