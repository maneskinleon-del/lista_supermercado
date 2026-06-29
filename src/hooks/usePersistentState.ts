/**
 * usePersistentState — like useState, but mirrors the value to localStorage
 * with a debounce so we don't JSON.stringify on every keystroke.
 *
 * Uses the safeGet / safeSet helpers from utils/localStorage so corrupted
 * entries don't crash the app.
 */

import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { safeGet, safeSet, type StorageKey } from "../utils/localStorage";
import { PERSIST_DEBOUNCE_MS } from "../utils/constants";

interface UsePersistentStateOptions<T> {
  /** Optional transformation applied on read (e.g. migration). */
  deserialize?: (value: T) => T;
  /** Optional transformation applied before write. */
  serialize?: (value: T) => unknown;
  /** Debounce window in ms. Defaults to PERSIST_DEBOUNCE_MS. */
  debounceMs?: number;
}

export function usePersistentState<T>(
  key: StorageKey,
  fallback: T,
  options: UsePersistentStateOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>] {
  const { deserialize, serialize, debounceMs = PERSIST_DEBOUNCE_MS } = options;

  const [value, setValue] = useStateLazy<T>(() => {
    const stored = safeGet<T>(key, fallback);
    return deserialize ? deserialize(stored) : stored;
  });

  const writeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (writeTimerRef.current !== null) {
      window.clearTimeout(writeTimerRef.current);
    }
    writeTimerRef.current = window.setTimeout(() => {
      const payload = serialize ? (serialize(value) as T) : value;
      safeSet(key, payload);
      writeTimerRef.current = null;
    }, debounceMs);

    return () => {
      if (writeTimerRef.current !== null) {
        window.clearTimeout(writeTimerRef.current);
        writeTimerRef.current = null;
      }
    };
  }, [value, key, serialize, debounceMs]);

  const setValueStable = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      setValue((prev) =>
        typeof next === "function"
          ? (next as (prev: T) => T)(prev)
          : next,
      );
    },
    [setValue],
  );

  return [value, setValueStable];
}

// Lazy useState — exported as a local helper to keep imports tidy and
// avoid pulling React into every consumer of this module.
import { useState } from "react";
function useStateLazy<T>(initial: () => T) {
  return useState<T>(initial);
}
