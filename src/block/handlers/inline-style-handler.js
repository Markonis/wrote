import { applyInlineStyle } from '../wrote-block-utils.js';

export function handleInlineStyles(e) {
  // Check for Ctrl/Cmd key combination
  const isCtrlOrCmd = e.ctrlKey || e.metaKey;

  if (!isCtrlOrCmd) {
    return false;
  }

  switch (e.key.toLowerCase()) {
    case 'b':
      applyInlineStyle('bold');
      return true;
    case 'i':
      applyInlineStyle('italic');
      return true;
    case 'u':
      applyInlineStyle('underline');
      return true;
    default:
      return false;
  }
}
