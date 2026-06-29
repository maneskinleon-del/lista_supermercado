/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ShoppingItem, Category } from "../types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "panaderia", name: "Panadería", emoji: "🥖", presets: ["Pan de molde", "Pan de completo", "Pan de hamburguesa", "Galletas"] },
  { id: "lacteos", name: "Lácteos", emoji: "🥛", presets: ["Leche", "Yogurt", "Queso", "Mantequilla"] },
  { id: "despensa", name: "Abarrotes", emoji: "🥫", presets: ["Arroz", "Atún", "Fideos", "Aceite", "Azúcar"] },
  { id: "frutas", name: "Frutas y Verduras", emoji: "🍎", presets: ["Manzanas", "Plátano", "Tomate", "Cebolla", "Palta"] },
  { id: "carnes", name: "Carnicería y Fiambrería", emoji: "🥩", presets: ["Pollo", "Carne molida", "Jamón", "Salchichas"] },
  { id: "limpieza", name: "Limpieza", emoji: "🧴", presets: ["Cloro", "Detergente de ropa", "Jabón", "Papel higiénico"] },
  { id: "bebidas", name: "Bebidas", emoji: "🥤", presets: ["Agua", "Bebida", "Jugo", "Cerveza"] },
  { id: "congelados", name: "Congelados", emoji: "❄️", presets: ["Helado", "Papas fritas", "Hamburguesas", "Nuggets"] },
  { id: "otros", name: "Otros", emoji: "🧺", presets: ["Comida de perro", "Bolsas de basura"] },
];

export function categorizeItem(name: string): string {
  const norm = name.toLowerCase().trim();

  // Helper matching groups
  const matches = (keywords: string[]) => keywords.some(keyword => norm.includes(keyword));

  if (matches(["pan", "molde", "baguette", "flauta", "factura", "croissant", "galleta", "bizcocho", "torta", "pasteleria", "pastelería", "reposteria", "donas", "muffin"])) {
    return "Panadería";
  }
  if (matches(["leche", "queso", "yogurt", "yogur", "crema", "mantequilla", "margarina", "lacteo", "lácteo", "quesillo", "ricotta"])) {
    return "Lácteos";
  }
  if (matches(["detergente", "cloro", "lavandina", "jabon", "jabón", "desinfectante", "esponja", "papel", "higienico", "higiénico", "servilleta", "suavizante", "shampoo", "champú", "pasta de dientes", "dentifrico", "desodorante", "toalla"])) {
    return "Limpieza";
  }
  if (matches(["carne", "pollo", "pescado", "cerdo", "res", "bife", "chuleta", "jamon", "jamón", "salchicha", "parrilla", "tocino", "bacon", "salame", "mortadela", "pavo"])) {
    return "Carnicería y Fiambrería";
  }
  if (matches(["arroz", "atun", "atún", "frijol", "lenteja", "fideo", "pasta", "harina", "aceite", "sal", "azucar", "azúcar", "cafe", "café", "te", "té", "mayonesa", "ketchup", "mostaza", "salsa", "lata", "garbanzo", "cereal", "cereales", "galletitas", "vinagre", "pure", "puré"])) {
    return "Abarrotes";
  }
  if (matches(["manzana", "platano", "plátano", "fresa", "limon", "limón", "naranja", "uva", "verdura", "fruta", "lechuga", "tomate", "papa", "patata", "zanahoria", "cebolla", "ajo", "aguacate", "palta", "espinaca", "brocoli", "brócoli", "pimiento", "morron", "morrón", "pepino", "banana"])) {
    return "Frutas y Verduras";
  }
  if (matches(["agua", "refresco", "soda", "coca", "jugo", "cerveza", "vino", "gaseosa", "fanta", "sprite", "bebida", "energizante"])) {
    return "Bebidas";
  }
  if (matches(["helado", "congelado", "congelada", "congelados", "nuggets", "burger", "hamburguesa congelada", "papas fritas congeladas", "pizza"])) {
    return "Congelados";
  }

  return "Otros";
}

// Sample items matching the exact user screenshot on first render
export const INITIAL_ITEMS: ShoppingItem[] = [
  { id: "1", name: "Pan de molde", category: "Panadería", quantity: 1, checked: false, price: 1200 },
  { id: "2", name: "Leche", category: "Lácteos", quantity: 2, checked: false, price: 850 },
  { id: "3", name: "Atún", category: "Abarrotes", quantity: 3, checked: false, price: 1100 },
  { id: "4", name: "Arroz", category: "Abarrotes", quantity: 2, checked: true, price: 950 },
  { id: "5", name: "Cloro", category: "Limpieza", quantity: 1, checked: true, price: 1300 },
];

export const DEFAULT_SUGGESTIONS = [
  "🥚 Huevos",
  "🍎 Manzanas",
  "☕ Café",
  "🧻 Papel Higiénico",
  "🥛 Leche",
  "🥖 Pan de molde",
  "🥫 Atún",
  "🍌 Plátanos",
  "🍝 Pasta"
];
