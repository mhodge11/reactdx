import {
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useRef,
} from "react";

import type {
  CreateHTMLMediaHookReturn,
  HTMLMediaBufferElement,
  HTMLMediaControls,
  HTMLMediaProps,
  HTMLMediaPropsWithRef,
  HTMLMediaState,
} from "../../types/factories.ts";
import { isNullOrUndefined } from "../../utils/isNullOrUndefined.ts";
import { isObjectType } from "../../utils/isObject.ts";
import { runOnlyIfDevMode } from "../../utils/runOnlyIfDevMode.ts";
import { warn } from "../../utils/warn.ts";
import { useSetState } from "../states/useSetState.ts";

/**
 * Parses a `TimeRanges` object into an array of objects
 * containing the start and end times of each range.
 *
 * @param ranges The `TimeRanges` object to parse
 * @returns An array of objects containing the start and end times of each range
 */
const parseTimeRanges = (ranges: TimeRanges): HTMLMediaBufferElement[] => {
  const result: HTMLMediaBufferElement[] = [];

  for (let i = 0; i < ranges.length; i++) {
    result.push({
      start: ranges.start(i),
      end: ranges.end(i),
    });
  }

  return result;
};

/**
 * Factory for creating a hook for HTML video and audio elements.
 * The hook accepts either an element or props and
 * returns a tuple with the element, state, controls, and ref.
 *
 * @example
 * ```tsx
 * // Example for creating a custom audio hook
 *
 * const useAudio = createHTMLMediaHook("audio");
 *
 * const AudioPlayer = () => {
 *   const [audio, state, controls, ref] = useAudio({
 *     src: "https://example.com/audio.mp3",
 *     autoPlay: true,
 *   });
 *
 *   return (
 *     <div>
 *       {audio}
 *       <pre>{JSON.stringify(state, null, 2)}</pre>
 *       <button onClick={controls.play}>
 *         Play
 *       </button>
 *       <button onClick={controls.pause}>
 *         Pause
 *       </button>
 *       <button onClick={() => controls.volume(0.1)}>
 *         Volume Down
 *       </button>
 *       <button onClick={() => controls.volume(1)}>
 *         Volume Up
 *       </button>
 *       <button
 *         onClick={() => controls.seek(state.time - 5)}
 *       >
 *         Seek -5 sec
 *       </button>
 *       <button
 *         onClick={() => controls.seek(state.time + 5)}
 *       >
 *         Seek +5 sec
 *       </button>
 *       <button onClick={controls.mute}>
 *         Mute
 *       </button>
 *       <button onClick={controls.unmute}>
 *         Unmute
 *       </button>
 *       <button onClick={() => controls.seek(0)}>
 *         Restart
 *       </button>
 *       <button
 *         onClick={() => controls.seek(state.duration)}
 *       >
 *         Skip
 *       </button>
 *     </div>
 *   );
 * }
 *
 * // Example for creating a custom video hook
 *
 * const useVideo = createHTMLMediaHook("video");
 *
 * const VideoPlayer = () => {
 *   const [video, state, controls, ref] = useVideo({
 *     src: "https://example.com/video.mp4",
 *     autoPlay: true,
 *   });
 *
 *   return (
 *     <div>
 *       {video}
 *       <pre>{JSON.stringify(state, null, 2)}</pre>
 *       <button onClick={controls.play}>
 *         Play
 *       </button>
 *       <button onClick={controls.pause}>
 *         Pause
 *       </button>
 *       <button onClick={() => controls.volume(0.1)}>
 *         Volume Down
 *       </button>
 *       <button onClick={() => controls.volume(1)}>
 *         Volume Up
 *       </button>
 *       <button
 *         onClick={() => controls.seek(state.time - 5)}
 *       >
 *         Seek -5 sec
 *       </button>
 *       <button
 *         onClick={() => controls.seek(state.time + 5)}
 *       >
 *         Seek +5 sec
 *       </button>
 *       <button onClick={controls.mute}>
 *         Mute
 *       </button>
 *       <button onClick={controls.unmute}>
 *         Unmute
 *       </button>
 *       <button onClick={() => controls.seek(0)}>
 *         Restart
 *       </button>
 *       <button
 *         onClick={() => controls.seek(state.duration)}
 *       >
 *         Skip
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param tag The tag of the HTML element ("audio" or "video")
 * @returns A hook that returns a tuple with the element, state, controls, and ref
 *
 * @category Factory
 * @since 0.0.1
 */
export const createHTMLMediaHook =
  <TElement extends HTMLAudioElement | HTMLVideoElement>(
    tag: "audio" | "video"
  ): ((
    elOrProps:
      | React.ReactElement<HTMLMediaPropsWithRef<TElement>>
      | HTMLMediaProps
  ) => CreateHTMLMediaHookReturn<TElement>) =>
  (
    elOrProps:
      | React.ReactElement<HTMLMediaPropsWithRef<TElement>>
      | HTMLMediaProps
  ): CreateHTMLMediaHookReturn<TElement> => {
    let element:
      | React.ReactElement<HTMLMediaPropsWithRef<TElement>>
      | undefined;
    let props: HTMLMediaPropsWithRef<TElement>;

    if (isValidElement(elOrProps)) {
      element = elOrProps as React.ReactElement<
        HTMLMediaPropsWithRef<TElement>
      >;
      props = elOrProps.props as HTMLMediaPropsWithRef<TElement>;
    } else {
      props = elOrProps as HTMLMediaPropsWithRef<TElement>;
    }

    const [state, setState] = useSetState<HTMLMediaState>({
      buffered: [],
      time: 0,
      duration: 0,
      paused: true,
      muted: false,
      volume: 1,
      playing: false,
    });

    const ref = useRef<TElement>(null);

    const wrapEvent =
      (
        userEvent: React.ReactEventHandler<any> | undefined,
        proxyEvent?: () => void | undefined
      ) =>
      (event: React.SyntheticEvent<any, Event>) => {
        try {
          if (proxyEvent) {
            proxyEvent();
          }
        } finally {
          if (userEvent) {
            userEvent(event);
          }
        }
      };

    const onPlay = () => setState({ paused: false });

    const onPlaying = () => setState({ playing: true });

    const onWaiting = () => setState({ playing: false });

    const onPause = () => setState({ paused: true, playing: false });

    const onVolumeChange = () => {
      if (ref.current) {
        setState({
          muted: ref.current.muted,
          volume: ref.current.volume,
        });
      }
    };

    const onDurationChange = () => {
      if (ref.current) {
        setState({
          duration: ref.current.duration,
          buffered: parseTimeRanges(ref.current.buffered),
        });
      }
    };

    const onTimeUpdate = () => {
      if (ref.current) {
        setState({ time: ref.current.currentTime });
      }
    };

    const onProgress = () => {
      if (ref.current) {
        setState({ buffered: parseTimeRanges(ref.current.buffered) });
      }
    };

    if (element) {
      element = cloneElement(element, {
        controls: false,
        ...props,
        ref,
        onPlay: wrapEvent(props.onPlay, onPlay),
        onPlaying: wrapEvent(props.onPlaying, onPlaying),
        onWaiting: wrapEvent(props.onWaiting, onWaiting),
        onPause: wrapEvent(props.onPause, onPause),
        onVolumeChange: wrapEvent(props.onVolumeChange, onVolumeChange),
        onDurationChange: wrapEvent(props.onDurationChange, onDurationChange),
        onTimeUpdate: wrapEvent(props.onTimeUpdate, onTimeUpdate),
        onProgress: wrapEvent(props.onProgress, onProgress),
      });
    } else {
      element = createElement(tag, {
        controls: false,
        ...props,
        ref,
        onPlay: wrapEvent(props.onPlay, onPlay),
        onPlaying: wrapEvent(props.onPlaying, onPlaying),
        onWaiting: wrapEvent(props.onWaiting, onWaiting),
        onPause: wrapEvent(props.onPause, onPause),
        onVolumeChange: wrapEvent(props.onVolumeChange, onVolumeChange),
        onDurationChange: wrapEvent(props.onDurationChange, onDurationChange),
        onTimeUpdate: wrapEvent(props.onTimeUpdate, onTimeUpdate),
        onProgress: wrapEvent(props.onProgress, onProgress),
      });
    }

    // Some browsers return `Promise` on `.play()` and may throw errors
    // if one tries to execute another `.play()` or `.pause()` while that
    // promise is resolving. So we prevent that with this lock.
    // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
    let lockPlay = false;

    const controls: HTMLMediaControls = {
      play: () => {
        if (!ref.current || lockPlay) {
          return undefined;
        }

        const promise = ref.current.play();
        const isPromise = isObjectType(promise);

        if (isPromise) {
          lockPlay = true;

          const resetLock = () => {
            lockPlay = false;
          };

          promise.then(resetLock, resetLock);
        }

        return promise;
      },
      pause: () => {
        if (ref.current && !lockPlay) {
          ref.current.pause();
        }
      },
      seek: (time: number) => {
        if (ref.current && !isNullOrUndefined(state.duration)) {
          ref.current.currentTime = Math.min(state.duration, Math.max(0, time));
        }
      },
      volume: (volume: number) => {
        if (ref.current) {
          volume = Math.min(1, Math.max(0, volume));
          ref.current.volume = volume;
          setState({ volume });
        }
      },
      mute: () => {
        if (ref.current) {
          ref.current.muted = true;
        }
      },
      unmute: () => {
        if (ref.current) {
          ref.current.muted = false;
        }
      },
    };

    const _controls = useRef(controls);

    useEffect(() => {
      if (!ref.current) {
        runOnlyIfDevMode(() => {
          if (tag === "audio") {
            warn(
              "useAudio() ref to <audio> element is empty at mount. " +
                "It seem you have not rendered the audio element, which it " +
                "returns as the first argument const [audio] = useAudio(...)."
            );
          } else if (tag === "video") {
            warn(
              "useVideo() ref to <video> element is empty at mount. " +
                "It seem you have not rendered the video element, which it " +
                "returns as the first argument const [video] = useVideo(...)."
            );
          }
        });

        return;
      }

      setState({
        volume: ref.current.volume,
        muted: ref.current.muted,
        paused: ref.current.paused,
      });

      if (props.autoPlay && ref.current.paused) {
        _controls.current.play();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.src]);

    return [element, state, _controls.current, ref];
  };
