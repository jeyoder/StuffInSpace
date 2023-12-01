class Window {
  element?: HTMLElement;
  id: string;
  options?: Record<string, any>;
  listeners: Record<string, Set<(data: any) => void>>  ={};
  firstOpen = true;
  windowManager: any;

  constructor (windowId: string, options: Record<string, any> = {}) {
    this.element = document.querySelector(`#${windowId}`) as HTMLElement;
    this.id = windowId;
    this.options = options;
    this.listeners = {};
    this.firstOpen = true;
    this.initEvents();
  }

  setWindowManager (windowManager: any) {
    this.windowManager = windowManager;
  }

  open () {
    if (!this.element) {
      return;
    }

    this.firstOpen = false;
    this.element.classList.add('active');
    this.element.classList.add('visible');
    this.element.classList.remove('hidden');
    this.windowManager.bringWindowToFront(this);
  }

  close () {
    if (!this.element) {
      return;
    }

    this.element.classList.remove('active');
    this.element.classList.remove('visible');
    this.element.classList.add('hidden');
  }

  isOpen () {
    if (this.element) {
      return this.element.classList.contains('visible');
    }
    return false;
  }

  initEvents () {
    if (!this.element) {
      return;
    }

    const closeButton = this.element.querySelector('.window-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.close();
      });
    }
  }

  moveTo (x: number, y: number) {
    if (!this.element) {
      return;
    }

    this.element.style.top = `${y}px`;
    this.element.style.left = `${x}px`;
  }

  getLocation () {
    if (!this.element) {
      return {
        x: 0,
        y: 0
      };
    }

    const style: Record<string, any> = this.element.style as any;
    if (style.x) {
      return {
        x: style.x,
        y: style.y
      };
    }

    return {
      x: this.element.offsetLeft,
      y: this.element.offsetTop
    };
  }

  addEventListener (eventName: string, listener: (data: any) => void) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = new Set();
    }

    if (this.listeners[eventName]) {
      this.listeners[eventName].add(listener);
    } else {
      throw new Error('unknown event');
    }
  }

  fireEvent (eventName: string, data: any) {
    if (this.listeners[eventName]) {
      const listenerSet = this.listeners[eventName];
      listenerSet.forEach((listener) => {
        listener(data);
      });
    }
  }
}

export default Window;
