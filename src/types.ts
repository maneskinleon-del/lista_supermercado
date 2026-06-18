/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ShoppingItem {
  id: string;
  name: string;
  category: string; // e.g. "Lácteos"
  quantity: number;
  checked: boolean;
  price?: number; // optional, for stats
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  presets: string[];
}

export interface HistoryEntry {
  id: string;
  title: string;
  date: string; // ISO string or human formatted like "Hoy, 5 de Junio"
  timestamp: number; // For sorting
  items: ShoppingItem[];
  totalPrice: number;
}

export interface ShoppingTemplate {
  id: string;
  title: string;
  description: string;
  items: { name: string; category: string; quantity: number }[];
}

export interface AppConfig {
  monthlyBudget: number;
  currency: string; // e.g. "$" or "€"
  userName: string;
}
