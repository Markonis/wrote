import { applyInlineElement } from './wrote-block-utils.js';
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
