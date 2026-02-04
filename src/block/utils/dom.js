// DOM node manipulation utilities

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
