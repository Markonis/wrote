import { insertTextInRange } from '../wrote-block-utils.js';

export function handlePaste(block, e) {
  e.preventDefault();

  // Get plain text from clipboard
  const text = e.clipboardData.getData('text/plain');
  if (!text) return true;

  const selection = window.getSelection();
  if (selection.rangeCount === 0) return true;

  const range = selection.getRangeAt(0);
  insertTextInRange(text, range);

  return true;
}
