import { WroteBlock } from './block/wrote-block.js';
import { VerticalLayout } from './component/vertical-layout.js';
import { WroteToolbar } from './block/wrote-toolbar.js';
import { serializeComponent } from './serde/serializer.js';
import { deserializeComponent } from './serde/deserializer.js';

/** @import { SerializedComponent } from './serde/serializer.js' */

/**
 * @typedef {Object} WroteEditorOptions
 * @property {Object.<string, function(WroteBlock, Range): void>} [triggers] - Object mapping trigger characters to callbacks. Example: { '/': (block, range) => {...} }
 * @property {function(WroteBlock): void} [onBlockCreated] - Callback when a block is created
 * @property {function(WroteBlock): void} [onBlockRemoved] - Callback when a block is removed
 */

export class WroteEditor {
  /**
   * @param {HTMLElement} containerElement - The container for the editor
   * @param {WroteEditorOptions} [options] - Configuration options
   */
  constructor(containerElement, { triggers, onBlockCreated, onBlockRemoved } = {}) {
    /** @type {HTMLElement} */
    this.container = containerElement;
    // /** @type {VerticalLayout} */
    this.rootComponent = new VerticalLayout();
    /** @type {WroteToolbar} */
    this.toolbar = new WroteToolbar();
    /** @type {Object.<string, function(WroteBlock, Range): void>} */
    this.triggers = triggers || {};
    /** @type {function(WroteBlock): void | undefined} */
    this.onBlockCreated = onBlockCreated;
    /** @type {function(WroteBlock): void | undefined} */
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

  /**
   * @returns {SerializedComponent}
   */
  serialize() {
    return serializeComponent(this.rootComponent);
  }

  /**
   * @param {Object} json
   */
  deserialize(json) {
    this.rootComponent = deserializeComponent(json);
    this.rootComponent.editor = this;
  }
}
