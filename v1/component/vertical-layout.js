import { WroteComponent } from './wrote-component.js';
import { WroteBlock } from '../block/wrote-block.js';

export class VerticalLayout extends WroteComponent {
  constructor() {
    super();
    this.blocks = [];
    this.parentComponent = null;
  }

  moveLeft(source) {
    const index = this.blocks.indexOf(source);
    if (index > 0) {
      this.blocks[index - 1].focusAtEnd();
      return true;
    }
    if (this.parentComponent) {
      return this.parentComponent.moveLeft(this);
    }
    return false;
  }

  moveRight(source) {
    const index = this.blocks.indexOf(source);
    if (index < this.blocks.length - 1) {
      this.blocks[index + 1].focus();
      return true;
    }
    if (this.parentComponent) {
      return this.parentComponent.moveRight(this);
    }
    return false;
  }

  moveUp(source, caretX) {
    const index = this.blocks.indexOf(source);
    if (index > 0) {
      this.blocks[index - 1].focusWithPosition(caretX, 'bottom');
      return true;
    }
    if (this.parentComponent) {
      return this.parentComponent.moveUp(this, caretX);
    }
    return false;
  }

  moveDown(source, caretX) {
    const index = this.blocks.indexOf(source);
    if (index < this.blocks.length - 1) {
      this.blocks[index + 1].focusWithPosition(caretX, 'top');
      return true;
    }
    if (this.parentComponent) {
      return this.parentComponent.moveDown(this, caretX);
    }
    return false;
  }

  split(sourceBlock) {
    const index = this.blocks.indexOf(sourceBlock);
    if (index === -1) return null;

    const newBlock = new WroteBlock(this);
    this.blocks.splice(index + 1, 0, newBlock);

    // Insert into DOM after sourceBlock
    const nextElement = sourceBlock.element.nextSibling;
    if (nextElement) {
      sourceBlock.element.parentNode.insertBefore(newBlock.element, nextElement);
    } else {
      sourceBlock.element.parentNode.appendChild(newBlock.element);
    }

    if (this.editor?.onBlockCreated) {
      this.editor.onBlockCreated(newBlock);
    }

    return newBlock;
  }

  merge(sourceBlock) {
    const index = this.blocks.indexOf(sourceBlock);
    if (index === 0) return null;

    const previousBlock = this.blocks[index - 1];
    if (!previousBlock instanceof WroteBlock) return;

    const mergeOffset = previousBlock.contentElement.childNodes.length;

    return { block: previousBlock, mergeOffset };
  }

  mergeForward(sourceBlock) {
    const index = this.blocks.indexOf(sourceBlock);
    if (index === -1 || index === this.blocks.length - 1) return null;

    const nextBlock = this.blocks[index + 1];
    if (!(nextBlock instanceof WroteBlock)) return null;

    return { block: nextBlock };
  }

  remove(block) {
    const index = this.blocks.indexOf(block);
    if (index === -1) return false;

    this.blocks.splice(index, 1);
    block.element.remove();

    if (this.editor?.onBlockRemoved) {
      this.editor.onBlockRemoved(block);
    }

    return true;
  }
}
