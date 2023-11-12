class EventManager {
  listeners: Record<string, Set<any>> = {};

  cobstructor () {
    // not implemented
  }

  addEventListener (eventName: string, listener: any) {
    if (!eventName) {
      throw new Error('undefined eventName');
    }

    eventName = eventName.toLowerCase();

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
    if (!eventName) {
      throw new Error('undefined eventName');
    }

    eventName = eventName.toLowerCase();

    if (this.listeners[eventName]) {
      const listenerSet = this.listeners[eventName];
      listenerSet.forEach((listener) => {
        listener(data);
      });
    }
  }
}

export default EventManager;
