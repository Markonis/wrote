export const STYLES = {
  BODY: 'body',
  H1: 'h1',
  H2: 'h2',
  H3: 'h3'
};

export function getBlockStyleClass(style) {
  return `wr-block-${style}`;
}

export function detectBlockStyle(text) {
  // Match # , ## , or ### followed by a space at the start
  const match = text.match(/^(#{1,3})\s/);

  if (!match) {
    return null;
  }

  const hashCount = match[1].length;
  const matchLength = match[0].length;

  // Map hash count to style
  const styleMap = {
    1: STYLES.H1,
    2: STYLES.H2,
    3: STYLES.H3
  };

  return {
    style: styleMap[hashCount],
    matchLength
  };
}
