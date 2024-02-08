import { useRef, useState } from "react";

import { screenfull } from "../../logic/screenfull.ts";
import type { UseFullscreenOptions } from "../../types/uis.ts";
import { noop } from "../../utils/noop.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { useIsomorphicLayoutEffect } from "../lifecycles/useIsomorphicLayoutEffect.ts";

/**
 * React UI hook to display an element full-screen,
 * optional fallback for fullscreen video on iOS.
 *
 * @example
 * ```tsx
 * const ref = useRef(null)
 * const [show, toggle] = useBoolean(false);
 * const isFullscreen = useFullscreen(
 *   ref,
 *   show,
 *   { onClose: () => toggle(false) }
 * );
 *
 * return (
 *   <div ref={ref} style={{backgroundColor: 'white'}}>
 *     <div>
 *       {isFullscreen ? 'Fullscreen' : 'Not fullscreen'}
 *     </div>
 *     <button onClick={() => toggle()}>
 *       Toggle
 *     </button>
 *     <video
 *       src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
 *       autoPlay
 *     />
 *   </div>
 * );
 * ```
 *
 * @param ref The React ref to the element to display full-screen
 * @param enabled Whether to display the element full-screen
 * @param options (Optional) The fullscreen options
 * @param options.video (Optional) The video element if fullscreening a video
 * @param options.onClose (Optional) Callback for when the fullscreen is closed. Called with an error if closed due to an error
 * @returns `true` if the element is displayed full-screen, `false` otherwise
 *
 * @category UI
 * @since 0.0.1
 */
export const useFullscreen = (
  ref: React.RefObject<Element>,
  enabled: boolean,
  options: UseFullscreenOptions = {}
): boolean => {
  const { video, onClose = noop } = options;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const _onClose = useRef(onClose);
  _onClose.current = onClose;

  useIsomorphicLayoutEffect(() => {
    if (!enabled || !ref?.current) {
      return;
    }

    const onWebkitEndFullscreen = () => {
      if (video?.current) {
        off(video.current, "webkitendfullscreen", onWebkitEndFullscreen);
      }

      _onClose.current();
    };

    const onChange = () => {
      if (!screenfull.isEnabled) {
        return;
      }

      const isScreenfullFullscreen = screenfull.isFullscreen;
      setIsFullscreen(isScreenfullFullscreen);

      if (!isScreenfullFullscreen) {
        _onClose.current();
      }
    };

    if (screenfull.isEnabled) {
      try {
        screenfull.request(ref.current);
        setIsFullscreen(true);
      } catch (error) {
        _onClose.current(error instanceof Error ? error : undefined);
        setIsFullscreen(false);
      }
    } else if (video?.current?.webkitEnterFullscreen) {
      video.current.webkitEnterFullscreen();

      on(video.current, "webkitendfullscreen", onWebkitEndFullscreen);

      setIsFullscreen(true);
    } else {
      _onClose.current();
      setIsFullscreen(false);
    }

    return () => {
      setIsFullscreen(false);

      if (screenfull.isEnabled) {
        try {
          screenfull.off("change", onChange);
          screenfull.exit();
        } catch {}
      } else if (video?.current?.webkitExitFullscreen) {
        off(video.current, "webkitendfullscreen", onWebkitEndFullscreen);
        video.current.webkitExitFullscreen();
      }
    };
  }, [enabled, video, ref]);

  return isFullscreen;
};
