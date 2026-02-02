
/**
 * Checks if a text node is inside a non-contenteditable element.
 * @param {Node} textNode - The text node to check
 * @param {Node} searchRoot - The root element we're searching within (boundary)
 * @returns {boolean} True if the text node is inside a contenteditable="false" element
 */
function isInsideNonEditableElement(textNode, searchRoot) {
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

    // Stop if we've crossed into a non-contenteditable element
    if (isInsideNonEditableElement(currentNode, node)) {
      return null;
    }

    currentOffset = currentNode.textContent.length - 1;
  }

  return null;
}
