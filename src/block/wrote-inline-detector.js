import { setCaretPosition } from './wrote-block-utils.js';
import { findPrecedingTextMatch } from './wrote-text-matcher.js';

const MAX_LOOKBACK = 100;

/**
 * Removes the first and last N characters from an element's content,
 * preserving the formatting of the remaining text nodes.
 * @param {Element} node - The element to trim
 * @param {number} delimiterLength - The number of characters to remove from each end
 */
function trimDelimiters(node, delimiterLength) {
  // Create TreeWalker to walk text nodes
  const walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    null
  );

  // Trim leading delimiter
  let charsToRemoveFromStart = delimiterLength;
  let textNode = walker.firstChild();
  while (textNode && charsToRemoveFromStart > 0) {
    if (textNode.textContent.length <= charsToRemoveFromStart) {
      // Remove entire node
      charsToRemoveFromStart -= textNode.textContent.length;
      const nextNode = walker.nextNode();
      textNode.parentNode?.removeChild(textNode);
      textNode = nextNode;
    } else {
      // Trim from start of this node
      textNode.textContent = textNode.textContent.substring(charsToRemoveFromStart);
      charsToRemoveFromStart = 0;
    }
  }

  // Trim trailing delimiter
  let charsToRemoveFromEnd = delimiterLength;
  walker.currentNode = node;
  textNode = walker.lastChild();
  while (textNode && charsToRemoveFromEnd > 0) {
    if (textNode.textContent.length <= charsToRemoveFromEnd) {
      // Remove entire node
      charsToRemoveFromEnd -= textNode.textContent.length;
      const prevNode = walker.previousNode();
      textNode.parentNode?.removeChild(textNode);
      textNode = prevNode;
    } else {
      // Trim from end of this node
      const length = textNode.textContent.length;
      textNode.textContent = textNode.textContent.substring(0, length - charsToRemoveFromEnd);
      charsToRemoveFromEnd = 0;
    }
  }
}

/**
 * Applies an inline element style after a range has been detected.
 * @param {Range} range - The range containing the delimited text
 * @param {string} elementTagName - The HTML element tag to create ('code', 'strong', etc)
 * @param {number} delimiterLength - The length of delimiters on each side (1 for backtick, 2 for asterisks)
 */
function applyInlineElement(range, elementTagName, delimiterLength) {
  // Extract contents while preserving formatting
  const fragment = range.cloneContents();

  // Delete original range
  range.deleteContents();

  // Create element and append the fragment content
  const element = document.createElement(elementTagName);
  element.appendChild(fragment);

  // Trim delimiters from the element content
  trimDelimiters(element, delimiterLength);

  // Insert the element
  range.insertNode(element);

  // Insert space and position cursor
  const space = document.createTextNode(' ');
  element.after(space);
  setCaretPosition(space, 1);

  return true;
}

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

  return applyInlineElement(range, 'code', 1);
}

export function detectAndApplyBold(block) {
  const range = findPrecedingTextMatch({
    node: block.contentElement,
    maxLookback: MAX_LOOKBACK,
    trigger: (char) => char === '*',
    match: (text) => {
      return text.startsWith('**') &&
        text.endsWith('**') &&
        text.length > 4
    }
  });

  if (!range) {
    return false;
  }

  return applyInlineElement(range, 'strong', 2);
}

export function detectAndApplyItalic(block) {
  const range = findPrecedingTextMatch({
    node: block.contentElement,
    maxLookback: MAX_LOOKBACK,
    trigger: (char) => char === '_',
    match: (text) => {
      return text.startsWith('_') &&
        text.endsWith('_') &&
        text.length > 2
    }
  });

  if (!range) {
    return false;
  }

  return applyInlineElement(range, 'em', 1);
}
