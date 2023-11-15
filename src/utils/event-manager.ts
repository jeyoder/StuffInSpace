class EventManager {
  listeners: Record<string, Set<any>> = {};
  supportedEvents: string[] | undefined;

  constructor (supportedEvents?: string[]) {
    this.supportedEvents = supportedEvents;
  }

  addEventListener (eventName: string, listener: any) {
    if (!eventName) {
      throw new Error('eventName must not be undefined');
    }

    if (this.supportedEvents && this.supportedEvents.indexOf(eventName) < 0) {
      throw new Error(`unsupported event ${eventName}`);
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
