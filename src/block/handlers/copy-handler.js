import { sanitizeHTML } from '../../serde/sanitizer.js';

/**
 * Handle copy event - put selected content as sanitized HTML on clipboard
 * @param {WroteBlock} block
 * @param {ClipboardEvent} e
 */
export function handleCopy(block, e) {
  const range = block.getSelectedRange();
  if (!range) return;

  // Clone the selected fragment
  const fragment = range.cloneContents();
  const div = document.createElement('div');
  div.appendChild(fragment);
  const selectedHtml = div.innerHTML;

  // Sanitize to ensure only allowed formatting is preserved
  const sanitized = sanitizeHTML(selectedHtml);

  // Prevent default to avoid browser overwriting our data
  e.preventDefault();

  // Set both HTML and plain text on clipboard
  const selection = window.getSelection();
  e.clipboardData.setData('text/html', sanitized);
  e.clipboardData.setData('text/plain', selection.toString());
}
