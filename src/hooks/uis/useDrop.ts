import { useEffect, useMemo, useState } from "react";

import type { UseDropOptions, UseDropReturn } from "../../types/uis.ts";
import { hasDocument } from "../../utils/hasDocument.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";

/**
 * Creates a function that processes the data transfer and the event.
 *
 * @param options The drop area options
 * @param options.onFiles (Optional) Callback for when files are dropped or pasted
 * @param options.onText (Optional) Callback for when text is dropped or pasted
 * @param options.onUri (Optional) Callback for when a URI is dropped or pasted
 * @returns A function that processes the data transfer and the event
 */
const createProcess =
  (options: UseDropOptions) =>
  (
    dataTransfer: DataTransfer,
    event: React.DragEvent | React.ClipboardEvent
  ) => {
    const uri = dataTransfer.getData("text/uri-list");

    if (uri) {
      options.onUri?.(uri, event);
      return;
    }

    if (dataTransfer.files?.length) {
      options.onFiles?.(Array.from(dataTransfer.files), event);
      return;
    }

    if ("clipboardData" in event && event.clipboardData) {
      const text = event.clipboardData.getData("text");
      options.onText?.(text, event);
    }
  };

/**
 * React hook that handles drag and drop and paste events.
 * It triggers on file or link drop, and copy-paste.
 *
 * The difference between this hook and `{@link useDropArea}` is that
 * this hook tracks events for the whole page, while `{@link useDropArea}`
 * tracks drop events for a specific element.
 *
 * @example
 * ```tsx
 * const state = useDrop({
 *   onFiles: files => console.log('files', files),
 *   onUri: uri => console.log('uri', uri),
 *   onText: text => console.log('text', text),
 * });
 *
 * return (
 *   <div>
 *     Drop something on the page.
 *   </div>
 * );
 * ```
 *
 * @param options The drop area options
 * @param deps Any dependencies that should trigger refreshing the event listeners
 * @returns The drop area state containing an `isHovering` boolean
 *
 * @category UI
 * @since 0.0.1
 */
export const useDrop = hasDocument()
  ? (
      options: UseDropOptions = {},
      deps: React.DependencyList = []
    ): UseDropReturn => {
      const { onFiles, onText, onUri } = options;
      const [isHovering, setIsHovering] = useState(false);

      const process = useMemo(
        () => createProcess({ onFiles, onText, onUri }),
        [onFiles, onText, onUri]
      );

      useEffect(() => {
        const onDragOver = (event: React.DragEvent) => {
          event.preventDefault();
          setIsHovering(true);
        };

        const onDragEnter = (event: React.DragEvent) => {
          event.preventDefault();
          setIsHovering(true);
        };

        const onDragLeave = () => {
          setIsHovering(false);
        };

        const onDragExit = () => {
          setIsHovering(false);
        };

        const onDrop = (event: React.DragEvent) => {
          event.preventDefault();
          event.persist();
          setIsHovering(false);
          process(event.dataTransfer, event);
        };

        const onPaste = (event: React.ClipboardEvent) => {
          event.persist();
          process(event.clipboardData, event);
        };

        on(document, "dragover", onDragOver);
        on(document, "dragenter", onDragEnter);
        on(document, "dragleave", onDragLeave);
        on(document, "dragexit", onDragExit);
        on(document, "drop", onDrop);
        on(document, "paste", onPaste);

        return () => {
          off(document, "dragover", onDragOver);
          off(document, "dragenter", onDragEnter);
          off(document, "dragleave", onDragLeave);
          off(document, "dragexit", onDragExit);
          off(document, "drop", onDrop);
          off(document, "paste", onPaste);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [process, ...deps]);

      return { isHovering };
    }
  : (
      options: UseDropOptions = {},
      deps: React.DependencyList = []
    ): UseDropReturn => {
      warn("`useDrop` is not supported in this environment.", {
        options,
        deps,
      });
      return { isHovering: false };
    };
