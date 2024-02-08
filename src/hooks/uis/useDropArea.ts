import { useMemo, useState } from "react";

import type {
  UseDropAreaCallbacks,
  UseDropAreaReturn,
  UseDropOptions,
} from "../../types/uis.ts";
import { useMountedState } from "../lifecycles/useMountedState.ts";

/**
 * Creates a function that processes the data transfer and the event.
 *
 * @param options The drop area options
 * @param options.onFiles (Optional) Callback for when files are dropped or pasted
 * @param options.onText (Optional) Callback for when text is dropped or pasted
 * @param options.onUri (Optional) Callback for when a URI is dropped or pasted
 * @param mounted Whether the component is mounted
 * @returns A function that processes the data transfer and the event
 */
const createProcess =
  (options: UseDropOptions, mounted: boolean) =>
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

    if (dataTransfer.items?.length) {
      dataTransfer.items[0]?.getAsString(text => {
        if (mounted) {
          options.onText?.(text, event);
        }
      });
    }
  };

/**
 * Creates the drop area callbacks.
 *
 * @param process The function that processes the data transfer and the event
 * @param setIsHovering The function that sets whether something is hovering the drop area
 * @returns The drop area callbacks
 */
const createCallbacks = (
  process: ReturnType<typeof createProcess>,
  setIsHovering: React.Dispatch<React.SetStateAction<boolean>>
): UseDropAreaCallbacks => ({
  onDragOver: event => {
    event.preventDefault();
    setIsHovering(true);
  },
  onDragEnter: event => {
    event.preventDefault();
    setIsHovering(true);
  },
  onDragLeave: () => {
    setIsHovering(false);
  },
  onDrop: event => {
    event.preventDefault();
    event.persist();
    setIsHovering(false);
    process(event.dataTransfer, event);
  },
  onPaste: event => {
    event.persist();
    process(event.clipboardData, event);
  },
});

/**
 * React hook that handles drag and drop and paste events.
 * It triggers on file or link drop, and copy-paste.
 *
 * The difference between this hook and `{@link useDrop}` is that
 * this hook tracks drop events for a specific element, while
 * `{@link useDrop}` tracks drop events for the whole page.
 *
 * @example
 * ```tsx
 * const [bond, state] = useDropArea({
 *   onFiles: files => console.log('files', files),
 *   onUri: uri => console.log('uri', uri),
 *   onText: text => console.log('text', text),
 * });
 *
 * return (
 *   <div {...bond}>
 *     Drop something here.
 *   </div>
 * );
 * ```
 *
 * @param options (Optional) The drop area options
 * @param options.onFiles (Optional) Callback for when files are dropped or pasted
 * @param options.onText (Optional) Callback for when text is dropped or pasted
 * @param options.onUri (Optional) Callback for when a URI is dropped or pasted
 * @returns A tuple containing the drop area callbacks and the drop area state
 *
 * @category UI
 * @since 0.0.1
 */
export const useDropArea = (
  options: UseDropOptions = {}
): UseDropAreaReturn => {
  const { onFiles, onText, onUri } = options;
  const [isHovering, setIsHovering] = useState(false);
  const mounted = useMountedState();

  const process = useMemo(
    () => createProcess({ onFiles, onText, onUri }, mounted()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFiles, onText, onUri]
  );

  return [
    useMemo<UseDropAreaCallbacks>(
      () => createCallbacks(process, setIsHovering),
      [process]
    ),
    { isHovering },
  ];
};
