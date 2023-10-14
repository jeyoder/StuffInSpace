class EventManager {
  constructor () {
    this.listeners = {};
  }

  addEventListener (eventName, listener) {
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

  fireEvent (eventName, data) {
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
