import { applyInlineElement } from './wrote-block-utils.js';
import { findPrecedingTextMatch } from './wrote-text-matcher.js';

const MAX_LOOKBACK = 100;
const ACTION_DROPDOWN_MAX_LOOKBACK = 1; // Only look for "/" immediately before caret

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

export function detectAndTriggerActionDropdown(block) {
  const range = findPrecedingTextMatch({
    node: block.contentElement,
    maxLookback: ACTION_DROPDOWN_MAX_LOOKBACK,
    trigger: (char) => char === '/',
    match: (text) => text === '/'
  });

  if (!range) {
    return false;
  }

  // Show action dropdown (don't delete "/" yet - will be deleted only if action is selected)
  block.component.getEditor().showActionDropdown(block, range);

  return true;
}
