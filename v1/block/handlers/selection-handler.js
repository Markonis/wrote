/** @import { WroteBlock } from '../wrote-block.js' */

/**
 * @param {WroteBlock} block
 */
export function handleSelection(block) {
  const editor = block.component.getEditor();
  if (!editor) return;

  const selection = window.getSelection();

  if (selection.isCollapsed) {
    // TODO: Hide toolbar when no selection
    editor.toolbar.hide();
    return;
  }

  const range = block.getSelectedRange();

  if (!range) {
    editor.toolbar.hide();
    return;
  }

  // TODO: Show toolbar with selection position
  // editor.toolbar.show(range);
}
