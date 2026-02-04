import { handleCopy } from './copy-handler.js';

/**
 * Handle cut event - copy to clipboard and delete selection
 * @param {WroteBlock} block
 * @param {ClipboardEvent} e
 */
export function handleCut(block, e) {
  // First, copy the selection to clipboard
  handleCopy(block, e);

  // Then delete the selected content
  const range = block.getSelectedRange();
  if (range) {
    range.deleteContents();
  }
}
