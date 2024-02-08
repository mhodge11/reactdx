import type {
  HarmonicIntervalBucket,
  HarmonicIntervalData,
  HarmonicIntervalReference,
} from "../types/logic.ts";

/**
 * The data store for the harmonic interval to keep track of all the intervals.
 */
const data: HarmonicIntervalData = {
  buckets: {},
  counter: 0,
};

/**
 * Clears a harmonic interval.
 *
 * @param intervalReference The interval reference to clear
 */
export const clearHarmonicInterval = (
  intervalReference: HarmonicIntervalReference
): void => {
  const { bucket, id } = intervalReference;
  const { [id]: _, ...listeners } = bucket.listeners;

  bucket.listeners = listeners;

  if (Object.keys(listeners).length === 0) {
    clearInterval(bucket.interval);

    const { [bucket.ms]: __, ...rest } = data.buckets;
    data.buckets = rest;
  }
};

/**
 * Sets a harmonic interval.
 *
 * @param fn The function to call
 * @param ms The millisecond delay for the interval
 * @returns The interval reference
 */
export const setHarmonicInterval = (
  fn: () => void,
  ms: number
): HarmonicIntervalReference => {
  const id = data.counter++;

  if (data.buckets[ms]) {
    (data.buckets[ms] as HarmonicIntervalBucket).listeners[id] = fn;
  } else {
    const interval = setInterval(() => {
      const { listeners } = data.buckets[ms] as HarmonicIntervalBucket;
      let didThrow = false;
      let lastError: any;

      for (const listener of Object.values(listeners)) {
        try {
          listener();
        } catch (error) {
          didThrow = true;
          lastError = error;
        }
      }

      if (didThrow) {
        throw lastError;
      }
    }, ms);

    data.buckets[ms] = {
      ms,
      interval,
      listeners: {
        [id]: fn,
      },
    };
  }

  return {
    bucket: data.buckets[ms] as HarmonicIntervalBucket,
    id,
  };
};
