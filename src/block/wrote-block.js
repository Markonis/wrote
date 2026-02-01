import {
  isValidRect,
  getCaretPositionFromPoint
} from './wrote-block-utils.js';
import { handleKeyDown } from './handlers/keydown-handler.js';
import { WroteBlockPrefix } from './wrote-block-prefix.js';

export class WroteBlock {
  static LINE_POSITION_THRESHOLD = 5; // pixels
  static INDENT_UNIT = "1.5rem"; // indent multiplier
  static PREFIX = {
    checked: "checked",
    unchecked: "unchecked",
    bullet: "bullet"
  }

  constructor(component) {
    this.component = component;
    this.element = document.createElement('div');
    this.contentElement = document.createElement('div');
    this.prefix = new WroteBlockPrefix(WroteBlock.INDENT_UNIT);
    this.init();
  }

  init() {
    this.contentElement.contentEditable = true;

    // Apply styles
    this.element.style.display = "flex";
    this.element.style.alignItems = "flex-start";

    // Append prefix and content to wrapper
    this.element.appendChild(this.prefix.getElement());
    this.element.appendChild(this.contentElement);

    this.contentElement.addEventListener('keydown', (e) => {
      if (handleKeyDown(this, e)) {
        e.preventDefault();
      }
    });
  }


  removeCharsFromStart(count) {
    let charsRemoved = 0;
    for (let node of this.contentElement.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (charsRemoved + node.textContent.length <= count) {
          // Remove entire text node
          const toRemove = node;
          charsRemoved += node.textContent.length;
          toRemove.remove();
        } else {
          // Partial removal of text node
          const remainingChars = count - charsRemoved;
          node.textContent = node.textContent.substring(remainingChars);
          break;
        }
      }
    }
  }

  detectAndApplyPrefix() {
    const text = this.contentElement.textContent;
    const matchLength = this.prefix.detectAndApply(text);

    if (matchLength > 0) {
      // Remove the matched pattern from content
      this.removeCharsFromStart(matchLength);
      return true;
    }

    return false;
  }
  
  
  isEmpty() {
    return this.contentElement.textContent.trim().length === 0;
  }
  
  isCaretAtStart() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(this.contentElement);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length === 0;
  }

  isCaretAtEnd() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    const postCaretRange = range.cloneRange();
    postCaretRange.selectNodeContents(this.contentElement);
    postCaretRange.setStart(range.endContainer, range.endOffset);

    return postCaretRange.toString().length === 0;
  }
  
  getCaretCoordinates() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    let rect = range.getBoundingClientRect();

    // Fall back to contentElement's rect if range rect is invalid
    if (!isValidRect(rect)) {
      rect = this.contentElement.getBoundingClientRect();
    }

    return { x: rect.left, y: rect.top };
  }

  focus() {
    this.contentElement.focus();

    // Position cursor at the start of the block
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(this.contentElement, 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  focusAtEnd() {
    this.contentElement.focus();

    // Position cursor at the end of the block
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(this.contentElement, this.contentElement.childNodes.length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  focusAtOffset(offset) {
    this.contentElement.focus();

    // Position cursor at a specific offset in the block
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(this.contentElement, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  focusWithPosition(caretX, edge) {
    this.contentElement.focus();

    // Determine y coordinate based on edge (top or bottom)
    const blockRect = this.contentElement.getBoundingClientRect();
    const targetY = edge === 'bottom'
      ? blockRect.bottom - WroteBlock.LINE_POSITION_THRESHOLD
      : blockRect.top + WroteBlock.LINE_POSITION_THRESHOLD;

    // Try to position cursor at the given x coordinate
    const caretPos = getCaretPositionFromPoint(caretX, targetY);

    if (caretPos) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(caretPos.offsetNode, caretPos.offset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Fallback: focus at start or end depending on edge
      edge === 'bottom' ? this.focusAtEnd() : this.focus();
    }
  }
  
  isCaretOnFirstLine() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return true;

    const currentRange = selection.getRangeAt(0);
    const currentCoords = currentRange.getBoundingClientRect();

    // If we get invalid coordinates, assume we're on the first line to allow navigation
    if (!isValidRect(currentCoords)) {
      return true;
    }

    // Check if top of caret is within threshold of contentElement's top
    const elementCoords = this.contentElement.getBoundingClientRect();

    return currentCoords.top <= elementCoords.top + WroteBlock.LINE_POSITION_THRESHOLD;
  }

  isCaretOnLastLine() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return true;

    const currentRange = selection.getRangeAt(0);
    const currentCoords = currentRange.getBoundingClientRect();

    // If we get invalid coordinates, assume we're on the last line to allow navigation
    if (!isValidRect(currentCoords)) {
      return true;
    }

    // Check if bottom of caret is within threshold of contentElement's bottom
    const elementCoords = this.contentElement.getBoundingClientRect();

    return currentCoords.bottom >= elementCoords.bottom - WroteBlock.LINE_POSITION_THRESHOLD;
  }
}
