import { insertTextInRange } from '../wrote-block-utils.js';

export function handleBeforeInput(block, e) {
  // Only intercept text insertion events
  if (e.inputType !== 'insertText' && e.inputType !== 'insertCompositionText') {
    return false;
  }

  const text = e.data;
  if (!text) return false;

  const selection = window.getSelection();
  if (selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  insertTextInRange(text, range);

  return true;
}
