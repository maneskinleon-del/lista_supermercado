/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { ShoppingItem, Category } from "../types";
import { DEFAULT_SUGGESTIONS, categorizeItem } from "../utils/categorizer";
import { Plus, Minus, Check, ShoppingCart, Trash2, FileText, CheckSquare, RefreshCw, Sparkles, FolderPlus, HelpCircle, ChevronDown } from "lucide-react";

interface ActiveListProps {
  items: ShoppingItem[];
  categories: Category[];
  currency: string;
  onAddItem: (name: string, categoryName?: string, quantity?: number) => void;
  onToggleItem: (id: string) => void;
  onUpdateQuantity: (id: string, amount: number) => void;
  onFinalizePurchase: () => void;
  onClearList: () => void;
  onImportList: (text: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItemCategory: (id: string, category: string) => void;
}

export default function ActiveList({
  items,
  categories,
  currency,
  onAddItem,
  onToggleItem,
  onUpdateQuantity,
  onFinalizePurchase,
  onClearList,
  onImportList,
  onRemoveItem,
  onUpdateItemCategory,
}: ActiveListProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<string>("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Inline quick-add state per category section
  const [quickAddCategory, setQuickAddCategory] = useState<string | null>(null);
  const [quickAddName, setQuickAddName] = useState("");
  const quickAddInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter items
  const activeItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const checkedItemCount = checkedItems.reduce((acc, item) => acc + item.quantity, 0);
  const progressPercentage = totalItemCount > 0 ? Math.round((checkedItemCount / totalItemCount) * 100) : 0;

  // Group active items by category
  const activeItemsByCategory: Record<string, ShoppingItem[]> = {};
  activeItems.forEach(item => {
    if (!activeItemsByCategory[item.category]) {
      activeItemsByCategory[item.category] = [];
    }
    activeItemsByCategory[item.category].push(item);
  });

  // Flat preset catalog
  const catalogPresets = categories.flatMap(cat => 
    (cat.presets || []).map(preset => ({
      name: preset,
      categoryName: cat.name,
      emoji: cat.emoji
    }))
  );

  const filteredPresets = newItemName.trim()
    ? catalogPresets.filter(p => p.name.toLowerCase().includes(newItemName.toLowerCase()))
    : [];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem(newItemName.trim(), newItemCategory || undefined);
    setNewItemName("");
    setNewItemCategory("");
  };

  const handleQuickAddSubmit = (e: React.FormEvent, categoryName: string) => {
    e.preventDefault();
    if (!quickAddName.trim()) return;

    onAddItem(quickAddName.trim(), categoryName);
    setQuickAddName("");
    // Keep the quick-add box open so the user can add several items in a row
    quickAddInputRef.current?.focus();
  };

  const handleChipClick = (suggestion: string) => {
    // strip the emoji if any
    const cleanName = suggestion.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
    onAddItem(cleanName);
  };

  const handleImportSubmit = () => {
    if (importText.trim()) {
      onImportList(importText);
      setImportText("");
      setImportModalOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onImportList(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Upper Progress Panel */}
      <section className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant-app transition-colors">
        <div className="flex justify-between items-center mb-2">
          <span className="font-label-lg text-primary-app flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Progreso de compra
          </span>
          <span className="font-label-lg font-bold text-primary-app">
            {checkedItemCount} / {totalItemCount} productos ({progressPercentage}%)
          </span>
        </div>
        <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary-app h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </section>

      {/* Input Search & Add field */}
      <section className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant-app shadow-sm space-y-4 relative z-20">
        <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
              placeholder="¿Qué necesitas comprar?"
              className="w-full h-14 pl-4 pr-12 bg-white border-2 border-outline-variant-app rounded-xl font-body-lg text-on-surface-app focus:border-primary-app focus:ring-0 transition-all outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-outline-app flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded pointer-events-none">
              <Sparkles className="w-3 h-3 text-primary-app" /> Auto
            </span>

            {/* Autocomplete Dropdown */}
            {showAutocomplete && filteredPresets.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-outline-variant-app rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto w-full">
                {filteredPresets.map((preset, i) => (
                  <button
                    key={`${preset.name}-${i}`}
                    type="button"
                    onClick={() => {
                      onAddItem(preset.name, preset.categoryName);
                      setNewItemName("");
                      setShowAutocomplete(false);
                    }}
                    className="w-full flex items-center justify-between p-4 border-b border-outline-variant-app/30 hover:bg-surface-container-lowest transition-colors cursor-pointer text-left last:border-0"
                  >
                    <span className="font-bold text-on-surface-app text-sm">
                      {preset.name}
                    </span>
                    <span className="text-xs bg-surface-container px-2 py-1 rounded text-on-surface-variant-app flex items-center gap-1">
                      {preset.emoji} {preset.categoryName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="h-14 px-3 bg-white border-2 border-outline-variant-app rounded-xl font-body-md text-on-surface-app focus:border-primary-app focus:ring-0 outline-none max-w-[140px] sm:max-w-[180px] cursor-pointer"
              title="Elegir categoría (opcional, si no se elige se detecta automáticamente)"
            >
              <option value="">Auto 🪄</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-14 w-14 bg-primary-app hover:bg-primary-container-app text-on-primary-app rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 flex-shrink-0"
              title="Añadir a la lista"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        </form>
      </section>

      {/* Active Items list by Smart Category */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-outline-variant-app pb-2">
          <h2 className="font-headline-md font-bold text-primary-app">Aún por comprar</h2>
          <span className="font-label-md text-on-surface-variant-app bg-surface-container px-2 py-1 rounded-md font-bold">
            {activeItems.length} {activeItems.length === 1 ? "pendiente" : "pendientes"}
          </span>
        </div>

        {activeItems.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant-app">
            <CheckSquare className="w-12 h-12 text-primary-app opacity-40 mx-auto mb-3" />
            <p className="font-body-lg font-medium text-on-surface-variant-app">¡Listo! No tienes artículos pendientes.</p>
            <p className="text-xs text-outline-app mt-1">Escribe arriba o presiona sugerencias para empezar.</p>
          </div>
        ) : (
          Object.keys(activeItemsByCategory).map((catName) => {
            const currentCatObj = categories.find((c) => c.name === catName) || { emoji: "🧺" };
            return (
              <div key={catName} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-label-lg text-primary-app uppercase tracking-wider flex items-center gap-2">
                    <span className="text-lg">{currentCatObj.emoji}</span> {catName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickAddCategory(quickAddCategory === catName ? null : catName);
                      setQuickAddName("");
                      setTimeout(() => quickAddInputRef.current?.focus(), 0);
                    }}
                    className="w-7 h-7 rounded-lg border-2 border-primary-app text-primary-app hover:bg-primary-app hover:text-on-primary-app flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0"
                    title={`Agregar producto a ${catName}`}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

                {quickAddCategory === catName && (
                  <form
                    onSubmit={(e) => handleQuickAddSubmit(e, catName)}
                    className="flex gap-2 px-1"
                  >
                    <input
                      ref={quickAddInputRef}
                      type="text"
                      value={quickAddName}
                      onChange={(e) => setQuickAddName(e.target.value)}
                      placeholder={`Nuevo producto en ${catName}...`}
                      className="flex-1 h-11 px-3 bg-white border-2 border-outline-variant-app rounded-xl font-body-md text-on-surface-app focus:border-primary-app focus:ring-0 outline-none"
                    />
                    <button
                      type="submit"
                      className="h-11 w-11 bg-primary-app hover:bg-primary-container-app text-on-primary-app rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                      title="Agregar"
                    >
                      <Plus className="w-5 h-5 stroke-[3]" />
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {activeItemsByCategory[catName].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center min-h-[76px] p-3 pl-4 bg-surface-container-lowest border border-outline-variant-app rounded-2xl shadow-sm hover:shadow-md transition-all group relative"
                    >
                      {/* Checkbox trigger target */}
                      <button
                        onClick={() => onToggleItem(item.id)}
                        className="w-7 h-7 rounded-lg border-2 border-outline-app hover:border-primary-app flex items-center justify-center transition-all mr-4 bg-white cursor-pointer"
                        title="Marcar como comprado"
                      >
                        <Check className="w-5 h-5 text-primary-app opacity-0 transition-opacity" />
                      </button>

                      <div className="flex-grow select-none pr-2 min-w-0 py-1 flex flex-col justify-center">
                        <span className="text-base sm:text-lg font-bold leading-tight break-words">
                          {item.name}
                        </span>
                      </div>

                      {/* Quantity adjusting blocks */}
                      <div className="flex items-center gap-2.5 bg-surface-container-low border border-outline-variant-app rounded-xl p-1 shrink-0 select-none mr-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest transition-colors text-primary-app cursor-pointer active:scale-90"
                          title="Faltan"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <span className="w-6 text-center font-label-lg font-extrabold text-on-surface-app text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest transition-colors text-primary-app cursor-pointer active:scale-90"
                          title="Agregar"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>

                      {/* Quick delete trash for individual items */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 px-1.5 text-outline-app hover:text-error-app rounded-lg hover:bg-error-container-app transition-colors ml-1 cursor-pointer"
                        title="Eliminar de la lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Done Items in the cart */}
      <section className="space-y-3">
        <div className="flex justify-between items-end border-b border-outline-variant-app/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="font-headline-md font-bold text-on-surface-variant-app">Ya en el carrito</h2>
          </div>
          <span className="font-label-md text-on-surface-variant-app bg-surface-container px-2 py-1 rounded font-bold">
            {checkedItems.length} {checkedItems.length === 1 ? "listo" : "listos"}
          </span>
        </div>

        {checkedItems.length === 0 ? (
          <p className="text-sm italic text-outline-app text-center py-4 bg-surface-container-low/50 rounded-xl">
            Aún no has agregado productos al carrito de compras.
          </p>
        ) : (
          <div className="space-y-2">
            {checkedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center min-h-[58px] p-3 px-4 bg-surface-dim-app border border-outline-variant-app/30 rounded-xl opacity-60 transition-all shadow-sm"
              >
                <button
                  onClick={() => onToggleItem(item.id)}
                  className="w-7 h-7 rounded-lg border-2 border-primary-app flex items-center justify-center bg-primary-app hover:bg-primary-container-app transition-colors mr-4 cursor-pointer"
                  title="Devolver a pendientes"
                >
                  <Check className="w-5 h-5 text-on-primary-app" />
                </button>

                <span className="flex-grow font-body-md text-on-surface-app line-through italic opacity-75">
                  {item.name} <span className="text-xs font-extrabold bg-surface-container px-1.5 py-0.5 rounded ml-1 text-outline-app select-none">x{item.quantity}</span>
                </span>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 text-outline-app hover:text-error-app rounded-md hover:bg-error-container-app transition-colors cursor-pointer"
                  title="Eliminar del carrito"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Actions & Bulk utility controls */}
      <section className="flex flex-col gap-4 pt-4 border-t border-outline-variant-app/40">
        <button
          onClick={onFinalizePurchase}
          disabled={items.length === 0}
          className="w-full h-14 bg-primary-app hover:bg-primary-container-app text-on-primary-app disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-headline-md font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          <CheckSquare className="w-6 h-6 stroke-[2]" />
          Finalizar compra
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClearList}
            disabled={items.length === 0}
            className="flex-1 h-12 border-2 border-error-app text-error-app hover:bg-error-container-app disabled:opacity-50 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 select-none"
          >
            <Trash2 className="w-4.5 h-4.5" />
            Limpiar lista
          </button>

          <button
            onClick={() => setImportModalOpen(true)}
            className="flex-1 h-12 border-2 border-outline-app hover:bg-surface-container-high text-on-surface-variant-app font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 select-none"
          >
            <FileText className="w-4.5 h-4.5" />
            Importar desde TXT
          </button>
        </div>
      </section>

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-outline-variant-app shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-headline-md font-bold text-primary-app flex items-center gap-2 border-b border-outline-variant-app pb-2">
              <FileText className="w-5 h-5 text-primary-app" /> Importar desde archivos
            </h3>

            <div className="space-y-1 text-sm text-on-surface-variant-app leading-snug">
              <p>Puedes importar tu lista de compras pegando texto o subiendo un archivo txt.</p>
              <p className="font-bold text-xs text-outline-app">Usa un elemento por línea. Ejemplo:</p>
              <pre className="p-2.5 bg-surface-container-low font-mono text-xs rounded-lg border border-outline-variant-app max-h-24 overflow-y-auto">
                {"3 Leche\nPan de molde\nAtún x2\n2 Cloro"}
              </pre>
            </div>

            <textarea
              rows={4}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Pega tu lista aquí..."
              className="w-full text-sm font-body-md p-3 border border-outline-variant-app rounded-xl bg-white focus:border-primary-app outline-none resize-none"
            ></textarea>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-outline-app">O selecciona un archivo txt:</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-4 bg-surface-container border border-outline-app text-sm hover:bg-surface-container-high rounded-xl font-bold text-on-surface-app flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <FolderPlus className="w-4 h-4 text-primary-app" />
                Examinar archivo TXT
              </button>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-outline-variant-app/50 justify-end">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high font-bold rounded-xl text-on-surface-variant-app cursor-pointer text-sm transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 bg-primary-app hover:bg-primary-container-app font-bold rounded-xl text-on-primary-app cursor-pointer text-sm transition-all active:scale-95"
              >
                Cargar Lista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
