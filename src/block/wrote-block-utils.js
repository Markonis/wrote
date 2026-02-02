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

// Text matching utilities

/**
 * Searches backwards from the caret position for text matching a condition.
 * @param {Object} params
 * @param {Node} params.node - The node to search within
 * @param {number} params.maxLookback - Maximum number of characters to look back
 * @param {Function} params.trigger - Function that checks if the character before the caret should trigger the search
 * @param {Function} params.match - Function that returns true when a match is found; receives (text, isAtStart) where isAtStart indicates no more text to look back
 * @returns {Range|null} Range covering the matched text, or null if no match found
 */
export function findPrecedingTextMatch({ node, maxLookback, trigger, match }) {
  const selection = window.getSelection();

  if (!selection.rangeCount || !node.contains(selection.anchorNode)) {
    return null;
  }

  const caretNode = selection.anchorNode;
  const caretOffset = selection.anchorOffset;

  if (caretNode.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  // Check if the character before the caret triggers the search
  if (caretOffset === 0 || !trigger(caretNode.textContent[caretOffset - 1])) {
    return null;
  }

  // Create a TreeWalker that walks text nodes only within the given node
  const walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    null
  );

  // Position the walker at the caretNode
  walker.currentNode = caretNode;

  let charCount = 0;
  let accumulatedText = '';
  let currentNode = caretNode;
  let currentOffset = caretOffset - 1;
  let matchStartNode = null;
  let matchStartOffset = null;

  // Walk backwards to collect characters
  while (charCount < maxLookback) {
    // Walk backwards within current text node
    while (currentOffset >= 0 && charCount < maxLookback) {
      const char = currentNode.textContent[currentOffset];
      accumulatedText = char + accumulatedText;

      matchStartNode = currentNode;
      matchStartOffset = currentOffset;

      // Check if match returns true (match found)
      if (match(accumulatedText, false)) {
        const range = document.createRange();
        range.setStart(currentNode, currentOffset);
        range.setEnd(caretNode, caretOffset);
        return range;
      }

      currentOffset--;
      charCount++;
    }

    if (charCount >= maxLookback) {
      return null;
    }

    // Move to previous text node (automatically handles nested elements)
    currentNode = walker.previousNode();
    if (!currentNode) {
      // At the start - one final match attempt with isAtStart = true
      if (match(accumulatedText, true)) {
        const range = document.createRange();
        range.setStart(matchStartNode, matchStartOffset);
        range.setEnd(caretNode, caretOffset);
        return range;
      }
      return null;
    }

    currentOffset = currentNode.textContent.length - 1;
  }

  return null;
}

