import { handleArrowKeys } from './arrow-handlers.js';
import { handleBackspace } from './backspace-handler.js';
import { handleDelete } from './delete-handler.js';
import { handleEnter } from './enter-handler.js';
import { handleInlineStyles } from './inline-style-handler.js';
import { handleTab } from './tab-handler.js';

/** @import { WroteBlock } from '../wrote-block.js' */

/**
 * @param {WroteBlock} block
 * @param {KeyboardEvent} e
 */
export function handleKeyDown(block, e) {
  if (handleInlineStyles(e)) {
    return true;
  }

  if (handleTab(block, e)) {
    return true;
  }

  if (handleEnter(block, e)) {
    return true;
  }

  if (handleBackspace(block, e)) {
    return true;
  }

  if (handleDelete(block, e)) {
    return true;
  }

  if (handleArrowKeys(block, e)) {
    return true;
  }

  return false;
}
