import { isNewLine } from '../utils/key-events.js';
import { handleNewLine } from '../utils/text-operations.js';

/** @import { WroteBlock } from '../wrote-block.js' */

/**
 * @param {WroteBlock} block
 * @param {KeyboardEvent} e
 */
export function handleEnter(block, e) {
  if (!isNewLine(e)) {
    return false;
  }
  
  handleNewLine(block, e.shiftKey);
  return true;
}
