import { BULLET_ICON, CHECKED_ICON, UNCHECKED_ICON } from '../wrote-icons.js';

// Key detection utilities
export function isNewLine(e) {
  return e.key === 'Enter';
}

export function isBackspace(e) {
  return e.key === 'Backspace';
}

export function isDelete(e) {
  return e.key === 'Delete';
}

// Validation utilities
export function isValidRect(rect) {
  // A valid rect should have non-zero width or height
  return rect.width !== 0 || rect.height !== 0;
}

// Caret positioning utilities
export function getCaretPositionFromPoint(x, y) {
  // Handle both caretPositionFromPoint (standard) and caretRangeFromPoint (Safari)
  if (document.caretPositionFromPoint) {
    return document.caretPositionFromPoint(x, y);
  } else if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return null;
    return {
      offsetNode: range.endContainer,
      offset: range.endOffset
    };
  }
  return null;
}

// Prefix utilities
const PREFIX_PATTERNS = [
  { pattern: /^-/, prefix: 'bullet' },
  { pattern: /^\[x\]\s?/, prefix: 'checked' },
  { pattern: /^\[\]\s?/, prefix: 'unchecked' }
];

const ICON_MAP = {
  bullet: BULLET_ICON,
  checked: CHECKED_ICON,
  unchecked: UNCHECKED_ICON
};

export function getPrefixIcon(prefix) {
  if (!prefix) {
    return null;
  }
  return ICON_MAP[prefix];
}

export function detectPrefixPattern(text) {
  // Check each pattern
  for (const { pattern, prefix } of PREFIX_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return {
        prefix,
        matchLength: match[0].length
      };
    }
  }
  return null;
}
