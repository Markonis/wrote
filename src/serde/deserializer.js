import { VerticalLayout } from '../component/vertical-layout.js';
import { WroteBlock } from '../block/wrote-block.js';
import { COMPONENT_TYPES } from './serde-constants.js';

/**
 * Deserialize a JSON object into a component
 * @param {Object} json - The JSON object to deserialize
 * @returns {WroteComponent} The deserialized component
 */
export function deserializeComponent(json) {
  if (json.type === COMPONENT_TYPES.VERTICAL_LAYOUT) {
    const component = new VerticalLayout();

    for (const blockJson of json.blocks) {
      const block = deserializeBlock(blockJson, component);
      component.blocks.push(block);
    }

    return component;
  }

  throw new Error(`Unsupported component type: ${json.type}`);
}

/**
 * Deserialize a block JSON into a WroteBlock
 * @param {Object} blockJson - The block JSON to deserialize
 * @param {WroteComponent} component - The parent component
 * @returns {WroteBlock}
 */
export function deserializeBlock(blockJson, component) {
  const block = new WroteBlock(component);

  // Set style
  if (blockJson.style) {
    block.setStyle(blockJson.style);
  }

  // Set indent and prefix
  if (blockJson.indent !== undefined && blockJson.indent > 0) {
    block.prefix.setIndent(blockJson.indent);
  }
  if (blockJson.prefix) {
    block.prefix.setValue(blockJson.prefix);
  }

  // Set content
  if (blockJson.content) {
    block.contentElement.innerHTML = blockJson.content;
  }

  return block;
}
