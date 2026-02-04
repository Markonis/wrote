// Validation utilities
function isValidRect(rect) {
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
