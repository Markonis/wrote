export function handleBeforeInput(block, e) {
  // Only intercept text insertion events
  if (e.inputType !== 'insertText' && e.inputType !== 'insertCompositionText') {
    return false;
  }

  const text = e.data;
  if (!text) return false;

  const selection = window.getSelection();
  if (selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);

  // Delete selected content if any
  if (!range.collapsed) {
    range.deleteContents();
  }

  // Try to append to existing text node if caret is in one
  if (range.endContainer.nodeType === Node.TEXT_NODE) {
    range.endContainer.insertData(range.endOffset, text);
    range.setStart(range.endContainer, range.endOffset + text.length);
    range.collapse(true);
  } else {
    // Create new text node if not in a text node
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStart(textNode, text.length);
    range.collapse(true);
  }

  selection.removeAllRanges();
  selection.addRange(range);

  return true;
}
