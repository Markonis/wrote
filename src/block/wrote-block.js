import {
  isValidRect,
  getCaretPositionFromPoint
} from './wrote-block-utils.js';
import { handleKeyDown } from './handlers/keydown-handler.js';
import { WroteBlockPrefix } from './wrote-block-prefix.js';
import { STYLES, getBlockStyleClass, detectBlockStyle } from './wrote-block-style.js';

export class WroteBlock {
  static LINE_POSITION_THRESHOLD = 5; // pixels
  static INDENT_UNIT = "1.5rem"; // indent multiplier

  constructor(component) {
    this.component = component;
    this.element = document.createElement('div');
    this.contentElement = document.createElement('div');
    this.prefix = new WroteBlockPrefix(WroteBlock.INDENT_UNIT);
    this.style = STYLES.BODY;
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

    this.applyStyleClass();

    this.contentElement.addEventListener('keydown', (e) => {
      if (handleKeyDown(this, e)) {
        e.preventDefault();
      }
    });
  }

  applyStyleClass() {
    this.contentElement.className = getBlockStyleClass(this.style);
  }

  setStyle(style) {
    if (Object.values(STYLES).includes(style)) {
      this.style = style;
      this.applyStyleClass();

      // Clear prefix if changing to a heading style
      if (style !== STYLES.BODY) {
        this.prefix.setValue(null);
      }
    }
  }

  detectAndApplyStyle() {
    const text = this.contentElement.textContent;
    const detection = detectBlockStyle(text);

    if (detection) {
      this.setStyle(detection.style);
      // Remove the matched pattern from content
      this.removeCharsFromStart(detection.matchLength);
      return true;
    }

    return false;
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
    // Only allow prefixes on body blocks
    if (this.style !== STYLES.BODY) {
      return false;
    }

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
  
  isCaretAtPosition(direction) {
    const range = this.getSelectionRange();
    if (!range) return false;

    const measureRange = range.cloneRange();
    measureRange.selectNodeContents(this.contentElement);

    if (direction === 'start') {
      measureRange.setEnd(range.endContainer, range.endOffset);
    } else {
      measureRange.setStart(range.endContainer, range.endOffset);
    }

    return measureRange.toString().length === 0;
  }

  isCaretAtStart() {
    return this.isCaretAtPosition('start');
  }

  isCaretAtEnd() {
    return this.isCaretAtPosition('end');
  }
  
  getSelectionRange() {
    const selection = window.getSelection();
    return selection.rangeCount ? selection.getRangeAt(0) : null;
  }

  getCaretCoordinates() {
    const range = this.getSelectionRange();
    if (!range) return null;

    let rect = range.getBoundingClientRect();

    // Fall back to contentElement's rect if range rect is invalid
    if (!isValidRect(rect)) {
      rect = this.contentElement.getBoundingClientRect();
    }

    return { x: rect.left, y: rect.top };
  }

  setCaretPosition(node, offset) {
    this.contentElement.focus();

    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(node, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  focus() {
    this.setCaretPosition(this.contentElement, 0);
  }

  focusAtEnd() {
    this.setCaretPosition(this.contentElement, this.contentElement.childNodes.length);
  }

  focusAtOffset(offset) {
    this.setCaretPosition(this.contentElement, offset);
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
      this.setCaretPosition(caretPos.offsetNode, caretPos.offset);
    } else {
      // Fallback: focus at start or end depending on edge
      edge === 'bottom' ? this.focusAtEnd() : this.focus();
    }
  }
  
  isCaretNearLine(edge) {
    const range = this.getSelectionRange();
    if (!range) return true; // assume near line if we can't determine

    const caretCoords = range.getBoundingClientRect();
    if (!isValidRect(caretCoords)) {
      return true; // assume near line if coordinates are invalid
    }

    const elementCoords = this.contentElement.getBoundingClientRect();
    const threshold = WroteBlock.LINE_POSITION_THRESHOLD;

    return edge === 'top'
      ? caretCoords.top <= elementCoords.top + threshold
      : caretCoords.bottom >= elementCoords.bottom - threshold;
  }

  isCaretOnFirstLine() {
    return this.isCaretNearLine('top');
  }

  isCaretOnLastLine() {
    return this.isCaretNearLine('bottom');
  }
}
