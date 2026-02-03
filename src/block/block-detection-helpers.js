import { detectAndApplyInlineCode, detectAndApplyBold, detectAndApplyItalic } from './wrote-inline-detector.js';

/**
 * Detects and applies formatting: block styles, prefixes, and inline styles.
 * Should be called after DOM changes to detect formatting patterns.
 * @param {WroteBlock} block - The block to apply detected formatting to
 */

export function detectAndApplyFormats(block) {
  block.detectAndApplyStyle();
  block.detectAndApplyPrefix();
  detectAndApplyInlineCode(block);
  detectAndApplyBold(block);
  detectAndApplyItalic(block);
}
