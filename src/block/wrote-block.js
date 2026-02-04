import {
  getCaretPositionFromPoint,
  setCaretPosition,
  isCaretAtPosition,
  getCaretCoordinates as getCaretCoordinatesUtil,
  isCaretNearEdge,
  setCaretAfter
} from './utils/selection.js';
import { removeCharsFromStart, isInsideNonEditableElement, getDirectChildOf } from './utils/dom.js';
import { handleKeyDown } from './handlers/keydown-handler.js';
import { handleBeforeInput } from './handlers/beforeinput-handler.js';
import { handlePaste } from './handlers/paste-handler.js';
import { handleSelection } from './handlers/selection-handler.js';
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
    this.element.className = "wr-block";

    // Append prefix and content to wrapper
    this.element.appendChild(this.prefix.getElement());
    this.element.appendChild(this.contentElement);

    this.applyStyleClass();

    this.contentElement.addEventListener('beforeinput', (e) => {
      if (handleBeforeInput(this, e)) {
        e.preventDefault();
      }
    });

    this.contentElement.addEventListener('keydown', (e) => {
      if (handleKeyDown(this, e)) {
        e.preventDefault();
      }
    });

    this.contentElement.addEventListener('paste', (e) => {
      if (handlePaste(this, e)) {
        e.preventDefault();
      }
    });

    document.addEventListener('selectionchange', () => {
      handleSelection(this);
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
      removeCharsFromStart(this.contentElement, detection.matchLength);
      return true;
    }

    return false;
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
      removeCharsFromStart(this.contentElement, matchLength);
      return true;
    }

    return false;
  }
  
  isEmpty() {
    return this.contentElement.textContent.trim().length === 0;
  }

  isCaretAtStart() {
    return isCaretAtPosition(this.contentElement, 'start');
  }

  isCaretAtEnd() {
    return isCaretAtPosition(this.contentElement, 'end');
  }
  
  isCaretOnFirstLine() {
    return isCaretNearEdge(this.contentElement, 'top', WroteBlock.LINE_POSITION_THRESHOLD);
  }

  isCaretOnLastLine() {
    return isCaretNearEdge(this.contentElement, 'bottom', WroteBlock.LINE_POSITION_THRESHOLD);
  }

  getCaretCoordinates() {
    return getCaretCoordinatesUtil(this.contentElement);
  }

  setCaretPosition(node, offset) {
    this.contentElement.focus();
    setCaretPosition(node, offset);
  }

  focus() {
    this.setCaretPosition(this.contentElement, 0);
  }

  focusAtEnd() {
    this.setCaretPosition(this.contentElement, this.contentElement.childNodes.length);
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
      // Check if the caret position is inside a non-editable element
      if (isInsideNonEditableElement(caretPos.offsetNode, this.contentElement)) {
        // Find the direct child of contentElement that contains the caret position
        const child = getDirectChildOf(this.contentElement, caretPos.offsetNode);
        if (child) {
          // Place caret right after the direct child
          const index = Array.from(this.contentElement.childNodes).indexOf(child);
          this.setCaretPosition(this.contentElement, index + 1);
        }
      } else {
        this.setCaretPosition(caretPos.offsetNode, caretPos.offset);
      }
    } else {
      // Fallback: focus at start or end depending on edge
      edge === 'bottom' ? this.focusAtEnd() : this.focus();
    }
  }

  insertHtmlAtCaret(html) {
    this.contentElement.focus();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // Check if the range is within this contentElement
    if (!this.contentElement.contains(range.commonAncestorContainer)) {
      return;
    }

    // Parse the HTML and create nodes in the proper context
    const fragment = range.createContextualFragment(html);
    const lastNode = fragment.lastChild;
    if (!lastNode) return

    range.insertNode(fragment);
    setCaretAfter(lastNode);
  }
}
