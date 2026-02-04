/**
 * Whitelist of HTML tags allowed in block content
 */
const ALLOWED_TAGS = new Set(['STRONG', 'EM', 'U', 'CODE']);

/**
 * Sanitize HTML by removing disallowed tags and all attributes
 * @param {string} html - The HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Get all elements in the document
  const walk = (node) => {
    const children = Array.from(node.childNodes);

    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!ALLOWED_TAGS.has(child.tagName)) {
          // Replace disallowed element with its text content
          const textNode = document.createTextNode(child.textContent);
          child.parentNode.replaceChild(textNode, child);
        } else {
          // Remove all attributes from allowed elements
          while (child.attributes.length > 0) {
            child.removeAttribute(child.attributes[0].name);
          }
          // Recurse into children
          walk(child);
        }
      }
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}
