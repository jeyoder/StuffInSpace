import Window from './window';

const windowBaseZ = 100;

class WindowManager {
  constructor () {
    this.windows = [];
    this.windowsById = {};
    this.initialOpen = false;
  }

  bringWindowToFront (window) {
    const windowElement = window.element;

    let windowIdx = -1;
    for (let i = 0; i < this.windows.length; i++) {
      if (this.windows[i].id === windowElement.id) {
        windowIdx = i;
        break;
      }
    }

    if (windowIdx > -1) {
      this.windows.splice(windowIdx, 1);
      this.windows.push(window);
    }

    for (let i = 0; i < this.windows.length; i++) {
      this.windows[i].element.style.zIndex = windowBaseZ + i + 1;
    }
  }

  registerWindow (windowId, options = {}) {
    const window = new Window(windowId, options);
    window.setWindowManager(this);
    this.windows.push(window);
    this.windowsById[windowId] = window;
    this.makeDraggable(window);
  }

  getTopWindow () {
    for (let i = this.windows.length - 1; i >= 0; i--) {
      if (this.windows[i].isOpen()) {
        return this.windows[i];
      }
    }

    return undefined;
  }

  openWindow (windowId) {
    const newWindowOffset = 42;
    const initialLocation = { x: 100, y: 100 };

    const windowToOpen = this.windowsById[windowId];
    const topWindow = this.getTopWindow();
    let firstOpen = false;

    if (windowToOpen) {
      let { x, y } = windowToOpen.getLocation();

      if (!topWindow) {
        x = initialLocation.x;
        y = initialLocation.y;
        this.initialOpen = false;
      }

      firstOpen = windowToOpen.firstOpen;

      // logic to tile windows
      if (firstOpen && topWindow) {
        const location = topWindow.getLocation();
        x = location.x + newWindowOffset;
        y = location.y + newWindowOffset;
      }

      windowToOpen.open();

      if (!this.initialOpen && !firstOpen) {
        const location = windowToOpen.getLocation();
        x = location.x;
        y = location.y;
      }

      if (x > window.innerWidth || x < 0) {
        x = initialLocation.x;
      }

      if (y > window.innerHeight || y < 0) {
        y = initialLocation.y;
      }

      this.bringWindowToFront(windowToOpen);
      windowToOpen.moveTo(x, y);
      this.initialOpen = false;
    }
  }

  closeWindow (windowId) {
    const window = this.windowsById[windowId];
    if (window) {
      window.close();
    }
  }

  makeDraggable (window) {
    let elemTop = 0;
    let elemLeft = 0;
    let initialX = 0;
    let initialY = 0;

    const element = window.element;
    const dragZone = element.querySelector('.drag-zone') || element;

    function onMouseMove (event) {
      const top = `${elemTop - (initialY - event.clientY)}px`;
      const left = `${elemLeft - (initialX - event.clientX)}px`;
      element.style.top = top;
      element.style.left = left;
    }

    element.classList.add('draggable');

    element.addEventListener('click', () => {
      this.bringWindowToFront(window);
    });

    dragZone.addEventListener('mousedown', (event) => {
      event.preventDefault();
      elemLeft = element.offsetLeft;
      elemTop = element.offsetTop; // - 250);
      initialX = event.clientX;
      initialY = event.clientY;

      this.bringWindowToFront(window);

      element.style.right = 'unset';
      element.style.bottom = 'unset';
      element.style.left = `${elemLeft}px`;
      element.style.top = `${elemTop}px`;

      element.classList.add('dragging');
      dragZone.addEventListener('mousemove', onMouseMove);
    });

    element.addEventListener('mouseup', (event) => {
      event.preventDefault();
      dragZone.removeEventListener('mousemove', onMouseMove);
      element.classList.remove('dragging');
    });

    element.addEventListener('mouseout', (event) => {
      event.preventDefault();
      dragZone.removeEventListener('mousemove', onMouseMove);
      element.classList.remove('dragging');
    });
  }
}

export default new WindowManager();
