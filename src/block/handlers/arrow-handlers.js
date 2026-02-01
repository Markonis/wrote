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

  const coords = block.getCaretCoordinates();
  if (!coords) return false;

  return block.component.moveUp(block, coords.x);
}

export function handleArrowDown(block, e) {
  if (e.key !== 'ArrowDown' || !block.isCaretOnLastLine()) {
    return false;
  }

  const coords = block.getCaretCoordinates();
  if (!coords) return false;

  return block.component.moveDown(block, coords.x);
}

export function handleArrowKeys(block, e) {
  return (
    handleArrowLeft(block, e) ||
    handleArrowRight(block, e) ||
    handleArrowUp(block, e) ||
    handleArrowDown(block, e)
  );
}
