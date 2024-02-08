import { useEffectOnce } from "./useEffectOnce.ts";
import { useUpdateEffect } from "./useUpdateEffect.ts";

/**
 * React lifecycle hook that console logs parameters
 * as component transitions through lifecycles.
 *
 * @example
 * ```tsx
 * useLogger("MyComponent", props, state);
 * ```
 *
 * @param componentName The name of the component
 * @param props Any other parameters to log
 *
 * @category Lifecycle
 * @since 0.0.1
 */
export const useLogger = (componentName: string, ...props: unknown[]): void => {
  useEffectOnce(() => {
    // eslint-disable-next-line no-console
    console.log(`${componentName} mounted`, ...props);

    return () => {
      // eslint-disable-next-line no-console
      console.log(`${componentName} unmounted`);
    };
  });

  useUpdateEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`${componentName} updated`, ...props);
  });
};
