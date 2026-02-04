import { isNewLine } from '../utils/key-events.js';
import { handleNewLine } from '../utils/text-operations.js';

export function handleEnter(block, e) {
  if (!isNewLine(e)) {
    return false;
  }
  
  handleNewLine(block, e.shiftKey);
  return true;
}
