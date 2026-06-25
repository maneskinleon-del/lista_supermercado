/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HistoryEntry, ShoppingItem } from "../types";
import { Search, RotateCcw, Eye, Trash2, Check, History, TrendingUp, BarChart2, DollarSign, X, ShoppingCart } from "lucide-react";
import { formatCurrency, CurrencyCode } from "../utils/format";

interface HistoryListProps {
  history: HistoryEntry[];
  currency: string;
  onReplayList: (id: string) => void;
  onDeleteHistoryEntry: (id: string) => void;
}

export default function HistoryList({
  history,
  currency,
  onReplayList,
  onDeleteHistoryEntry,
}: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  // Filter history entries by name or items contained or ID
  const filteredHistoryEntries = history.filter((entry) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.id.toLowerCase().includes(q) ||
      entry.date.toLowerCase().includes(q) ||
      entry.items.some((item) => item.name.toLowerCase().includes(q))
    );
  });

  // Calculate statistics
  const totalSpentThisMonth = history.reduce((sum, entry) => sum + entry.totalPrice, 0);
  const totalItemsCountBoughtObj: Record<string, number> = {};
  let totalBoughtUnits = 0;

  history.forEach((entry) => {
    entry.items.forEach((item) => {
      totalItemsCountBoughtObj[item.name] = (totalItemsCountBoughtObj[item.name] || 0) + item.quantity;
      totalBoughtUnits += item.quantity;
    });
  });

  // Sort and display top 5 products ranking
  const topBoughtProducts = Object.entries(totalItemsCountBoughtObj)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column: Timeline details */}
      <section className="flex-1 max-w-3xl space-y-6">
        {/* Search tool block */}
        <div className="space-y-4">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-background-app">Historial</h2>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant-app">
              <Search className="w-5 h-5 text-outline-app group-focus-within:text-primary-app transition-colors" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en compras pasadas..."
              className="w-full h-12 pl-12 pr-4 bg-surface-container rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary-app font-body-md text-on-surface-app shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Timeline block */}
        <div className="space-y-8 relative pl-4 border-l border-outline-variant-app/60 ml-4 pt-2">
          {filteredHistoryEntries.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant-app -ml-4">
              <History className="w-12 h-12 text-outline-app opacity-40 mx-auto mb-3" />
              <p className="font-body-lg font-medium text-on-surface-variant-app">No se encontraron compras pasadas.</p>
              <p className="text-xs text-outline-app mt-1">Tu historial aparecerá aquí cuando finalices compras vacías.</p>
            </div>
          ) : (
            filteredHistoryEntries.map((entry, index) => {
              // Extract unique categories for showing tags
              const categoriesInEntry = Array.from(new Set(entry.items.map((i) => i.category))).slice(0, 3);
              const isFirst = index === 0;

              return (
                <div key={entry.id} className="relative timeline-item pl-6 pb-2">
                  {/* Circle indicator on timeline border */}
                  <div className={`absolute -left-10 top-2 w-7 h-7 rounded-full flex items-center justify-center z-10 shadow-sm border border-outline-variant-app ${
                    isFirst ? "bg-primary-app text-on-primary-app" : "bg-surface-dim-app text-on-surface-variant-app"
                  }`}>
                    {isFirst ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <History className="w-4 h-4" />
                    )}
                  </div>

                  {/* Header subtitle holding date */}
                  <p className={`font-label-lg uppercase tracking-wider mb-3 select-none ${
                    isFirst ? "text-primary-app font-extrabold" : "text-on-surface-variant-app font-semibold"
                  }`}>
                    {entry.date}
                  </p>

                  {/* Card panel */}
                  <div className="bg-surface-container-lowest border border-outline-variant-app p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
                    
                    {/* Trash Delete icon on the top right */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Seguro que deseas eliminar esta compra (${entry.title}) de Historial?`)) {
                          onDeleteHistoryEntry(entry.id);
                        }
                      }}
                      className="absolute right-4 top-4 p-1 rounded-lg text-outline-app hover:text-error-app hover:bg-error-container-app transition-colors duration-150 cursor-pointer"
                      title="Eliminar del historial"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="space-y-4">
                      {/* Left header titles */}
                      <div className="pr-8">
                        <h4 className="font-headline-md font-bold text-on-surface-app">
                          {entry.title}
                        </h4>
                        <p className="text-xs font-mono font-semibold text-outline-app tracking-wide mt-0.5">
                          ID: #{entry.id}
                        </p>
                        <p className="font-body-md text-on-surface-variant-app mt-2">
                          <span className="font-extrabold text-on-surface-app">{entry.items.length} productos</span>
                          <span className="mx-2 opacity-50">•</span>
                          Total: <span className="font-extrabold text-primary-app">{formatCurrency(entry.totalPrice, currency as CurrencyCode)}</span>
                        </p>
                      </div>

                      {/* Displaying unique visual categorizer chips */}
                      {categoriesInEntry.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {categoriesInEntry.map((cat) => (
                            <span
                              key={cat}
                              className="bg-surface-container-high font-bold text-xs text-on-surface-variant-app px-3 py-1 rounded-full border border-outline-variant-app/50"
                            >
                              {cat}
                            </span>
                          ))}
                          {entry.items.map(i => i.category).length > 3 && (
                            <span className="bg-surface-container-high/80 text-xs text-outline-app px-2.5 py-1 rounded-full font-bold">
                              +{Array.from(new Set(entry.items.map((i) => i.category))).length - 3} más
                            </span>
                          )}
                        </div>
                      )}

                      {/* Detail triggers & Relist controls */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => onReplayList(entry.id)}
                          className="flex items-center justify-center gap-1.5 bg-primary-app hover:bg-primary-container-app text-on-primary-app h-11 rounded-xl font-label-lg text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-sm select-none"
                        >
                          <svg
                            className="w-4 h-4 fill-none stroke-[2.5]"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                            />
                          </svg>
                          Reutilizar lista
                        </button>

                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="flex items-center justify-center gap-1.5 border-2 border-outline-variant-app text-on-surface-app hover:bg-surface-container-low h-11 rounded-xl font-label-lg text-sm font-bold transition-all active:scale-95 cursor-pointer select-none"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Right Column: Statistics Bento sidebar */}
      <aside className="w-full lg:w-80 space-y-6">
        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant-app shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2 border-b border-outline-variant-app/70 pb-3">
            <BarChart2 className="w-5 h-5 text-primary-app stroke-[2.5]" />
            <h3 className="font-headline-md font-bold text-on-surface-app">Estadísticas</h3>
          </div>

          {/* Monthly Spend accumulator bento metrics */}
          <div className="space-y-1 bg-white p-4.5 rounded-2xl border border-outline-variant-app/60 shadow-xs">
            <p className="text-xs font-bold text-outline-app uppercase tracking-wider">
              Gasto acumulado (Historial)
            </p>
            <p className="text-3xl font-extrabold text-[#005db7] tracking-tight">
              {formatCurrency(totalSpentThisMonth, currency as CurrencyCode)}
            </p>
            <div className="pt-2 flex items-center gap-1 text-primary-app text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-primary-app" />
              <span>12% más eficiente este mes</span>
            </div>
          </div>

          {/* Ranking products most purchased list */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-on-surface-variant-app uppercase tracking-wider">
              Productos más comprados
            </p>

            {topBoughtProducts.length === 0 ? (
              <p className="text-xs text-outline-app italic">Agrega productos para registrar estadísticas de compra.</p>
            ) : (
              <ul className="space-y-3">
                {topBoughtProducts.map((prod, index) => {
                  const numArr = ["bg-primary-app text-white", "bg-[#64a1ff] text-white", "bg-surface-container-high text-on-surface-app", "bg-surface-container-high text-on-surface-app", "bg-surface-container-high text-on-surface-app"];
                  return (
                    <li key={prod.name} className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-none">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold select-none ${numArr[index] || "bg-surface-container-high"}`}>
                          {index + 1}
                        </span>
                        <span className="font-body-md text-sm text-on-surface-app font-medium">{prod.name}</span>
                      </div>
                      <span className="font-label-lg text-xs font-bold text-on-surface-variant-app rounded-md bg-surface-container-high px-2 py-0.5">
                        {prod.count}x
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Total global stats Mini Card, green palette corresponding to screenshot */}
        <div className="bg-primary-container-app text-on-primary-container-app p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute right-[-10px] top-[-10px] opacity-10">
            <ShoppingCart className="w-28 h-28 stroke-[1.5]" />
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">🛍️</span>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
              Total compras
            </span>
          </div>
          <div>
            <p className="text-4xl font-extrabold tracking-tight select-none">
              {totalBoughtUnits}
            </p>
            <p className="text-xs opacity-90 font-bold uppercase tracking-wider mt-1">
              Productos adquiridos en total
            </p>
          </div>
        </div>
      </aside>

      {/* Detail drawer / Side Sheet modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-outline-variant-app shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-start border-b border-outline-variant-app pb-3">
              <div>
                <h3 className="font-headline-md font-bold text-primary-app">
                  Detalle de Compra
                </h3>
                <p className="text-xs text-outline-app font-bold font-mono">ID: #{selectedEntry.id}</p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-lg hover:bg-surface-container-low transition-colors text-outline-app cursor-pointer"
                title="Cerrar detalle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-semibold select-none bg-surface-container-low/60 p-3 rounded-xl border border-outline-variant-app/40">
                <span className="text-on-surface-variant-app">Lista: {selectedEntry.title}</span>
                <span className="text-primary-app font-bold">{selectedEntry.date}</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedEntry.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-white p-3 rounded-xl border border-outline-variant-app/50 text-sm shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary-container-app text-on-primary-container-app flex items-center justify-center text-[10px] font-extrabold select-none">
                        ✓
                      </span>
                      <span className="font-bold text-on-surface-app">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-outline-app font-medium select-none bg-surface-container px-2 py-0.5 rounded">
                        x{item.quantity}
                      </span>
                      {item.price && (
                        <span className="font-mono text-outline-app font-semibold text-xs text-right">
                          {formatCurrency(item.price * item.quantity, currency as CurrencyCode)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-outline-variant-app/60 pt-4 flex justify-between items-center bg-surface-container-low p-4 rounded-2xl select-none border">
                <span className="font-bold text-on-surface-app text-sm">Gasto total liquidado:</span>
                <span className="font-headline-md font-extrabold text-primary-app">
                  {formatCurrency(selectedEntry.totalPrice, currency as CurrencyCode)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high hover:text-on-surface-app font-bold rounded-xl text-on-surface-variant-app text-sm cursor-pointer transition-all active:scale-95"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  onReplayList(selectedEntry.id);
                  setSelectedEntry(null);
                }}
                className="px-5 py-2.5 bg-primary-app hover:bg-primary-container-app font-bold rounded-xl text-on-primary-app text-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                <RotateCcw className="w-4 h-4 text-white" />
                Cargar esta Lista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
