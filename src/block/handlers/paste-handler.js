import { insertTextInRange } from '../utils/selection.js';
import { handleNewLine } from '../utils/text-operations.js';
import { detectAndApplyFormats } from '../block-detection-helpers.js';
import { sanitizeHTML } from '../../serde/sanitizer.js';

export function handlePaste(block, e) {
  e.preventDefault();

  // Check for HTML content first (from our editor or rich text sources)
  const html = e.clipboardData.getData('text/html');
  if (html) {
    // Sanitize to ensure only allowed formatting is preserved
    const sanitized = sanitizeHTML(html);
    if (sanitized) {
      block.insertHtmlAtCaret(sanitized);
      return true;
    }
  }

  // Fall back to plain text from other sources
  const text = e.clipboardData.getData('text/plain');
  if (!text) return true;

  const selection = window.getSelection();
  if (selection.rangeCount === 0) return true;

  // Split text by newlines
  const lines = text.split('\n');

  // Insert first line
  let range = selection.getRangeAt(0);
  let currentBlock = block;

  if (lines[0]) {
    insertTextInRange(lines[0], range);
    detectAndApplyFormats(currentBlock);
  }

  // For subsequent lines, handle newlines
  for (let i = 1; i < lines.length; i++) {
    // Create new block/line and update reference
    const newBlock = handleNewLine(currentBlock, false);
    if (!newBlock) break;

    currentBlock = newBlock;

    // Get new range for insertion
    const newSelection = window.getSelection();
    if (newSelection.rangeCount === 0) break;

    range = newSelection.getRangeAt(0);

    // Insert the line text
    if (lines[i]) {
      insertTextInRange(lines[i], range);
      detectAndApplyFormats(currentBlock);
    }
  }

  return true;
}
