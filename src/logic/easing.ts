import type { Easing } from "../types/logic.ts";

export const easing: Easing = {
  linear: t => t,

  quadratic: t => t * (-(t * t) * t + 4 * t * t - 6 * t + 4),

  cubic: t => t * (4 * t * t - 9 * t + 6),

  elastic: t =>
    t * (33 * t * t * t * t - 106 * t * t * t + 126 * t * t - 67 * t + 15),

  inQuad: t => t * t,

  outQuad: t => t * (2 - t),

  inOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  inCubic: t => t * t * t,

  outCubic: t => --t * t * t + 1,

  inOutCubic: t =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  inQuart: t => t * t * t * t,

  outQuart: t => 1 - --t * t * t * t,

  inOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),

  inQuint: t => t * t * t * t * t,

  outQuint: t => 1 + --t * t * t * t * t,

  inOutQuint: t =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,

  inSine: t => -Math.cos(t * (Math.PI / 2)) + 1,

  outSine: t => Math.sin(t * (Math.PI / 2)),

  inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

  inExpo: t => 2 ** (10 * (t - 1)),

  outExpo: t => -(2 ** (-10 * t)) + 1,

  inOutExpo: t => {
    t /= 0.5;

    if (t < 1) {
      return 2 ** (10 * (t - 1)) / 2;
    }

    t--;

    return (-(2 ** (-10 * t)) + 2) / 2;
  },

  inCirc: t => -Math.sqrt(1 - t * t) + 1,

  outCirc: t => Math.sqrt(1 - (t -= 1) * t),

  inOutCirc: t => {
    t /= 0.5;

    if (t < 1) {
      return -(Math.sqrt(1 - t * t) - 1) / 2;
    }

    t -= 2;

    return (Math.sqrt(1 - t * t) + 1) / 2;
  },
};
