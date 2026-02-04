const DROPDOWN_PADDING = 5; // pixels below caret
const HIDDEN_CLASS = 'hidden';

function createActionItemHTML(label, index) {
  return `<div class="wr-action-item${index === 0 ? ' selected' : ''}" data-index="${index}">${label}</div>`;
}

export class WroteActionDropdown {
  constructor() {
    this.element = this.createDropdownElement();
    this.isVisible = false;
    this.actions = [];
    this.filteredActions = [];
    this.selectedIndex = 0;
    this.currentBlock = null;
    this.range = null;
    this.searchQuery = '';
    this.searchInput = null;
    this.itemsContainer = null;
    document.addEventListener('keydown', (e) => {
      if (this.isVisible) {
        this.handleKeyDown(e);
      }
    });
  }

  createDropdownElement() {
    const dropdown = document.createElement('div');
    dropdown.className = `wr-action-dropdown ${HIDDEN_CLASS}`;

    // Create search input
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.className = 'wr-action-search';
    this.searchInput.placeholder = 'Search actions...';
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.filterActions();
    });

    // Create container for action items
    this.itemsContainer = document.createElement('div');
    this.itemsContainer.className = 'wr-action-items';

    dropdown.appendChild(this.searchInput);
    dropdown.appendChild(this.itemsContainer);

    return dropdown;
  }

  getElement() {
    return this.element;
  }

  show({ actions, block, range }) {
    if (!actions || actions.length === 0) return;

    this.actions = actions;
    this.currentBlock = block;
    this.range = range;
    this.selectedIndex = 0;
    this.searchQuery = '';

    // Reset search input
    this.searchInput.value = '';

    // Filter and render
    this.filterActions();

    this.element.classList.remove(HIDDEN_CLASS);
    this.isVisible = true;

    // Focus search input
    this.searchInput.focus();

    // Position below the caret
    this.positionBelowCaret();
  }

  hide() {
    this.element.classList.add(HIDDEN_CLASS);
    this.isVisible = false;
    this.actions = [];
    this.filteredActions = [];
    this.currentBlock = null;
    this.range = null;
  }

  filterActions() {
    // Filter actions based on search query
    if (this.searchQuery.trim() === '') {
      this.filteredActions = this.actions;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredActions = this.actions.filter(action =>
        action.label.toLowerCase().includes(query)
      );
    }

    // Reset selection to first item
    this.selectedIndex = 0;

    // Render filtered items
    this.renderItems();
  }

  renderItems() {
    this.itemsContainer.innerHTML = this.filteredActions.map((action, index) =>
      createActionItemHTML(action.label, index)
    ).join('');
  }

  positionBelowCaret() {
    if (!this.currentBlock) return;

    const caretCoords = this.currentBlock.getCaretCoordinates();
    if (!caretCoords) return;

    const top = caretCoords.y + DROPDOWN_PADDING;
    const left = caretCoords.x + DROPDOWN_PADDING;

    this.element.style.top = top + 'px';
    this.element.style.left = left + 'px';
  }

  selectNext() {
    if (this.selectedIndex < this.filteredActions.length - 1) {
      this.selectedIndex++;
      this.updateSelection();
    }
  }

  selectPrevious() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.updateSelection();
    }
  }

  updateSelection() {
    const items = this.itemsContainer.querySelectorAll('.wr-action-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  selectCurrent() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredActions.length) {
      const action = this.filteredActions[this.selectedIndex];
      const block = this.currentBlock;
      const range = this.range;
      this.hide();

      // Delete the "/" before invoking the callback
      if (range) {
        range.deleteContents();
      }

      action.callback(block);
    }
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectNext();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectPrevious();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.selectCurrent();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.hide();
    }
  }
}
