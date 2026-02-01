import { isBackspace } from '../wrote-block-utils.js';

export function handleBackspace(block, e) {
  if (!isBackspace(e) || !block.isCaretAtStart()) {
    return false;
  }

  // If we have a prefix, clear it instead of merging
  if (block.prefix) {
    block.setPrefix(null);
    return true;
  }

  const mergeResult = block.component.merge(block);
  if (mergeResult) {
    const { block: targetBlock, mergeOffset } = mergeResult;

    // Move our content to the target block
    while (block.contentElement.childNodes.length > 0) {
      targetBlock.contentElement.appendChild(block.contentElement.childNodes[0]);
    }

    // Remove this block via component and focus target
    block.component.remove(block);
    targetBlock.focusAtOffset(mergeOffset);
    return true;
  }

  return false;
}
