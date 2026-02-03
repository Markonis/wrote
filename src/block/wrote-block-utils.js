import { STYLES } from './wrote-block-style.js';

// Key detection utilities
export function isNewLine(e) {
  return e.key === 'Enter';
}

export function isBackspace(e) {
  return e.key === 'Backspace';
}

export function isDelete(e) {
  return e.key === 'Delete';
}

// Validation utilities
export function isValidRect(rect) {
  // A valid rect should have non-zero width or height
  return rect.width !== 0 || rect.height !== 0;
}

// Caret positioning utilities
export function getCaretPositionFromPoint(x, y) {
  // Handle both caretPositionFromPoint (standard) and caretRangeFromPoint (Safari)
  if (document.caretPositionFromPoint) {
    return document.caretPositionFromPoint(x, y);
  } else if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return null;
    return {
      offsetNode: range.endContainer,
      offset: range.endOffset
    };
  }
  return null;
}

// Selection management utilities
export function getSelectionRange() {
  const selection = window.getSelection();
  return selection.rangeCount ? selection.getRangeAt(0) : null;
}

export function setCaretPosition(node, offset) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.setStart(node, offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function setCaretAfter(node) {
  const parentNode = node.parentNode;
  const offset = Array.from(parentNode.childNodes).indexOf(node) + 1;
  setCaretPosition(parentNode, offset);
}

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

export function insertTextInRange(text, range) {
  // Delete selected content if any
  if (!range.collapsed) {
    range.deleteContents();
  }

  // Insert text
  if (range.endContainer.nodeType === Node.TEXT_NODE) {
    range.endContainer.insertData(range.endOffset, text);
    range.setStart(range.endContainer, range.endOffset + text.length);
    range.collapse(true);
  } else {
    // Create new text node if not in a text node
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStart(textNode, text.length);
    range.collapse(true);
  }

  // Update selection
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function isCaretAtPosition(node, direction) {
  const range = getSelectionRange();
  if (!range) return false;

  const measureRange = range.cloneRange();
  measureRange.selectNodeContents(node);

  if (direction === 'start') {
    measureRange.setEnd(range.endContainer, range.endOffset);
  } else {
    measureRange.setStart(range.endContainer, range.endOffset);
  }

  return measureRange.toString().length === 0;
}

export function getCaretCoordinates(node) {
  const range = getSelectionRange();
  if (!range) return null;

  let rect = range.getBoundingClientRect();

  // Fall back to node's rect if range rect is invalid
  if (!isValidRect(rect)) {
    rect = node.getBoundingClientRect();
  }

  return { x: rect.left, y: rect.top };
}

export function removeCharsFromStart(node, count) {
  let charsRemoved = 0;
  for (let childNode of node.childNodes) {
    if (childNode.nodeType === Node.TEXT_NODE) {
      if (charsRemoved + childNode.textContent.length <= count) {
        // Remove entire text node
        const toRemove = childNode;
        charsRemoved += childNode.textContent.length;
        toRemove.remove();
      } else {
        // Partial removal of text node
        const remainingChars = count - charsRemoved;
        childNode.textContent = childNode.textContent.substring(remainingChars);
        break;
      }
    }
  }
}

export function isCaretNearEdge(node, edge, threshold) {
  const range = getSelectionRange();
  if (!range) return true; // assume near line if we can't determine

  const caretCoords = range.getBoundingClientRect();
  if (!isValidRect(caretCoords)) {
    return true; // assume near line if coordinates are invalid
  }

  // Create a range that encompasses all content in the element
  const contentRange = document.createRange();
  contentRange.selectNodeContents(node);
  const contentCoords = contentRange.getBoundingClientRect();
  if (!isValidRect(contentCoords)) {
    return true; // assume near line if content bounds are invalid
  }

  return edge === 'top'
    ? caretCoords.top <= contentCoords.top + threshold
    : caretCoords.bottom >= contentCoords.bottom - threshold;
}

/**
 * Checks if a text node is inside a non-contenteditable element.
 * @param {Node} textNode - The text node to check
 * @param {Node} searchRoot - The root element we're searching within (boundary)
 * @returns {boolean} True if the text node is inside a contenteditable="false" element
 */
export function isInsideNonEditableElement(textNode, searchRoot) {
  let current = textNode.parentNode;
  while (current && current !== searchRoot) {
    if (current.getAttribute?.('contenteditable') === 'false') {
      return true;
    }
    current = current.parentNode;
  }
  return false;
}

/**
 * Finds the direct child of parent that contains innerChild.
 * @param {Node} parent - The parent element to find the direct child within
 * @param {Node} innerChild - A node somewhere within parent's hierarchy
 * @returns {Node|null} The direct child of parent that contains innerChild, or null if not found
 */
export function getDirectChildOf(parent, innerChild) {
  let child = innerChild;
  while (child && child.parentNode !== parent) {
    child = child.parentNode;
  }
  return child;
}

/**
 * Removes the first and last N characters from an element's content,
 * preserving the formatting of the remaining text nodes.
 * @param {Element} node - The element to trim
 * @param {number} delimiterLength - The number of characters to remove from each end
 */
function trimDelimiters(node, delimiterLength) {
  if (delimiterLength <= 0) return;

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
export function applyInlineElement(range, elementTagName, delimiterLength) {
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
  setCaretAfter(element);

  return true;
}
