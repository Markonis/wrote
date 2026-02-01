import { BULLET_ICON, CHECKED_ICON, UNCHECKED_ICON } from './wrote-icons.js';

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
    this.prefix = null;
    this.prefixElement = null;
    this.indent = 0;
    this.init();
  }

  init() {
    this.contentElement.contentEditable = true;

    // Create prefix element
    this.prefixElement = document.createElement('span');
    this.prefixElement.className = 'wrote-prefix';
    this.prefixElement.style.marginRight = "0.25rem";
    this.renderPrefix();

    // Apply styles
    this.element.style.display = "flex";
    this.element.style.alignItems = "flex-start";

    // Append prefix and content to wrapper
    this.element.appendChild(this.prefixElement);
    this.element.appendChild(this.contentElement);

    this.prefixElement.addEventListener('click', () => {
      this.handlePrefixClick();
    });

    this.contentElement.addEventListener('keydown', (e) => {
      if (this.handleKeyDown(e)) {
        e.preventDefault();
      }
    });
  }

  renderPrefix() {
    // Clear existing content
    this.prefixElement.innerHTML = '';
    this.prefixElement.className = 'wrote-prefix';

    // Set cursor style based on whether prefix is clickable
    if (this.prefix === WroteBlock.PREFIX.checked || this.prefix === WroteBlock.PREFIX.unchecked) {
      this.prefixElement.style.cursor = 'pointer';
    } else {
      this.prefixElement.style.cursor = 'default';
    }

    if (!this.prefix) {
      return;
    }

    const iconMap = {
      [WroteBlock.PREFIX.bullet]: BULLET_ICON,
      [WroteBlock.PREFIX.checked]: CHECKED_ICON,
      [WroteBlock.PREFIX.unchecked]: UNCHECKED_ICON
    };

    const svgString = iconMap[this.prefix];
    if (svgString) {
      this.prefixElement.innerHTML = svgString;
    }
  }

  setPrefix(newPrefix) {
    if ([WroteBlock.PREFIX.bullet, WroteBlock.PREFIX.checked, WroteBlock.PREFIX.unchecked, null].includes(newPrefix)) {
      this.prefix = newPrefix;
      this.renderPrefix();
    }
  }

  handlePrefixClick() {
    if (this.prefix === WroteBlock.PREFIX.checked) {
      this.setPrefix(WroteBlock.PREFIX.unchecked);
    } else if (this.prefix === WroteBlock.PREFIX.unchecked) {
      this.setPrefix(WroteBlock.PREFIX.checked);
    }
  }

  setIndent(newIndent) {
    if (newIndent >= 0) {
      this.indent = newIndent;
      this.prefixElement.style.marginLeft = `calc(${this.indent} * ${WroteBlock.INDENT_UNIT})`;
    }
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

    // Define prefix patterns
    const patterns = [
      { pattern: /^-/, prefix: WroteBlock.PREFIX.bullet },
      { pattern: /^\[x\]\s?/, prefix: WroteBlock.PREFIX.checked },
      { pattern: /^\[\]\s?/, prefix: WroteBlock.PREFIX.unchecked }
    ];

    // Check each pattern
    for (const { pattern, prefix } of patterns) {
      const match = text.match(pattern);
      if (match) {
        // Apply the prefix
        this.setPrefix(prefix);

        // Remove the matched pattern from content
        this.removeCharsFromStart(match[0].length);

        return true;
      }
    }

    return false;
  }
  
  isNewLine(e) {
    return e.key === 'Enter';
  }
  
  isBackspace(e) {
    return e.key === 'Backspace';
  }

  isDelete(e) {
    return e.key === 'Delete';
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
  
  isValidRect(rect) {
    // A valid rect should have non-zero width or height
    return rect.width !== 0 || rect.height !== 0;
  }
  
  getCaretCoordinates() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    let rect = range.getBoundingClientRect();

    // Fall back to contentElement's rect if range rect is invalid
    if (!this.isValidRect(rect)) {
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
    const caretPos = this.getCaretPositionFromPoint(caretX, targetY);

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
  
  getCaretPositionFromPoint(x, y) {
    // Handle both caretPositionFromPoint (standard) and caretRangeFromPoint (Safari)
    if (document.caretPositionFromPoint) {
      return document.caretPositionFromPoint(x, y);
    } else if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(x, y);
      if (!range) return null;
      return {
        offsetNode: range.endContainer,
        offset: range.endOffset
      };
    }
    return null;
  }
  
  isCaretOnFirstLine() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return true;

    const currentRange = selection.getRangeAt(0);
    const currentCoords = currentRange.getBoundingClientRect();

    // If we get invalid coordinates, assume we're on the first line to allow navigation
    if (!this.isValidRect(currentCoords)) {
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
    if (!this.isValidRect(currentCoords)) {
      return true;
    }

    // Check if bottom of caret is within threshold of contentElement's bottom
    const elementCoords = this.contentElement.getBoundingClientRect();

    return currentCoords.bottom >= elementCoords.bottom - WroteBlock.LINE_POSITION_THRESHOLD;
  }
  
  handleTab(e) {
    if (e.key !== 'Tab') {
      return false;
    }

    if (e.shiftKey) {
      // Shift+Tab: decrement indent
      this.setIndent(Math.max(0, this.indent - 1));
    } else {
      // Tab: increment indent
      this.setIndent(this.indent + 1);
    }

    return true;
  }

  handleBackspace(e) {
    if (!this.isBackspace(e) || !this.isCaretAtStart()) {
      return false;
    }

    // If we have a prefix, clear it instead of merging
    if (this.prefix) {
      this.setPrefix(null);
      return true;
    }

    const mergeResult = this.component.merge(this);
    if (mergeResult) {
      const { block: targetBlock, mergeOffset } = mergeResult;

      // Move our content to the target block
      while (this.contentElement.childNodes.length > 0) {
        targetBlock.contentElement.appendChild(this.contentElement.childNodes[0]);
      }

      // Remove this block via component and focus target
      this.component.remove(this);
      targetBlock.focusAtOffset(mergeOffset);
      return true;
    }

    return false;
  }

  handleDelete(e) {
    if (!this.isDelete(e) || !this.isCaretAtEnd()) {
      return false;
    }

    // Merge the next block into the current one
    const mergeResult = this.component.mergeForward(this);
    if (mergeResult) {
      const { block: nextBlock } = mergeResult;

      // Move next block's content into current block
      while (nextBlock.contentElement.childNodes.length > 0) {
        this.contentElement.appendChild(nextBlock.contentElement.childNodes[0]);
      }

      // Remove the next block via component
      this.component.remove(nextBlock);
      return true;
    }

    return false;
  }
  
  handleArrowLeft(e) {
    if (e.key !== 'ArrowLeft' || !this.isCaretAtStart()) {
      return false;
    }

    return this.component.moveLeft(this);
  }

  handleArrowRight(e) {
    if (e.key !== 'ArrowRight' || !this.isCaretAtEnd()) {
      return false;
    }

    return this.component.moveRight(this);
  }
  
  handleArrowUp(e) {
    if (e.key !== 'ArrowUp' || !this.isCaretOnFirstLine()) {
      return false;
    }

    const coords = this.getCaretCoordinates();
    if (!coords) return false;

    return this.component.moveUp(this, coords.x);
  }
  
  handleArrowDown(e) {
    if (e.key !== 'ArrowDown' || !this.isCaretOnLastLine()) {
      return false;
    }

    const coords = this.getCaretCoordinates();
    if (!coords) return false;

    return this.component.moveDown(this, coords.x);
  }
  
  handleArrowKeys(e) {
    return (
      this.handleArrowLeft(e) ||
      this.handleArrowRight(e) ||
      this.handleArrowUp(e) ||
      this.handleArrowDown(e)
    );
  }
  
  handleEnter(e) {
    if (!this.isNewLine(e)) {
      return false;
    }

    const newBlock = this.component.split(this);
    if (!newBlock) return false;

    // Inherit indent and prefix from current block
    newBlock.setIndent(this.indent);
    newBlock.setPrefix(this.prefix);

    const selection = window.getSelection();
    if (!selection.rangeCount) {
      // No selection, just focus new block at start
      newBlock.focus();
      return true;
    }

    const range = selection.getRangeAt(0);

    // Create a range from cursor to end of block to extract content after cursor
    const endRange = document.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    endRange.setEnd(this.contentElement, this.contentElement.childNodes.length);

    // Extract content from cursor to end
    const contentAfter = endRange.extractContents();

    // Move extracted content to new block
    newBlock.contentElement.appendChild(contentAfter);

    // Focus new block
    newBlock.focus();

    return true;
  }
  
  handleKeyDown(e) {
    if (this.handleTab(e)) {
      return true;
    }

    if (this.handleEnter(e)) {
      return true;
    }

    if (this.handleBackspace(e)) {
      return true;
    }

    if (this.handleDelete(e)) {
      return true;
    }

    if (this.handleArrowKeys(e)) {
      return true;
    }

    setTimeout(() => this.detectAndApplyPrefix());

    return false;
  }
}
