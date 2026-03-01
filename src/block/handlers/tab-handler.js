import { setCaretPosition } from '../utils/selection.js';
import { STYLES } from '../wrote-block-style.js';

/** @import { WroteBlock } from '../wrote-block.js' */

/**
 * @param {WroteBlock} block
 * @param {KeyboardEvent} e
 */
export function handleTab(block, e) {
  if (e.key !== 'Tab') {
    return false;
  }

  // For code blocks, insert 2 spaces instead of changing indent
  if (!block.isCaretAtStart() && block.style === STYLES.CODE) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    const spaces = document.createTextNode('  ');
    range.insertNode(spaces);

    // Position caret after the spaces
    setCaretPosition(spaces.parentNode, Array.from(spaces.parentNode.childNodes).indexOf(spaces) + 1);
    return true;
  }

  if (e.shiftKey) {
    // Shift+Tab: decrement indent
    block.prefix.setIndent(Math.max(0, block.prefix.getIndent() - 1));
  } else {
    // Tab: increment indent
    block.prefix.setIndent(block.prefix.getIndent() + 1);
  }

  return true;
}
