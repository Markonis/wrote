import { STYLES } from '../wrote-block-style.js';
import { isNewLine, setCaretPosition } from '../wrote-block-utils.js';

export function handleEnter(block, e) {
  if (!isNewLine(e)) {
    return false;
  }

  // For code blocks, insert a newline instead of creating a new block
  if (block.style === STYLES.CODE && !e.shiftKey) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    const newLine = document.createTextNode(
      block.isCaretAtEnd() ? "\n\n" : "\n");
    range.insertNode(newLine);
    
    // Position caret after the target node
    setCaretPosition(newLine, 1);
    return true;
  }

  // Check if the block is empty
  if (block.isEmpty()) {
    const currentIndent = block.prefix.getIndent();
    if (currentIndent > 0) {
      block.prefix.setIndent(currentIndent - 1);
      return true;
    } else if (block.prefix.getValue() !== null) {
      block.prefix.setValue(null);
      return true;
    }
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
