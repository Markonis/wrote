import { WroteBlock } from './block/wrote-block.js';
import { VerticalLayout } from './component/vertical-layout.js';

export class WroteEditor {
  constructor(containerElement) {
    this.container = containerElement;
    this.rootComponent = new VerticalLayout();
    this.init();
  }

  init() {
    const block = new WroteBlock(this.rootComponent);
    this.rootComponent.blocks.push(block);
    this.container.appendChild(block.element);
    block.focus();
  }
}
