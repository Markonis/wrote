import { BULLET_ICON, CHECKED_ICON, UNCHECKED_ICON } from '../wrote-icons.js';

export class WroteBlockPrefix {
  static TYPES = {
    checked: 'checked',
    unchecked: 'unchecked',
    bullet: 'bullet'
  };

  static PATTERNS = [
    { pattern: /^[-\*]/, prefix: 'bullet' },
    { pattern: /^\[x\]\s?/, prefix: 'checked' },
    { pattern: /^\[\]\s?/, prefix: 'unchecked' }
  ];

  static ICON_MAP = {
    bullet: BULLET_ICON,
    checked: CHECKED_ICON,
    unchecked: UNCHECKED_ICON
  };

  static getPrefixIcon(prefix) {
    if (!prefix) {
      return null;
    }
    return WroteBlockPrefix.ICON_MAP[prefix];
  }

  static detectPrefixPattern(text) {
    for (const { pattern, prefix } of WroteBlockPrefix.PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        return {
          prefix,
          matchLength: match[0].length
        };
      }
    }
    return null;
  }

  constructor(indentUnit = '1.5rem') {
    this.value = null;
    this.indent = 0;
    this.unit = indentUnit;
    this.element = document.createElement('div');
    this.element.className = 'wrote-prefix';
    this.element.style.marginRight = '0.25rem';

    this.element.addEventListener('click', () => this.toggle());
  }

  setValue(newValue) {
    if (this.isValid(newValue)) {
      this.value = newValue;
      this.render();
    }
  }

  setIndent(newIndent) {
    if (newIndent >= 0) {
      this.indent = newIndent;
      this.applyIndentStyle();
    }
  }

  toggle() {
    if (this.value === WroteBlockPrefix.TYPES.checked) {
      this.setValue(WroteBlockPrefix.TYPES.unchecked);
    } else if (this.value === WroteBlockPrefix.TYPES.unchecked) {
      this.setValue(WroteBlockPrefix.TYPES.checked);
    }
  }

  render() {
    this.element.innerHTML = '';
    this.element.className = 'wrote-prefix';

    // Set cursor style based on whether prefix is clickable
    if (this.isClickable()) {
      this.element.style.cursor = 'pointer';
    } else {
      this.element.style.cursor = 'default';
    }

    if (!this.value) {
      this.applyIndentStyle();
      return;
    }

    const svgString = WroteBlockPrefix.getPrefixIcon(this.value);
    if (svgString) {
      this.element.innerHTML = svgString;
    }

    this.applyIndentStyle();
  }

  applyIndentStyle() {
    this.element.style.marginLeft = `calc(${this.indent} * ${this.unit})`;
  }

  isClickable() {
    return (
      this.value === WroteBlockPrefix.TYPES.checked ||
      this.value === WroteBlockPrefix.TYPES.unchecked
    );
  }

  isValid(value) {
    return (
      value === null ||
      value === WroteBlockPrefix.TYPES.bullet ||
      value === WroteBlockPrefix.TYPES.checked ||
      value === WroteBlockPrefix.TYPES.unchecked
    );
  }

  getElement() {
    return this.element;
  }

  getValue() {
    return this.value;
  }

  getIndent() {
    return this.indent;
  }

  detectAndApply(text) {
    const result = WroteBlockPrefix.detectPrefixPattern(text);
    if (result) {
      this.setValue(result.prefix);
      return result.matchLength;
    }
    return 0;
  }
}
