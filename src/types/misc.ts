/**
 * Type alias for the return value of the {@link ensuredForwardRef} wrapper.
 */
export type EnsuredForwardRefReturn<
  TRef,
  TProps extends {} = {},
> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TProps> & React.RefAttributes<TRef>
>;
