import { setCaretPosition } from "../utils/selection.js"

/** @import { WroteBlock } from '../wrote-block.js' */

/**
 * @param {WroteBlock} block
 */
export function handleInput(block) {
  const brs = block.contentElement.querySelectorAll("br");
  for (const br of brs) {
    br.remove();
  }

  const lastNode = block.contentElement.lastChild;
  if (lastNode?.nodeType !== Node.TEXT_NODE) {
    const textNode = document.createTextNode(' ');
    block.contentElement.appendChild(textNode);
    setCaretPosition(textNode, 0);
  }

  return false;
}
