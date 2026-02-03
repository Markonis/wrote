export function handleSelection(block) {
  const editor = block.component.getEditor();
  if (!editor) return;

  const selection = window.getSelection();

  // TODO: Check if selection is within the block's contentElement

  if (!selection.rangeCount || selection.isCollapsed) {
    // TODO: Hide toolbar when no selection
    editor.toolbar.hide();
    return;
  }

  const range = selection.getRangeAt(0);

  // TODO: Verify range is within this block's contentElement
  if (!block.contentElement.contains(range.commonAncestorContainer)) {
    editor.toolbar.hide();
    return;
  }

  // TODO: Show toolbar with selection position
  // editor.toolbar.show(range);
}
