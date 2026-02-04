import { WroteBlock } from './block/wrote-block.js';
import { VerticalLayout } from './component/vertical-layout.js';
import { WroteToolbar } from './block/wrote-toolbar.js';
import { WroteActionDropdown } from './block/wrote-action-dropdown.js';

/**
 * @typedef {Object} Action
 * @property {string} labelHTML - HTML to display for the action label
 * @property {string} searchText - Text used for searching and filtering actions
 * @property {Function} callback - Function to invoke when action is selected. Receives {block, range}
 */

export class WroteEditor {
  /**
   * @param {HTMLElement} containerElement - The container for the editor
   * @param {Object} options - Configuration options
   * @param {Function} [options.actionProvider] - Function that takes a block and returns an array of {@link Action}
   * @param {Function} [options.onBlockCreated] - Callback when a block is created
   * @param {Function} [options.onBlockRemoved] - Callback when a block is removed
   */
  constructor(containerElement, { actionProvider, onBlockCreated, onBlockRemoved } = {}) {
    this.container = containerElement;
    this.rootComponent = new VerticalLayout();
    this.toolbar = new WroteToolbar();
    this.actionDropdown = new WroteActionDropdown();
    this.actionProvider = actionProvider;
    this.onBlockCreated = onBlockCreated;
    this.onBlockRemoved = onBlockRemoved;
    this.rootComponent.editor = this;
    this.init();
  }

  init() {
    const block = new WroteBlock(this.rootComponent);
    this.rootComponent.blocks.push(block);
    this.container.appendChild(this.toolbar.getElement());
    this.container.appendChild(this.actionDropdown.getElement());
    this.container.appendChild(block.element);
    block.focus();
    if (this.onBlockCreated) {
      this.onBlockCreated(block);
    }
  }

  /**
   * Shows the action dropdown for a block at the given range
   * @param {WroteBlock} block - The block to show actions for
   * @param {Range} range - The text range where the dropdown should position
   */
  showActionDropdown(block, range) {
    if (!this.actionProvider) return;
    const actions = this.actionProvider(block);
    this.actionDropdown.show({ actions, block, range });
  }

  canWrite() {
    return !this.actionDropdown.isVisible;
  }
}
