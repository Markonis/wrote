export function handleTab(block, e) {
  if (e.key !== 'Tab') {
    return false;
  }

  if (e.shiftKey) {
    // Shift+Tab: decrement indent
    block.prefix.setIndent(Math.max(0, block.prefix.getIndent() - 1));
  } else {
    // Tab: increment indent
    block.prefix.setIndent(block.prefix.getIndent() + 1);
  }

  return true;
}
