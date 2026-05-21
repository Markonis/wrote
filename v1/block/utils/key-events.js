// Key detection utilities

/**
 * @param {KeyboardEvent} e
 */
export function isNewLine(e) {
  return e.key === 'Enter';
}

/**
 * @param {KeyboardEvent} e
 */
export function isBackspace(e) {
  return e.key === 'Backspace';
}

/**
 * @param {KeyboardEvent} e
 */
export function isDelete(e) {
  return e.key === 'Delete';
}
