import type { SpeechStatus } from "../enums/uis.ts";

/**
 * Type alias for the drop area state returned by the {@link useDrop} hook.
 */
export interface UseDropReturn {
  /**
   * Whether a file or URI is hovering the drop area.
   */
  isHovering: boolean;
}

/**
 * Type alias for the drop area options passed to the {@link useDrop} and {@link useDropArea} hooks.
 */
export interface UseDropOptions {
  /**
   * Callback for when files are dropped or pasted.
   *
   * @param files The dropped or pasted files
   * @param event The drop or paste event
   */
  onFiles?:
    | ((files: File[], event?: React.DragEvent | React.ClipboardEvent) => void)
    | undefined;
  /**
   * Callback for when text is dropped or pasted.
   *
   * @param text The dropped or pasted text
   * @param event The drop or paste event
   */
  onText?:
    | ((text: string, event?: React.DragEvent | React.ClipboardEvent) => void)
    | undefined;
  /**
   * Callback for when a URI is dropped or pasted.
   *
   * @param uri The dropped or pasted URI
   * @param event The drop or paste event
   */
  onUri?:
    | ((uri: string, event?: React.DragEvent | React.ClipboardEvent) => void)
    | undefined;
}

/**
 * Type alias for the drop area callbacks returned by the {@link useDropArea} hook.
 */
export interface UseDropAreaCallbacks {
  /**
   * Callback for when something is dragged over the drop area.
   */
  onDragOver: React.DragEventHandler;
  /**
   * Callback for when something is dragged into the drop area.
   */
  onDragEnter: React.DragEventHandler;
  /**
   * Callback for when something is dragged out of the drop area.
   */
  onDragLeave: React.DragEventHandler;
  /**
   * Callback for when something is dropped on the drop area.
   */
  onDrop: React.DragEventHandler;
  /**
   * Callback for when something is pasted on the drop area.
   */
  onPaste: React.ClipboardEventHandler;
}

/**
 * Type alias for the return value of the {@link useDropArea} hook.
 */
export type UseDropAreaReturn = [
  /**
   * The drop area callbacks.
   */
  callbacks: UseDropAreaCallbacks,
  /**
   * The drop area state.
   */
  state: UseDropReturn,
];

/**
 * Type alias for the fullscreen options passed to the {@link useFullscreen} hook.
 */
export interface UseFullscreenOptions {
  /**
   * The video element if fullscreening a video.
   */
  video?: React.RefObject<
    HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitExitFullscreen?: () => void;
    }
  >;
  /**
   * Callback for when the fullscreen is closed. Called with an error if closed due to an error.
   *
   * @param error The error if the fullscreen is closed due to an error
   */
  onClose?: (error?: Error) => void;
}

/**
 * Type alias for the speech options passed to the {@link useSpeech} hook.
 */
export interface UseSpeechOptions {
  /**
   * The [SpeechSynthesisVoice](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice).
   */
  voice?: SpeechSynthesisVoice;
  /**
   * The language of the speech.
   */
  lang: string;
  /**
   * The volume of the speech.
   */
  volume: number;
  /**
   * The rate of the speech.
   */
  rate: number;
  /**
   * The pitch of the speech.
   */
  pitch: number;
}

/**
 * Type alias for the voice information ("lang" | "name") from
 * [SpeechSynthesisVoice](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice),
 * used by the {@link useSpeech} hook.
 */
export type VoiceInfo = Pick<SpeechSynthesisVoice, "lang" | "name">;

/**
 * Type alias for the speech state. Extends {@link UseSpeechOptions} without `voice`.
 * Used by the {@link useSpeech} hook.
 */
export interface UseSpeechReturn extends Omit<UseSpeechOptions, "voice"> {
  /**
   * Whether the text is being spoken.
   */
  isPlaying: boolean;
  /**
   * The speech status ("init" | "playing" | "paused" | "ended").
   */
  status: SpeechStatus;
  /**
   * The voice information ("lang" | "name") from
   * [SpeechSynthesisVoice](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice).
   */
  voiceInfo: VoiceInfo;
}

/**
 * Type alias for the state of the slider returned by the {@link useSlider} hook.
 */
export interface UseSliderReturn {
  /**
   * Whether the slider is currently being scrubbed.
   */
  isSliding: boolean;
  /**
   * The current value of the slider (between 0 and 1).
   */
  value: number;
}

/**
 * Type alias for the slider options passed to the {@link useSlider} hook.
 */
export interface UseSliderOptions {
  /**
   * Callback for when the slider is scrubbed.
   *
   * @param value The value of the slider
   */
  onScrub?: ((value: number) => void) | undefined;
  /**
   * Callback for when the slider starts being scrubbed.
   */
  onScrubStart?: (() => void) | undefined;
  /**
   * Callback for when the slider stops being scrubbed.
   *
   * @param value The value of the slider
   */
  onScrubEnd?: ((value: number) => void) | undefined;
  /**
   * Whether the slider is reversed.
   */
  reverse?: boolean | undefined;
  /**
   * Whether or not to remove the default `userSelect` styles (Defaults to true).
   */
  styles?: boolean | React.CSSProperties | undefined;
  /**
   * Whether the slider is vertical.
   */
  vertical?: boolean | undefined;
}
