import { STYLES } from './wrote-block-style.js';
import { detectAndApplyInlineCode, detectAndApplyBold, detectAndApplyItalic, detectAndTriggerActionDropdown } from './wrote-inline-detector.js';

/**
 * Detects and applies formatting: block styles, prefixes, and inline styles.
 * Should be called after DOM changes to detect formatting patterns.
 * @param {WroteBlock} block - The block to apply detected formatting to
 */

export function detectAndApplyFormats(block) {
  if (block.style === STYLES.CODE) return;
  block.detectAndApplyStyle();
  block.detectAndApplyPrefix();
  detectAndTriggerActionDropdown(block);
  detectAndApplyInlineCode(block);
  detectAndApplyBold(block);
  detectAndApplyItalic(block);
}
