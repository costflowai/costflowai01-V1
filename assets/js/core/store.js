// State management and persistence utilities

const STORAGE_PREFIX = 'costflowai_';

export function saveState(key, state) {
  try {
    const fullKey = STORAGE_PREFIX + key;
    localStorage.setItem(fullKey, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn('Failed to save state:', error);
    return false;
  }
}

export function loadState(key) {
  try {
    const fullKey = STORAGE_PREFIX + key;
    const stored = localStorage.getItem(fullKey);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load state:', error);
    return null;
  }
}

export function clearState(key) {
  try {
    const fullKey = STORAGE_PREFIX + key;
    localStorage.removeItem(fullKey);
    return true;
  } catch (error) {
    console.warn('Failed to clear state:', error);
    return false;
  }
}

export function clearAllStates() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.warn('Failed to clear all states:', error);
    return false;
  }
}

export function getStorageSize() {
  try {
    let totalSize = 0;
    const keys = Object.keys(localStorage);

    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        totalSize += localStorage.getItem(key).length;
      }
    });

    return totalSize;
  } catch (error) {
    console.warn('Failed to calculate storage size:', error);
    return 0;
  }
}

// Session-only storage (doesn't persist across browser sessions)
const sessionStore = new Map();

export function saveSessionState(key, state) {
  try {
    sessionStore.set(key, JSON.parse(JSON.stringify(state))); // Deep clone
    return true;
  } catch (error) {
    console.warn('Failed to save session state:', error);
    return false;
  }
}

export function loadSessionState(key) {
  try {
    return sessionStore.get(key) || null;
  } catch (error) {
    console.warn('Failed to load session state:', error);
    return null;
  }
}

export function clearSessionState(key) {
  try {
    sessionStore.delete(key);
    return true;
  } catch (error) {
    console.warn('Failed to clear session state:', error);
    return false;
  }
}