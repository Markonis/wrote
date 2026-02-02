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

export function isCaretNearLine(node, edge, threshold) {
  const range = getSelectionRange();
  if (!range) return true; // assume near line if we can't determine

  const caretCoords = range.getBoundingClientRect();
  if (!isValidRect(caretCoords)) {
    return true; // assume near line if coordinates are invalid
  }

  const elementCoords = node.getBoundingClientRect();

  return edge === 'top'
    ? caretCoords.top <= elementCoords.top + threshold
    : caretCoords.bottom >= elementCoords.bottom - threshold;
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
 * Applies an inline style command using execCommand.
 * Ensures semantic HTML formatting instead of CSS styles.
 * @param {string} command - The command to execute ('bold', 'italic', 'underline')
 */
export function applyInlineStyle(command) {
  // Ensure semantic HTML formatting instead of CSS styles
  document.execCommand('styleWithCSS', false, false);
  document.execCommand(command, false, null);
}
