import HudWindow from './HudWindow';

const windowBaseZ = 100;

class WindowManager {
  windows: HudWindow[] = [];
  windowsById: Record<string, HudWindow> = {};
  initialOpen = false;

  bringWindowToFront (window: HudWindow) {
    const windowElement = window.element;

    let windowIdx = -1;
    for (let i = 0; i < this.windows.length; i++) {
      if (this.windows[i].id === windowElement?.id) {
        windowIdx = i;
        break;
      }
    }

    if (windowIdx > -1) {
      this.windows.splice(windowIdx, 1);
      this.windows.push(window);
    }

    for (let i = 0; i < this.windows.length; i++) {
      const window = this.windows[i];
      if (window &&  window.element && window.element.style) {
        (window.element.style as any).zIndex = windowBaseZ + i + 1;
      }
    }
  }

  registerWindow (windowId: string, options: Record<string, any> = {}) {
    const window = new HudWindow(windowId, options);
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

  openWindow (windowId: string) {
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
        if (location) {
          // If location is on right side of screen, open new window to the left side
          if (location.x > window.innerWidth / 2) {
            x = location.x - newWindowOffset - 300;
          } else {
            x = location.x + newWindowOffset;
          }
          // If location is on bottom half of screen, open new window to the top
          if (location.y > window.innerHeight / 2) {
            y = location.y - newWindowOffset - 300;
          } else {
            y = location.y + newWindowOffset;
          }
        }
      }

      windowToOpen.open();

      if (!this.initialOpen && !firstOpen) {
        const location = windowToOpen.getLocation();
        if (location) {
          x = location.x;
          y = location.y;
        }
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

  closeWindow (windowId: string) {
    const window = this.windowsById[windowId];
    if (window) {
      window.close();
    }
  }

  makeDraggable (window: HudWindow) {
    let elemTop = 0;
    let elemLeft = 0;
    let initialX = 0;
    let initialY = 0;

    const element = window.element;

    if (!element) {
      return;
    }

    const dragZone = element.querySelector('.drag-zone') || element;

    function onMouseMove (event: any) {
      const top = `${elemTop - (initialY - event.clientY)}px`;
      const left = `${elemLeft - (initialX - event.clientX)}px`;
      if (element && element.style) {
        element.style.top = top;
        element.style.left = left;
      }
    }

    element.classList.add('draggable');

    element.addEventListener('click', () => {
      this.bringWindowToFront(window);
    });

    dragZone.addEventListener('mousedown', (event: any) => {
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

    element.addEventListener('mouseup', (event: any)  => {
      event.preventDefault();
      dragZone.removeEventListener('mousemove', onMouseMove);
      element.classList.remove('dragging');
    });

    element.addEventListener('mouseout', (event: any) => {
      event.preventDefault();
      dragZone.removeEventListener('mousemove', onMouseMove);
      element.classList.remove('dragging');
    });
  }
}

export default WindowManager;
