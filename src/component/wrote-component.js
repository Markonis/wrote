export class WroteComponent {
  constructor() {
    this.parentComponent = null;
  }

  moveLeft(source) {
    throw new Error('moveLeft must be implemented by subclass');
  }

  moveRight(source) {
    throw new Error('moveRight must be implemented by subclass');
  }

  moveUp(source, caretX) {
    throw new Error('moveUp must be implemented by subclass');
  }

  moveDown(source, caretX) {
    throw new Error('moveDown must be implemented by subclass');
  }

  split(sourceBlock) {
    throw new Error('split must be implemented by subclass');
  }

  merge(sourceBlock) {
    throw new Error('merge must be implemented by subclass');
  }

  mergeForward(sourceBlock) {
    throw new Error('mergeForward must be implemented by subclass');
  }

  remove(block) {
    throw new Error('remove must be implemented by subclass');
  }
}
