import { insertTextInRange } from '../utils/selection.js';
import { detectAndApplyFormats } from '../block-detection-helpers.js';

/** @import { WroteBlock } from '../wrote-block.js' */

/**
 * @param {WroteBlock} block
 * @param {InputEvent} e
 */
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
  detectAndApplyFormats(block);

  return true;
}
