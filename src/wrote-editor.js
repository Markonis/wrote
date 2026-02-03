import { WroteBlock } from './block/wrote-block.js';
import { VerticalLayout } from './component/vertical-layout.js';
import { WroteToolbar } from './block/wrote-toolbar.js';

export class WroteEditor {
  constructor(containerElement) {
    this.container = containerElement;
    this.rootComponent = new VerticalLayout();
    this.toolbar = new WroteToolbar();
    this.rootComponent.editor = this;
    this.init();
  }

  init() {
    const block = new WroteBlock(this.rootComponent);
    this.rootComponent.blocks.push(block);
    this.container.appendChild(this.toolbar.getElement());
    this.container.appendChild(block.element);
    block.focus();
  }
}
