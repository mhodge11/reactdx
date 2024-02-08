import { createHTMLMediaHook } from "../factories/createHTMLMediaHook.ts";

/**
 * React hook that creates an `<audio>` element,
 * tracks its state and exposes playback controls.
 *
 * **Explanation**
 *
 * `audio` - React's `<audio>` element that you have to
 * insert somewhere in your render tree, for example:
 *
 * ```tsx
 * <div>{audio}</div>
 * ```
 *
 * `state` - tracks the state of the audio and has the following shape:
 *
 * ```ts
 * {
 *   "buffered": [
 *     {
 *       "start": 0,
 *       "end": 425.952625
 *     }
 *   ],
 *   "time": 5.244996,
 *   "duration": 425.952625,
 *   "paused": false,
 *   "muted": false,
 *   "volume": 1,
 *   "playing": true
 * }
 * ```
 *
 * `playing` - The audio is being played and is affected by the network.
 * If it starts to buffer audio, it will be false.
 *
 * `controls` - A collection of methods that allow you to control
 * the playback of the audio, it has the following interface:
 *
 * ```ts
 * interface AudioControls {
 *   play: () => Promise<void> | void;
 *   pause: () => void;
 *   mute: () => void;
 *   unmute: () => void;
 *   volume: (volume: number) => void;
 *   seek: (time: number) => void;
 * }
 * ```
 *
 * `ref` - A React reference to HTML `<audio>` element,
 * you can access the element by `ref.current`, note that it may be `null`.
 *
 * `props` - All props that the `<audio>` element accepts.
 *
 * @example
 * ```tsx
 * const [audio, state, controls, ref] = useAudio({
 *   src: "https://example.com/audio.mp3",
 *   autoPlay: true,
 * });
 *
 * return (
 *   <div>
 *     {audio}
 *     <pre>{JSON.stringify(state, null, 2)}</pre>
 *     <button onClick={controls.play}>
 *       Play
 *     </button>
 *     <button onClick={controls.pause}>
 *       Pause
 *     </button>
 *     <button onClick={() => controls.volume(0.1)}>
 *       Volume Down
 *     </button>
 *     <button onClick={() => controls.volume(1)}>
 *       Volume Up
 *     </button>
 *     <button
 *       onClick={() => controls.seek(state.time - 5)}
 *     >
 *       Seek -5 sec
 *     </button>
 *     <button
 *       onClick={() => controls.seek(state.time + 5)}
 *     >
 *       Seek +5 sec
 *     </button>
 *     <button onClick={controls.mute}>
 *       Mute
 *     </button>
 *     <button onClick={controls.unmute}>
 *       Unmute
 *     </button>
 *     <button onClick={() => controls.seek(0)}>
 *       Restart
 *     </button>
 *     <button
 *       onClick={() => controls.seek(state.duration)}
 *     >
 *       Skip
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @param elOrProps Either a React ref to an `<audio>` element or props to create one
 * @returns A tuple containing the `<audio>` element, its state, its controls, and its ref
 *
 * @category UI
 * @since 0.0.1
 */
export const useAudio = createHTMLMediaHook<HTMLAudioElement>("audio");
