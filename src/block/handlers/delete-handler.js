import { isDelete } from '../utils/key-events.js';

export function handleDelete(block, e) {
  if (!isDelete(e) || !block.isCaretAtEnd()) {
    return false;
  }

  // Merge the next block into the current one
  const mergeResult = block.component.mergeForward(block);
  if (mergeResult) {
    const { block: nextBlock } = mergeResult;

    // Move next block's content into current block
    while (nextBlock.contentElement.childNodes.length > 0) {
      block.contentElement.appendChild(nextBlock.contentElement.childNodes[0]);
    }

    // Remove the next block via component
    block.component.remove(nextBlock);
  }

  return true;
}
