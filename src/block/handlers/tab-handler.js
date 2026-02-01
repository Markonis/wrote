export function handleTab(block, e) {
  if (e.key !== 'Tab') {
    return false;
  }

  if (e.shiftKey) {
    // Shift+Tab: decrement indent
    block.setIndent(Math.max(0, block.indent - 1));
  } else {
    // Tab: increment indent
    block.setIndent(block.indent + 1);
  }

  return true;
}
