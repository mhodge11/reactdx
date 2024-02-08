import { forwardRef, useEffect, useRef } from "react";

import type { EnsuredForwardRefReturn } from "../../types/misc.ts";
import { isFunction } from "../../utils/isFunction.ts";

/**
 * React hook to use a ForwardedRef safely.
 *
 * In some scenarios, you may need to use a ref
 * from inside and outside a component. If that's
 * the case, you should use `React.forwardRef` to pass
 * it through the child component. This is useful
 * when you only want to forward that ref and expose an
 * internal `HTMLElement` to a parent component, for example.
 * However, if you need to manipulate that reference
 * inside a child's lifecycle hook... things get complicated,
 * since you can't always ensure that the ref is being sent by
 * the parent component and if it is not, you will get
 * `undefined` instead of a valid ref. This hook is useful in
 * this specific case, it will ensure that you get a
 * valid reference on the other side.
 *
 * @example
 * ```tsx
 * const Parent = () => {
 *   return <Child />
 * }
 *
 * const Child = React.forwardRef((props, ref) => {
 *   // Here `ref` is undefined
 *   const ensuredForwardRef = useEnsuredForwardedRef(ref);
 *   // ensuredForwardRef will always be a valid reference.
 *
 *   useEffect(() => {
 *     console.log(
 *       ensuredForwardRef.current.getBoundingClientRect()
 *     )
 *   }, [])
 *
 *   return (
 *     <div ref={ensuredForwardRef} />
 *   );
 * });
 * ```
 *
 * @param forwardedRef The forwarded ref
 * @returns The ensured ref
 *
 * @category Misc
 * @since 0.0.1
 */
export const useEnsuredForwardedRef = <TRef>(
  forwardedRef: React.MutableRefObject<TRef | null> | null
): React.RefObject<TRef> => {
  const ensuredRef = useRef(forwardedRef?.current ?? null);

  useEffect(() => {
    if (!forwardedRef) {
      return;
    }
    forwardedRef.current = ensuredRef.current;
  }, [forwardedRef]);

  return ensuredRef;
};

/**
 * React component wrapper to use a ForwardedRef safely.
 *
 * In some scenarios, you may need to use a ref
 * from inside and outside a component. If that's
 * the case, you should use `React.forwardRef` to pass
 * it through the child component. This is useful
 * when you only want to forward that ref and expose an
 * internal `HTMLElement` to a parent component, for example.
 * However, if you need to manipulate that reference
 * inside a child's lifecycle hook... things get complicated,
 * since you can't always ensure that the ref is being sent by
 * the parent component and if it is not, you will get
 * `undefined` instead of a valid ref. This hook is useful in
 * this specific case, it will ensure that you get a
 * valid reference on the other side.
 *
 * @example
 * ```tsx
 * const Parent = () => {
 *   return <Child />
 * }
 *
 * const Child = ensuredForwardRef((props, ref) => {
 *   useEffect(() => {
 *     console.log(ref.current.getBoundingClientRect())
 *   }, [])
 *
 *   return (
 *     <div ref={ref} />
 *   );
 * });
 * ```
 *
 * @param Component The component to forward the ref to
 * @returns The component with the ensured ref
 *
 * @category Misc
 * @since 0.0.1
 */
export const ensuredForwardRef = <TRef, TProps extends {} = {}>(
  Component: React.ForwardRefRenderFunction<TRef, TProps>
): EnsuredForwardRefReturn<TRef, TProps> =>
  forwardRef(function EnsuredForwardRefComponent(
    props: React.PropsWithChildren<TProps>,
    ref
  ) {
    const refValue = isFunction(ref)
      ? (ref.arguments[0] as React.MutableRefObject<TRef | null> | null)
      : ref;
    const ensuredRef = useEnsuredForwardedRef(refValue);
    return Component(props, ensuredRef);
  });
