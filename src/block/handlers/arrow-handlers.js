export function handleArrowLeft(block, e) {
  if (e.key !== 'ArrowLeft' || !block.isCaretAtStart()) {
    return false;
  }

  return block.component.moveLeft(block);
}

export function handleArrowRight(block, e) {
  if (e.key !== 'ArrowRight' || !block.isCaretAtEnd()) {
    return false;
  }

  return block.component.moveRight(block);
}

export function handleArrowUp(block, e) {
  if (e.key !== 'ArrowUp' || !block.isCaretOnFirstLine()) {
    return false;
  }

  const rect = block.getCaretRect();
  if (!rect) return false;

  return block.component.moveUp(block, rect.left);
}

export function handleArrowDown(block, e) {
  if (e.key !== 'ArrowDown' || !block.isCaretOnLastLine()) {
    return false;
  }

  const rect = block.getCaretRect();
  if (!rect) return false;

  return block.component.moveDown(block, rect.left);
}

export function handleArrowKeys(block, e) {
  return (
    handleArrowLeft(block, e) ||
    handleArrowRight(block, e) ||
    handleArrowUp(block, e) ||
    handleArrowDown(block, e)
  );
}
