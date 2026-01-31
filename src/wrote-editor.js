import { WroteBlock } from './wrote-block.js';

export class WroteEditor {
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
