import { WroteBlock } from './block/wrote-block.js';
import { VerticalLayout } from './component/vertical-layout.js';
import { WroteToolbar } from './block/wrote-toolbar.js';
import { WroteActionDropdown } from './block/wrote-action-dropdown.js';

export class WroteEditor {
  /**
   * @param {HTMLElement} containerElement - The container for the editor
   * @param {Object} options - Configuration options
   * @param {Function} [options.actionProvider] - Function that takes a block and returns an array of actions
   */
  constructor(containerElement, { actionProvider } = {}) {
    this.container = containerElement;
    this.rootComponent = new VerticalLayout();
    this.toolbar = new WroteToolbar();
    this.actionDropdown = new WroteActionDropdown();
    this.actionProvider = actionProvider;
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
  }

  showActionDropdown(block, range) {
    if (!this.actionProvider) return;
    const actions = this.actionProvider(block);
    this.actionDropdown.show({ actions, block, range });
  }

  canWrite() {
    return !this.actionDropdown.isVisible;
  }
}
