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
  price?: number; // optional, only present if a price was set in the catalog
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  presets: string[];
}

export interface ShoppingTemplate {
  id: string;
  title: string;
  description: string;
  items: { name: string; category: string; quantity: number }[];
}

export interface AppConfig {
  monthlyBudget: number;
  currency: string; // e.g. "CLP", "$", "€"
  userName: string;
}
