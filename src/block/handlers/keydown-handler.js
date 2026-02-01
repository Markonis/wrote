import { handleTab } from './tab-handler.js';
import { handleBackspace } from './backspace-handler.js';
import { handleDelete } from './delete-handler.js';
import { handleEnter } from './enter-handler.js';
import { handleArrowKeys } from './arrow-handlers.js';

export function handleKeyDown(block, e) {
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

  setTimeout(() => {
    block.detectAndApplyStyle();
    block.detectAndApplyPrefix();
  });

  return false;
}
