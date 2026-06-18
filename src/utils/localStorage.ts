// src/utils/localStorage.ts - Safe localStorage wrapper with error handling

type StorageKey =
  | 'superlista_items'
  | 'superlista_categories'
  | 'superlista_history'
  | 'superlista_config'
  | 'superlista_templates';

interface StorageOperation<T> {
  (): T;
}

interface AsyncStorageOperation<T> {
  (): Promise<T>;
}

const STORAGE_PREFIX = 'superlista_';

/**
 * Safe localStorage get with error handling
 */
export function safeGet<T>(key: StorageKey, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return fallback;
    }
    return JSON.parse(stored) as T;
  } catch (error) {
    console.warn(`[localStorage] Failed to read ${key}:`, error);
    // Try to clear corrupted entry
    try {
      localStorage.removeItem(key);
    } catch (clearError) {
      console.error(`[localStorage] Failed to clear corrupted ${key}:`, clearError);
    }
    return fallback;
  }
}

/**
 * Safe localStorage set with error handling
 */
export function safeSet<T>(key: StorageKey, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(`[localStorage] Quota exceeded for ${key}. Attempting cleanup...`);
      // Attempt to clean old history entries
      try {
        const historyKey = 'superlista_history' as StorageKey;
        const history = safeGet(historyKey, []);
        if (Array.isArray(history) && history.length > 50) {
          const trimmed = history.slice(0, 50);
          safeSet(historyKey, trimmed);
          // Retry
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        }
      } catch (cleanupError) {
        console.error('[localStorage] Cleanup failed:', cleanupError);
      }
    } else {
      console.warn(`[localStorage] Failed to write ${key}:`, error);
    }
    return false;
  }
}

/**
 * Safe localStorage remove
 */
export function safeRemove(key: StorageKey): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[localStorage] Failed to remove ${key}:`, error);
    return false;
  }
}

/**
 * Safe localStorage clear (all superlista keys)
 */
export function safeClearAll(): boolean {
  try {
    const keys = [
      'superlista_items',
      'superlista_categories',
      'superlista_history',
      'superlista_config',
      'superlista_templates',
    ] as StorageKey[];

    keys.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.warn('[localStorage] Failed to clear all:', error);
    return false;
  }
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: number; available: number; percentage: number } | null {
  if (!navigator.storage?.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      available: estimate.quota || 0,
      percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
    };
  } catch (error) {
    console.warn('[localStorage] Storage estimate unavailable:', error);
    return null;
  }
}

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  ITEMS: 'superlista_items' as StorageKey,
  CATEGORIES: 'superlista_categories' as StorageKey,
  HISTORY: 'superlista_history' as StorageKey,
  CONFIG: 'superlista_config' as StorageKey,
  TEMPLATES: 'superlista_templates' as StorageKey,
} as const;