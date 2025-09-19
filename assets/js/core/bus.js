// Event bus for inter-component communication
// Pub/sub pattern for loose coupling between calculator components

class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.events.delete(event);
        }
      }
    };
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (...args) => {
      unsubscribe();
      callback(...args);
    });
    return unsubscribe;
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to callbacks
   */
  emit(event, ...args) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for '${event}':`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  off(event) {
    this.events.delete(event);
  }

  /**
   * Remove all listeners
   */
  clear() {
    this.events.clear();
  }

  /**
   * Get list of active events
   * @returns {string[]} Array of event names
   */
  getEvents() {
    return Array.from(this.events.keys());
  }

  /**
   * Get number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    const callbacks = this.events.get(event);
    return callbacks ? callbacks.size : 0;
  }
}

// Create global event bus instance
export const bus = new EventBus();

// Export class for custom instances
export { EventBus };

// Common events used throughout the application
export const EVENTS = {
  // Calculator events
  CALCULATOR_LOADED: 'calculator:loaded',
  CALCULATOR_UPDATED: 'calculator:updated',
  CALCULATOR_CALCULATED: 'calculator:calculated',
  CALCULATOR_RESET: 'calculator:reset',

  // Form events
  FORM_CHANGED: 'form:changed',
  FORM_VALIDATED: 'form:validated',
  FORM_SUBMITTED: 'form:submitted',

  // Data events
  DATA_LOADED: 'data:loaded',
  DATA_ERROR: 'data:error',
  PRICING_UPDATED: 'pricing:updated',

  // UI events
  RESULTS_UPDATED: 'results:updated',
  EXPORT_STARTED: 'export:started',
  EXPORT_COMPLETED: 'export:completed',
  EXPORT_ERROR: 'export:error'
};