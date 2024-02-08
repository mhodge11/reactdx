import { useEffect, useState } from "react";

import { SpeechStatus } from "../../enums/uis.ts";
import type { UseSpeechOptions, UseSpeechReturn } from "../../types/uis.ts";

/**
 * React UI hook that synthesizes human voice that speaks a given string.
 *
 * @example
 * ```tsx
 * const voices = window.speechSynthesis.getVoices();
 *
 * const Component = () => {
 *   const state = useSpeech(
 *     'Hello world!',
 *     {
 *       rate: 0.8,
 *       pitch: 0.5,
 *       voice: voices[0]
 *     }
 *   );
 *
 *   return (
 *     <pre>
 *       {JSON.stringify(state, null, 2)}
 *     </pre>
 *   );
 * }
 * ```
 *
 * @param text The text to speak
 * @param options (Optional) The speech options
 * @param options.voice (Optional) The [SpeechSynthesisVoice](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice)
 * @param options.lang (Optional) The language of the speech
 * @param options.volume (Optional) The volume of the speech
 * @param options.rate (Optional) The rate of the speech
 * @param options.pitch (Optional) The pitch of the speech
 * @returns The speech state, including the current `options`, with `isPlaying`, `status`, and `voiceInfo` added
 */
export const useSpeech = (
  text: string,
  options: Partial<UseSpeechOptions> = {}
): UseSpeechReturn => {
  const [state, setState] = useState<UseSpeechReturn>(() => {
    const { lang = "default", name = "" } = options.voice ?? {};

    return {
      isPlaying: false,
      status: SpeechStatus.init,
      lang: options.lang ?? "default",
      voiceInfo: { lang, name },
      volume: options.volume ?? 1,
      rate: options.rate ?? 1,
      pitch: options.pitch ?? 1,
    };
  });

  useEffect(() => {
    let mounted = true;

    const handlePlay = () => {
      if (mounted) {
        setState(preState => ({
          ...preState,
          isPlaying: true,
          status: SpeechStatus.playing,
        }));
      }
    };

    const handlePause = () => {
      if (mounted) {
        setState(preState => ({
          ...preState,
          isPlaying: false,
          status: SpeechStatus.paused,
        }));
      }
    };

    const handleEnd = () => {
      if (mounted) {
        setState(preState => ({
          ...preState,
          isPlaying: false,
          status: SpeechStatus.ended,
        }));
      }
    };

    const utterance = new SpeechSynthesisUtterance(text);

    if (options.lang) {
      utterance.lang = options.lang;
    }
    if (options.voice) {
      utterance.voice = options.voice;
    }

    utterance.volume = options.volume ?? 1;
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;

    utterance.onstart = handlePlay;
    utterance.onresume = handlePlay;
    utterance.onpause = handlePause;
    utterance.onend = handleEnd;

    window.speechSynthesis.speak(utterance);

    return () => {
      mounted = false;
    };
  }, [
    text,
    options.lang,
    options.voice,
    options.volume,
    options.rate,
    options.pitch,
  ]);

  return state;
};
