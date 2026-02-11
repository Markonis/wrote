import { applyInlineElement } from './utils/inline-styles.js';
import { findPrecedingTextMatch } from './wrote-text-matcher.js';

const MAX_LOOKBACK = 100;

export function detectAndApplyInlineCode(block) {
  const range = findPrecedingTextMatch({
    node: block.contentElement,
    maxLookback: MAX_LOOKBACK,
    trigger: (char) => char === '`',
    match: (text) => {
      return text.startsWith('`') &&
        text.endsWith('`') &&
        text.length > 2
    }
  });

  if (!range) {
    return false;
  }

  return applyInlineElement(range, 'code', 1);
}

export function detectAndApplyBold(block) {
  const range = findPrecedingTextMatch({
    node: block.contentElement,
    maxLookback: MAX_LOOKBACK,
    trigger: (char) => char === '*',
    match: (text) => {
      return text.startsWith('**') &&
        text.endsWith('**') &&
        text.length > 4
    }
  });

  if (!range) {
    return false;
  }

  return applyInlineElement(range, 'strong', 2);
}

export function detectAndApplyItalic(block) {
  const range = findPrecedingTextMatch({
    node: block.contentElement,
    maxLookback: MAX_LOOKBACK,
    trigger: (char) => char === '_',
    match: (text) => {
      return text.startsWith('_') &&
        text.endsWith('_') &&
        text.length > 2
    }
  });

  if (!range) {
    return false;
  }

  return applyInlineElement(range, 'em', 1);
}

export function detectAndApplyTriggers(block) {
  const editor = block.component.getEditor();

  // Check for any configured triggers
  for (const triggerChar of Object.keys(editor.triggers)) {
    const range = findPrecedingTextMatch({
      node: block.contentElement,
      maxLookback: 1, // Only look immediately before caret
      trigger: (char) => char === triggerChar,
      match: (text) => text === triggerChar
    });

    if (range) {
      editor.handleTrigger(triggerChar, block, range);
      return true;
    }
  }

  return false;
}
