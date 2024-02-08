/**
 * Enum of the different speech statuses, used by the {@link useSpeech} hook.
 */
export enum SpeechStatus {
  /**
   * The speech has not started yet.
   */
  init = "init",
  /**
   * The speech is currently playing.
   */
  playing = "playing",
  /**
   * The speech is currently paused.
   */
  paused = "paused",
  /**
   * The speech has ended.
   */
  ended = "ended",
}
