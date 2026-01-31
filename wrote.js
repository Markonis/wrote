class WroteEditor {
    constructor(containerElement) {
        this.container = containerElement;
        this.blocks = [];
        this.init();
    }

    init() {
        const block = this.createBlock();
        this.container.appendChild(block.element);
        this.focusBlock(block);
    }

    createBlock() {
        const block = new WroteBlock(this);
        this.blocks.push(block);
        return block;
    }

    getBlockIndex(block) {
        return this.blocks.indexOf(block);
    }

    getNextBlock(block) {
        const index = this.getBlockIndex(block);
        if (index !== -1 && index + 1 < this.blocks.length) {
            return this.blocks[index + 1];
        }
        return null;
    }

    getPreviousBlock(block) {
        const index = this.getBlockIndex(block);
        if (index > 0) {
            return this.blocks[index - 1];
        }
        return null;
    }

    deleteBlock(block) {
        const index = this.getBlockIndex(block);
        if (index === -1 || this.blocks.length === 1) return false;

        this.blocks.splice(index, 1);
        block.element.remove();
        return true;
    }

    mergeBlocks(targetBlock, sourceBlock) {
        // Get the position where we'll merge (at the end of target)
        const mergeOffset = targetBlock.element.childNodes.length;

        // Move all content from source to target
        while (sourceBlock.element.childNodes.length > 0) {
            targetBlock.element.appendChild(sourceBlock.element.childNodes[0]);
        }

        // Delete the now-empty source block
        this.deleteBlock(sourceBlock);

        return mergeOffset;
    }

    insertBlockAfter(block) {
        const index = this.getBlockIndex(block);
        if (index === -1) return null;

        const newBlock = new WroteBlock(this);
        this.blocks.splice(index + 1, 0, newBlock);

        const nextElement = block.element.nextSibling;
        if (nextElement) {
            this.container.insertBefore(newBlock.element, nextElement);
        } else {
            this.container.appendChild(newBlock.element);
        }

        this.focusBlock(newBlock);
        return newBlock;
    }

    focusBlock(block) {
        block.element.focus();

        // Position cursor at the start of the block
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(block.element, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    focusBlockAtEnd(block) {
        block.element.focus();

        // Position cursor at the end of the block
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(block.element, block.element.childNodes.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    focusBlockAtOffset(block, offset) {
        block.element.focus();

        // Position cursor at a specific offset in the block
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(block.element, offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

class WroteBlock {
    static LINE_POSITION_THRESHOLD = 5; // pixels

    constructor(editor) {
        this.editor = editor;
        this.element = document.createElement('div');
        this.init();
    }

    init() {
        this.element.contentEditable = true;
        this.element.addEventListener('keydown', (e) => {
            if (this.handleKeyDown(e)) {
                e.preventDefault();
            }
        });
    }

    isNewLine(e) {
        return e.key === 'Enter';
    }

    isBackspace(e) {
        return e.key === 'Backspace';
    }

    isEmpty() {
        return this.element.textContent.trim().length === 0;
    }

    isCaretAtStart() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(this.element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        return preCaretRange.toString().length === 0;
    }

    isCaretAtEnd() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;

        const range = selection.getRangeAt(0);
        const postCaretRange = range.cloneRange();
        postCaretRange.selectNodeContents(this.element);
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
        const rect = range.getBoundingClientRect();
        return { x: rect.left, y: rect.top };
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

        // Check if top of caret is within threshold of element's top
        const elementCoords = this.element.getBoundingClientRect();

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

        // Check if bottom of caret is within threshold of element's bottom
        const elementCoords = this.element.getBoundingClientRect();

        return currentCoords.bottom >= elementCoords.bottom - WroteBlock.LINE_POSITION_THRESHOLD;
    }

    handleBackspace(e) {
        if (!this.isBackspace(e) || !this.isCaretAtStart()) {
            return false;
        }

        const prevBlock = this.editor.getPreviousBlock(this);
        if (prevBlock) {
            if (this.isEmpty()) {
                this.editor.deleteBlock(this);
                this.editor.focusBlockAtEnd(prevBlock);
            } else {
                const mergeOffset = this.editor.mergeBlocks(prevBlock, this);
                this.editor.focusBlockAtOffset(prevBlock, mergeOffset);
            }
            return true;
        }

        return false;
    }

    handleArrowLeft(e) {
        if (e.key !== 'ArrowLeft' || !this.isCaretAtStart()) {
            return false;
        }

        const prevBlock = this.editor.getPreviousBlock(this);
        if (prevBlock) {
            this.editor.focusBlockAtEnd(prevBlock);
            return true;
        }

        return false;
    }

    handleArrowRight(e) {
        if (e.key !== 'ArrowRight' || !this.isCaretAtEnd()) {
            return false;
        }

        const nextBlock = this.editor.getNextBlock(this);
        if (nextBlock) {
            this.editor.focusBlock(nextBlock);
            return true;
        }

        return false;
    }

    handleArrowUp(e) {
        if (e.key !== 'ArrowUp' || !this.isCaretOnFirstLine()) {
            return false;
        }

        const prevBlock = this.editor.getPreviousBlock(this);
        if (!prevBlock) return false;

        const coords = this.getCaretCoordinates();
        if (!coords) return false;

        const caretPos = this.getCaretPositionFromPoint(coords.x, prevBlock.element.getBoundingClientRect().bottom - 5);
        if (!caretPos) {
            // Fallback: jump to end of previous block
            this.editor.focusBlock(prevBlock);
            return true;
        }

        this.editor.focusBlock(prevBlock);
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(caretPos.offsetNode, caretPos.offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
    }

    handleArrowDown(e) {
        if (e.key !== 'ArrowDown' || !this.isCaretOnLastLine()) {
            return false;
        }

        const nextBlock = this.editor.getNextBlock(this);
        if (!nextBlock) return false;

        const coords = this.getCaretCoordinates();
        if (!coords) return false;

        const caretPos = this.getCaretPositionFromPoint(coords.x, nextBlock.element.getBoundingClientRect().top + 5);
        if (!caretPos) {
            // Fallback: jump to start of next block
            this.editor.focusBlock(nextBlock);
            return true;
        }

        this.editor.focusBlock(nextBlock);
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(caretPos.offsetNode, caretPos.offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
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

        const selection = window.getSelection();
        if (!selection.rangeCount) {
            // No selection, just insert after
            this.editor.insertBlockAfter(this);
            return true;
        }

        const range = selection.getRangeAt(0);

        // Create a range from cursor to end of block to extract content after cursor
        const endRange = document.createRange();
        endRange.setStart(range.endContainer, range.endOffset);
        endRange.setEnd(this.element, this.element.childNodes.length);

        // Extract content from cursor to end
        const contentAfter = endRange.extractContents();

        // Create new block after current
        const newBlock = this.editor.insertBlockAfter(this);

        // Move extracted content to new block
        newBlock.element.appendChild(contentAfter);

        return true;
    }

    handleKeyDown(e) {
        if (this.handleEnter(e)) {
            return true;
        }

        if (this.handleBackspace(e)) {
            return true;
        }

        if (this.handleArrowKeys(e)) {
            return true;
        }

        return false;
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const editorElement = document.getElementById('editor');
    const editor = new WroteEditor(editorElement);
});
