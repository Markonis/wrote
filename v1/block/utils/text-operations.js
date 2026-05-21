import { STYLES } from '../wrote-block-style.js';
import { setCaretPosition } from './selection.js';

/** @import { WroteBlock } from '../wrote-block.js' */

/**
 * @param {WroteBlock} block
 * @param {boolean} shiftKey
 */
export function handleNewLine(block, shiftKey) {
  // For code blocks, insert a newline instead of creating a new block
  if (block.style === STYLES.CODE && !shiftKey) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const newLine = document.createTextNode("\n");
    range.insertNode(newLine);

    // Position caret after the newline
    setCaretPosition(newLine, 1);
    return block; // Return the same block since no new block was created
  }

  // Check if the block is empty
  if (block.isEmpty()) {
    const currentIndent = block.prefix.getIndent();
    if (currentIndent > 0) {
      block.prefix.setIndent(currentIndent - 1);
      return block; // Return the same block since no new block was created
    } else if (block.prefix.getValue() !== null) {
      block.prefix.setValue(null);
      return block; // Return the same block since no new block was created
    }
  }

  const newBlock = block.component.split(block);
  if (!newBlock) return null;

  // Inherit indent and prefix from current block
  newBlock.prefix.setIndent(block.prefix.getIndent());
  newBlock.prefix.setValue(block.prefix.getValue());

  const selection = window.getSelection();
  if (!selection.rangeCount) {
    // No selection, just focus new block at start
    newBlock.focus();
    return newBlock; // Return the new block
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

  return newBlock; // Return the new block
}
