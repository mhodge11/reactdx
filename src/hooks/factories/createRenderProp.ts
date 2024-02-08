import type {
  CreateRenderPropReturn,
  MapPropsToHookArgs,
  PropsWithRenderProps,
} from "../../types/factories.ts";
import type { GenericFunction } from "../../types/utils.ts";
import { isFunction } from "../../utils/isFunction.ts";

/**
 * Default function to map props to arguments.
 *
 * @param props Props to map to arguments
 * @returns The arguments to pass to the hook
 */
const defaultMapPropsToArgs = <
  THook extends GenericFunction<THook>,
  TProps extends {},
>(
  props: TProps
) => [props] as Parameters<THook>;

/**
 * Factory for creating a render prop component.
 * The factory accepts a hook and a function to map props to arguments
 * and returns a render prop component.
 *
 * The render prop component accepts either a render prop or children
 * and returns the result of the render prop or `null`
 * if no render prop was passed.
 *
 * @example
 * ```tsx
 * const useCounter = (initialCount = 0) => {
 *   const [count, setCount] = useState(initialCount);
 *   const increment = () => setCount((c) => c + 1);
 *   return { count, increment };
 * };
 *
 * const Counter = createRenderProp(useCounter, (props) => [props.initialCount]);
 *
 * const App = () => {
 *   return (
 *     <Counter initialCount={10}>
 *       {({ count, increment }) => (
 *         <div>
 *           <p>Count: {count}</p>
 *           <button onClick={increment}>Increment</button>
 *         </div>
 *       )}
 *     </Counter>
 *   );
 * }
 * ```
 *
 * @param hook The hook to create a render prop for
 * @param mapPropsToArgs The function to map props to arguments
 * @returns A render prop component or `null` if no render prop was passed
 *
 * @category Factory
 * @since 0.0.1
 */
export const createRenderProp = <
  THook extends GenericFunction<THook>,
  TProps extends {} = {},
>(
  hook: THook,
  mapPropsToArgs: MapPropsToHookArgs<THook, TProps> = defaultMapPropsToArgs
): CreateRenderPropReturn<TProps> => {
  return function RenderPropComponent(
    props: PropsWithRenderProps<TProps>
  ): React.ReactNode {
    const args = mapPropsToArgs(props);
    const state = hook(...args);
    const { children, render = children } = props;
    if (isFunction(render)) {
      return render(state) ?? null;
    }
    return null;
  };
};
