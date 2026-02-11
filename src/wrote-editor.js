import { WroteBlock } from './block/wrote-block.js';
import { VerticalLayout } from './component/vertical-layout.js';
import { WroteToolbar } from './block/wrote-toolbar.js';

export class WroteEditor {
  /**
   * @param {HTMLElement} containerElement - The container for the editor
   * @param {Object} options - Configuration options
   * @param {Object} [options.triggers] - Object mapping trigger characters to callbacks. Example: { '/': (block, range) => {...} }
   * @param {Function} [options.onBlockCreated] - Callback when a block is created
   * @param {Function} [options.onBlockRemoved] - Callback when a block is removed
   */
  constructor(containerElement, { triggers, onBlockCreated, onBlockRemoved } = {}) {
    this.container = containerElement;
    this.rootComponent = new VerticalLayout();
    this.toolbar = new WroteToolbar();
    this.triggers = triggers || {};
    this.onBlockCreated = onBlockCreated;
    this.onBlockRemoved = onBlockRemoved;
    this.rootComponent.editor = this;
    this.init();
  }

  init() {
    const block = new WroteBlock(this.rootComponent);
    this.rootComponent.blocks.push(block);
    this.container.appendChild(this.toolbar.getElement());
    this.container.appendChild(block.element);
    block.focus();
    if (this.onBlockCreated) {
      this.onBlockCreated(block);
    }
  }

  /**
   * Handles a trigger character being detected
   * @param {string} trigger - The trigger character
   * @param {WroteBlock} block - The block where the trigger was detected
   * @param {Range} range - The text range of the trigger
   */
  handleTrigger(trigger, block, range) {
    const callback = this.triggers[trigger];
    if (callback) {
      callback(block, range);
    }
  }
}
