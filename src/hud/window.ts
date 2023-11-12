class Window {
  constructor (windowId, options = {}) {
    this.element = document.querySelector(`#${windowId}`);
    this.id = windowId;
    this.options = options;
    this.listeners = {};
    this.firstOpen = true;
    this.initEvents();
  }

  setWindowManager (windowManager) {
    this.windowManager = windowManager;
  }

  open () {
    this.firstOpen = false;
    this.element.classList.add('active');
    this.element.classList.add('visible');
    this.element.classList.remove('hidden');
    this.windowManager.bringWindowToFront(this);
  }

  close () {
    this.element.classList.remove('active');
    this.element.classList.remove('visible');
    this.element.classList.add('hidden');
  }

  isOpen () {
    return this.element.classList.contains('visible');
  }

  initEvents () {
    const closeButton = this.element.querySelector('.window-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.close();
      });
    }
  }

  moveTo (x, y) {
    this.element.style.top = `${y}px`;
    this.element.style.left = `${x}px`;
  }

  getLocation () {
    if (this.element.style.x) {
      return {
        x: this.element.style.x,
        y: this.element.style.y
      };
    }

    return {
      x: this.element.offsetLeft,
      y: this.element.offsetTop
    };
  }

  addEventListener (eventName, listener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = new Set();
    }

    if (this.listeners[eventName]) {
      this.listeners[eventName].add(listener);
    } else {
      throw new Error('unknown event');
    }
  }

  fireEvent (eventName, data) {
    if (this.listeners[eventName]) {
      const listenerSet = this.listeners[eventName];
      listenerSet.forEach((listener) => {
        listener(data);
      });
    }
  }
}

export default Window;
