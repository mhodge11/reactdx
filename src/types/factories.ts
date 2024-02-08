import type { HookStateSetAction } from "./logic.ts";
import type { GenericFunction } from "./utils.ts";

export interface GlobalStore<TState> {
  state: TState;
  setState: (nextState: HookStateSetAction<TState>) => void;
  setters: ((state: TState) => void)[];
}

export type UseGlobalStateReturn<TState> = [
  state: TState | undefined,
  setState: (nextState: HookStateSetAction<TState>) => void,
];

export type ReducerDispatch<TAction> = (action: TAction) => void;

export interface ReducerStore<TAction, TState> {
  getState: () => TState;
  dispatch: ReducerDispatch<TAction>;
}

export type ReducerMiddleware<TAction, TState> = (
  store: ReducerStore<TAction, TState>
) => (next: ReducerDispatch<TAction>) => (action: TAction) => void;

export type UseReducerReturn<TAction, TState> = [
  state: TState,
  dispatch: ReducerDispatch<TAction>,
];

export type CreateReducerReturn<TAction, TState> = (
  reducer: (state: TState, action: TAction) => TState,
  initialState: TState,
  initializer?: (state: TState) => TState
) => UseReducerReturn<TAction, TState>;

export type ReducerContext<TReducer extends React.Reducer<any, any>> = [
  React.ReducerState<TReducer>,
  React.Dispatch<React.ReducerAction<TReducer>>,
];

export interface ReducerContextProviderFactoryProps<
  TReducer extends React.Reducer<any, any>,
> {
  value: ReducerContext<TReducer>;
}

export interface ReducerContextProviderProps<
  TReducer extends React.Reducer<any, any>,
> {
  children?: React.ReactNode;
  initialState?: React.ReducerState<TReducer>;
}

export type ReducerContextProvider<TReducer extends React.Reducer<any, any>> =
  React.FunctionComponentElement<
    React.ProviderProps<ReducerContext<TReducer> | undefined>
  >;

export type CreateReducerContextReturn<
  TReducer extends React.Reducer<any, any>,
> = [
  useContext: () => ReducerContext<TReducer>,
  Provider: (
    props: ReducerContextProviderProps<TReducer>
  ) => ReducerContextProvider<TReducer>,
  context: React.Context<ReducerContext<TReducer> | undefined>,
];

export type RenderProp = React.ReactNode | ((...args: any) => React.ReactNode);

export interface RenderProps {
  /**
   * The children prop of the render prop component.
   */
  children?: RenderProp;
  /**
   * The render prop of the render prop component.
   */
  render?: RenderProp;
}

export type PropsWithRenderProps<TProps extends {}> = TProps & RenderProps;

export type MapPropsToHookArgs<
  THook extends GenericFunction<THook>,
  TProps extends {},
> = (props: TProps) => Parameters<THook>;

export type CreateRenderPropReturn<TProps extends {}> = (
  props: TProps
) => React.ReactNode;

export type StateContext<TState> = [
  TState,
  React.Dispatch<React.SetStateAction<TState>>,
];

export interface StateContextProviderFactoryProps<TState> {
  value: StateContext<TState>;
}

export interface StateContextProviderProps<TState> {
  children?: React.ReactNode;
  initialState?: TState;
}

export type StateContextProvider<TState> = React.FunctionComponentElement<
  React.ProviderProps<StateContext<TState> | undefined>
>;

export type CreateStateContextReturn<TState> = [
  useContext: () => StateContext<TState>,
  Provider: (
    props: StateContextProviderProps<TState>
  ) => StateContextProvider<TState>,
  context: React.Context<StateContext<TState> | undefined>,
];

export interface HTMLMediaProps
  extends React.AudioHTMLAttributes<any>,
    React.VideoHTMLAttributes<any> {
  src: string;
}

export interface HTMLMediaBufferElement {
  start: number;
  end: number;
}

export interface HTMLMediaState {
  buffered: HTMLMediaBufferElement[];
  playing: boolean;
  paused: boolean;
  muted: boolean;
  duration: number;
  time: number;
  volume: number;
}

export interface HTMLMediaControls {
  play: () => Promise<void> | void;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
  volume: (volume: number) => void;
  seek: (time: number) => void;
}

export type HTMLMediaPropsWithRef<
  TElement extends HTMLAudioElement | HTMLVideoElement,
> = HTMLMediaProps & {
  ref?: React.RefObject<TElement | null>;
};

export type CreateHTMLMediaHookReturn<
  TElement extends HTMLAudioElement | HTMLVideoElement,
> = [
  element: React.ReactElement<
    HTMLMediaPropsWithRef<TElement>,
    string | React.JSXElementConstructor<any>
  >,
  state: HTMLMediaState,
  controls: HTMLMediaControls,
  ref: React.RefObject<TElement | null>,
];
