/**
 * App-wide constants. Keep magic numbers out of components.
 */

export const MODAL_Z_INDEX = 60;
export const HEADER_Z_INDEX = 40;
export const SYNC_SPINNER_MS = 1200;
export const PERSIST_DEBOUNCE_MS = 250;

export const STORAGE_NAMESPACE = "superlista" as const;

export const TAB_IDS = ["lista", "precios", "plantillas", "config"] as const;
export type TabId = (typeof TAB_IDS)[number];

export const DEFAULT_SAVE_FEEDBACK_MS = 1500;
export const DEFAULT_APPLIED_FEEDBACK_MS = 1500;
