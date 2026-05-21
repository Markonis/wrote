import { COMPONENT_TYPES } from './serde-constants.js';
import { sanitizeHTML } from './sanitizer.js';
import { VerticalLayout } from '../component/vertical-layout.js';

/** @import { WroteComponent } from '../component/wrote-component.js' */
/** @import { WroteBlock } from '../block/wrote-block.js' */

/**
 * @typedef {Object} SerializedBlock
 * @property {string} style
 * @property {number} indent
 * @property {string} prefix
 * @property {string} content
 */

/**
 * @typedef {Object} SerializedComponent
 * @property {string} type
 * @property {SerializedBlock[]} blocks
 */

/**
 * Serialize a component to JSON
 * @param {WroteComponent} component - The component to serialize
 * @returns {SerializedComponent} JSON representation of the component
 */
export function serializeComponent(component) {
  if (component instanceof VerticalLayout) {
    return {
      type: COMPONENT_TYPES.VERTICAL_LAYOUT,
      blocks: component.blocks.map(block => serializeBlock(block))
    };
  }

  throw new Error(`Unsupported component type: ${component.constructor.name}`);
}

/**
 * Serialize a single block to JSON
 * @param {WroteBlock} block - The block to serialize
 * @returns {SerializedBlock} JSON representation of the block
 */
export function serializeBlock(block) {
  return {
    style: block.style,
    indent: block.prefix.getIndent(),
    prefix: block.prefix.getValue(),
    content: sanitizeHTML(block.contentElement.innerHTML)
  };
}
