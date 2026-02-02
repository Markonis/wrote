import { findPrecedingTextMatch } from './wrote-text-matcher.js';
import { setCaretPosition } from './wrote-block-utils.js';

const MAX_LOOKBACK = 100;

export function detectAndApplyInlineCode(block) {
  const range = findPrecedingTextMatch({
    node: block.contentElement,
    maxLookback: MAX_LOOKBACK,
    trigger: (char) => char === '`',
    match: (text) => {
      return text.startsWith('`') &&
        text.endsWith('`') &&
        text.length > 2
    }
  });

  if (!range) {
    return false;
  }

  // Extract text content and remove backticks
  const fragment = range.cloneContents();
  let codeText = fragment.textContent;
  codeText = codeText.substring(1, codeText.length - 1);

  // Delete original range
  range.deleteContents();

  // Create code element with plain text
  const codeElement = document.createElement('code');
  codeElement.textContent = codeText;
  range.insertNode(codeElement);

  // Insert space and position cursor
  const space = document.createTextNode(' ');
  codeElement.parentNode.insertBefore(space, codeElement.nextSibling);
  setCaretPosition(space, 1);

  return true;
}
