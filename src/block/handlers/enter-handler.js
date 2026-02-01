import { isNewLine } from '../wrote-block-utils.js';

export function handleEnter(block, e) {
  if (!isNewLine(e)) {
    return false;
  }

  const newBlock = block.component.split(block);
  if (!newBlock) return false;

  // Inherit indent and prefix from current block
  newBlock.prefix.setIndent(block.prefix.getIndent());
  newBlock.prefix.setValue(block.prefix.getValue());

  const selection = window.getSelection();
  if (!selection.rangeCount) {
    // No selection, just focus new block at start
    newBlock.focus();
    return true;
  }

  const range = selection.getRangeAt(0);

  // Create a range from cursor to end of block to extract content after cursor
  const endRange = document.createRange();
  endRange.setStart(range.endContainer, range.endOffset);
  endRange.setEnd(block.contentElement, block.contentElement.childNodes.length);

  // Extract content from cursor to end
  const contentAfter = endRange.extractContents();

  // Move extracted content to new block
  newBlock.contentElement.appendChild(contentAfter);

  // Focus new block
  newBlock.focus();

  return true;
}
