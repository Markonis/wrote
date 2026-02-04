/**
 * Whitelist of HTML tags allowed in block content
 */
const ALLOWED_TAGS = new Set(['STRONG', 'EM', 'U', 'CODE', 'SPAN', 'DIV']);
const SPAN_OR_DIV_TAGS = new Set(['SPAN', 'DIV']);

/**
 * Check if a tag is in the allowed list
 * @param {string} tagName
 * @returns {boolean}
 */
function isAllowedTag(tagName) {
  return ALLOWED_TAGS.has(tagName);
}

/**
 * Check if a tag is span or div
 * @param {string} tagName
 * @returns {boolean}
 */
function isSpanOrDiv(tagName) {
  return SPAN_OR_DIV_TAGS.has(tagName);
}

/**
 * Check if element has contenteditable="false"
 * @param {Element} element
 * @returns {boolean}
 */
function hasEditableAttribute(element) {
  return element.getAttribute('contenteditable') === 'false';
}

/**
 * Remove all attributes from an element
 * @param {Element} element
 */
function removeAllAttributes(element) {
  while (element.attributes.length > 0) {
    element.removeAttribute(element.attributes[0].name);
  }
}

/**
 * Handle disallowed elements by removing them completely
 * @param {Element} child
 */
function handleDisallowedElement(child) {
  child.parentNode.removeChild(child);
}

/**
 * Handle span/div elements with contenteditable="false"
 * @param {Element} child
 * @param {Function} walk - Recursive walk function
 */
function handleSpanOrDiv(child, walk) {
  child.innerHTML = '';
  // Keep all attributes on SPAN/DIV
  walk(child);
}

/**
 * Handle other allowed elements (STRONG, EM, U, CODE)
 * @param {Element} child
 * @param {Function} walk - Recursive walk function
 */
function handleOtherAllowedElement(child, walk) {
  removeAllAttributes(child);
  walk(child);
}

/**
 * Replace a tag with a new tag name while preserving content and attributes
 * @param {Element} element
 * @param {string} newTagName
 */
function changeTag(element, newTagName) {
  const newElement = document.createElement(newTagName);
  while (element.firstChild) {
    newElement.appendChild(element.firstChild);
  }
  while (element.attributes.length > 0) {
    newElement.setAttribute(element.attributes[0].name, element.attributes[0].value);
  }
  element.parentNode.replaceChild(newElement, element);
  return newElement;
}

/**
 * Normalize semantic tag equivalents (b→strong, i→em)
 * @param {Element} node
 */
function normalizeSemanticTags(node) {
  const children = Array.from(node.childNodes);

  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      if (child.tagName === 'B') {
        const strong = changeTag(child, 'strong');
        normalizeSemanticTags(strong);
      } else if (child.tagName === 'I') {
        const em = changeTag(child, 'em');
        normalizeSemanticTags(em);
      } else {
        normalizeSemanticTags(child);
      }
    }
  }
}

/**
 * Sanitize HTML by removing disallowed tags and all attributes
 * @param {string} html - The HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Normalize semantic tag equivalents first
  normalizeSemanticTags(doc.body);

  const walk = (node) => {
    const children = Array.from(node.childNodes);

    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!isAllowedTag(child.tagName)) {
          handleDisallowedElement(child);
        } else if (isSpanOrDiv(child.tagName) && !hasEditableAttribute(child)) {
          handleDisallowedElement(child);
        } else if (isSpanOrDiv(child.tagName)) {
          handleSpanOrDiv(child, walk);
        } else {
          handleOtherAllowedElement(child, walk);
        }
      }
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}
