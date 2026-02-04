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
