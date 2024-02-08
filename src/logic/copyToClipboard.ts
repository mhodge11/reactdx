/**
 * Creates a node that is used to copy text to the clipboard.
 *
 * @param text The text to create the node with
 * @returns The created node
 */
const createNode = (text: string): HTMLPreElement => {
  const node = document.createElement("pre");
  node.style.width = "1px";
  node.style.height = "1px";
  node.style.position = "fixed";
  node.style.top = "5px";
  node.textContent = text;
  return node;
};

/**
 * Copies text to the clipboard from a node.
 *
 * @param node The node to copy the text from
 * @throws {Error} If a selection could not be found
 * @returns A promise that resolves when the text has been copied
 */
const copyNode = (node: HTMLPreElement): Promise<void> => {
  if ("clipboard" in navigator) {
    return navigator.clipboard.writeText(node.textContent ?? "");
  }

  const selection = getSelection();
  if (!selection) {
    return Promise.reject(new Error("No selection found"));
  }

  selection.removeAllRanges();

  const range = document.createRange();
  range.selectNodeContents(node);
  selection.addRange(range);
  document.execCommand("copy");
  selection.removeAllRanges();

  return Promise.resolve();
};

/**
 * Copies text to the clipboard.
 *
 * @param text The text to copy to the clipboard
 * @param options (Optional) Provide callbacks for when the text has been copied or an error occurred
 * @param options.onSuccess (Optional) A callback that is called when the text has been copied
 * @param options.onError (Optional) A callback that is called when an error occurred
 * @throws {Error} If the document body could not be found and `onError` is not provided
 * @returns A promise that resolves when the text has been copied
 */
export const copyToClipboard = async (
  text: string,
  {
    onSuccess,
    onError,
  }: { onSuccess?: () => void; onError?: (error: Error) => void } = {}
): Promise<void> => {
  try {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      const body = document.body;
      const node = createNode(text);
      body.appendChild(node);
      await copyNode(node);
      body.removeChild(node);
    }

    if (onSuccess) {
      onSuccess();
    }

    return Promise.resolve();
  } catch (error) {
    if (onError) {
      if (error instanceof Error) {
        onError(error);
      } else {
        onError(new Error(String(error)));
      }

      return Promise.resolve();
    }

    return Promise.reject(error);
  }
};
