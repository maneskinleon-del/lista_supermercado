/**
 * PriceCatalog - Pantalla para gestionar precios de productos
 */

import React, { useState } from "react";
import type { Category } from "../types";
import type { CurrencyCode } from "../utils/format";
import { formatCurrency } from "../utils/format";
import { Plus, Trash2, Search, Tag, Edit2, Check, X } from "lucide-react";

interface PriceCatalogProps {
  prices: Record<string, number>;
  categories: Category[];
  currency: string;
  onSavePrice: (productName: string, price: number) => void;
  onDeletePrice: (productName: string) => void;
}

export default function PriceCatalog({
  prices,
  categories,
  currency,
  onSavePrice,
  onDeletePrice,
}: PriceCatalogProps) {
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const priceEntries = Object.entries(prices);
  const totalProducts = priceEntries.length;

  const filteredEntries = priceEntries.filter(([name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category
  const groupedByCategory: Record<string, [string, number][]> = {};
  filteredEntries.forEach(([name, price]) => {
    const cat = categorizeByName(name, categories);
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push([name, price]);
  });

  const sortedCategories = Object.keys(groupedByCategory).sort();

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProductName.trim();
    const price = parseFloat(newProductPrice);
    if (!name || isNaN(price) || price <= 0) return;

    onSavePrice(name, price);
    setNewProductName("");
    setNewProductPrice("");
  };

  const handleEditSubmit = (originalName: string) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) return;
    onSavePrice(originalName, price);
    setEditingName(null);
    setEditPrice("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#bfcaba]/60 pb-3">
        <h2 className="text-xl font-bold text-[#181d17]">Lista de Precios</h2>
        <p className="text-xs font-semibold text-[#40493d] mt-0.5">
          Configura el precio de tus productos para calcular gastos con precisión.
        </p>
      </div>

      {/* Stats card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#bfcaba] shadow-sm">
          <p className="text-[10px] font-bold text-[#40493d] uppercase tracking-wider">Productos con precio</p>
          <p className="text-2xl font-extrabold text-[#0d631b] mt-1">{totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#bfcaba] shadow-sm">
          <p className="text-[10px] font-bold text-[#40493d] uppercase tracking-wider">Promedio</p>
          <p className="text-2xl font-extrabold text-[#005db7] mt-1">
            {totalProducts > 0
              ? formatCurrency(
                  Math.round(priceEntries.reduce((s, [, p]) => s + p, 0) / totalProducts),
                  currency as CurrencyCode
                )
              : "—"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#bfcaba] shadow-sm">
          <p className="text-[10px] font-bold text-[#40493d] uppercase tracking-wider">Más caro</p>
          <p className="text-2xl font-extrabold text-[#0d631b] mt-1">
            {totalProducts > 0
              ? formatCurrency(Math.max(...priceEntries.map(([, p]) => p)), currency as CurrencyCode)
              : "—"}
          </p>
        </div>
      </div>

      {/* Add price form */}
      <form onSubmit={handleAddSubmit} className="bg-white p-5 rounded-2xl border border-[#bfcaba] shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[#181d17] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#0d631b]" /> Agregar precio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            placeholder="Nombre del producto"
            className="w-full h-11 px-3 bg-[#f8faf6] border-2 border-[#bfcaba] rounded-xl text-sm focus:border-[#0d631b] outline-none"
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#40493d]">$</span>
            <input
              type="number"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
              placeholder="Precio"
              min="0"
              step="1"
              className="w-full h-11 pl-7 pr-3 bg-[#f8faf6] border-2 border-[#bfcaba] rounded-xl text-sm focus:border-[#0d631b] outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            className="h-11 bg-[#0d631b] hover:bg-[#2e7d32] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </form>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#40493d]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-[#bfcaba] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b]/20"
        />
      </div>

      {/* Price list grouped by category */}
      {totalProducts === 0 ? (
        <div className="text-center py-12 bg-[#f1f5eb] rounded-2xl border border-dashed border-[#bfcaba]">
          <Tag className="w-12 h-12 text-[#0d631b] opacity-30 mx-auto mb-3" />
          <p className="font-bold text-[#40493d]">No hay precios configurados</p>
          <p className="text-xs text-[#40493d]/70 mt-1">Agrega productos arriba para empezar a controlar tus gastos.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedCategories.map((cat) => (
            <div key={cat} className="space-y-2">
              <h4 className="text-[11px] font-bold text-[#0d631b] uppercase tracking-wider px-1">
                {cat}
              </h4>
              <div className="bg-white rounded-2xl border border-[#bfcaba] overflow-hidden divide-y divide-[#bfcaba]/50">
                {groupedByCategory[cat].map(([name, price]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#f1f5eb]/50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-[#181d17] truncate flex-1 mr-3">{name}</span>

                    {editingName === name ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#40493d]">$</span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            autoFocus
                            className="w-24 h-8 pl-6 pr-2 bg-[#f8faf6] border border-[#0d631b] rounded-lg text-xs font-mono focus:outline-none"
                          />
                        </div>
                        <button onClick={() => handleEditSubmit(name)} className="p-1 text-[#0d631b] hover:bg-[#c4f1c1] rounded transition-colors cursor-pointer">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingName(null)} className="p-1 text-[#40493d] hover:bg-[#ebefe5] rounded transition-colors cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingName(name);
                            setEditPrice(String(price));
                          }}
                          className="text-xs font-mono font-bold text-[#0d631b] bg-[#ebefe5] px-3 py-1.5 rounded-lg hover:bg-[#c4f1c1] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {formatCurrency(price, currency as CurrencyCode)}
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeletePrice(name)}
                          className="p-1.5 text-[#40493d] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors cursor-pointer"
                          title="Eliminar precio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function categorizeByName(name: string, categories: Category[]): string {
  const norm = name.toLowerCase();
  for (const cat of categories) {
    if (cat.presets?.some(p => norm.includes(p.toLowerCase()))) return cat.name;
  }
  return "Sin categoría";
}
