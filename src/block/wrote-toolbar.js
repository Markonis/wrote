const TOOLBAR_PADDING = 10; // pixels below selection
const ACTION_BOLD = 'bold';
const ACTION_ITALIC = 'italic';
const HIDDEN_CLASS = 'hidden';

const BUTTON_CONFIGS = [
  { action: ACTION_BOLD, label: '<strong>B</strong>', title: 'Bold' },
  { action: ACTION_ITALIC, label: '<em>I</em>', title: 'Italic' }
];

function createButtonHTML(action, label, title) {
  return `<button class="wr-toolbar-btn" data-action="${action}" title="${title}">${label}</button>`;
}

export class WroteToolbar {
  constructor() {
    this.element = this.createToolbarElement();
    this.isVisible = false;
    this.boldBtn = this.element.querySelector(`[data-action="${ACTION_BOLD}"]`);
    this.italicBtn = this.element.querySelector(`[data-action="${ACTION_ITALIC}"]`);
  }

  createToolbarElement() {
    const toolbar = document.createElement('div');
    toolbar.className = `wr-toolbar ${HIDDEN_CLASS}`;
    toolbar.innerHTML = BUTTON_CONFIGS.map(config =>
      createButtonHTML(config.action, config.label, config.title)
    ).join('');
    return toolbar;
  }

  getElement() {
    return this.element;
  }

  show(selectionRange) {
    if (!selectionRange) return;

    this.element.style.display = 'block';
    this.isVisible = true;

    // TODO: Position toolbar above selection
    const rect = selectionRange.getBoundingClientRect();
    const toolbarHeight = this.element.offsetHeight;
    const toolbarWidth = this.element.offsetWidth;
    const top = rect.top - toolbarHeight - TOOLBAR_PADDING;
    const left = rect.left + rect.width / 2 - toolbarWidth / 2;

    this.element.style.top = top + 'px';
    this.element.style.left = left + 'px';

    this.updateButtonStates();
  }

  hide() {
    this.element.style.display = 'none';
    this.isVisible = false;
  }

  updateButtonStates() {
    // TODO: Update button active states based on current formatting
  }

  onBoldClick(callback) {
    this.boldBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // TODO: Execute bold command
      callback?.();
    });
  }

  onItalicClick(callback) {
    this.italicBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // TODO: Execute italic command
      callback?.();
    });
  }
}
