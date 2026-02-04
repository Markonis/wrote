import { applyInlineElement } from '../utils/inline-styles.js';
import { getSelectionRange } from '../utils/selection.js';

export function handleInlineStyles(e) {
  // Check for Ctrl/Cmd key combination
  const isCtrlOrCmd = e.ctrlKey || e.metaKey;
  const range = getSelectionRange();

  if (!isCtrlOrCmd) {
    return false;
  }

  switch (e.key.toLowerCase()) {
    case 'b':
      applyInlineElement(range, 'strong', 0);
      return true;
    case 'i':
      applyInlineElement(range, 'strong', 0);
      return true;
    case 'u':
      applyInlineElement(range, 'u', 0);
      return true;
    default:
      return false;
  }
}
