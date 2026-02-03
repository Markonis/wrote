import { isNewLine, handleNewLine } from '../wrote-block-utils.js';

export function handleEnter(block, e) {
  if (!isNewLine(e)) {
    return false;
  }
  
  handleNewLine(block, e.shiftKey);
  return true;
}
