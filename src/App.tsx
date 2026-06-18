/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ShoppingItem, Category, HistoryEntry, ShoppingTemplate, AppConfig } from "./types";
import {
  DEFAULT_CATEGORIES,
  INITIAL_ITEMS,
  INITIAL_HISTORY,
  categorizeItem,
} from "./utils/categorizer";
import ActiveList from "./components/ActiveList";
import HistoryList from "./components/HistoryList";
import TemplatesList from "./components/TemplatesList";
import ConfigScreen from "./components/ConfigScreen";
import { ShoppingCart, History as HistoryIcon, Layers, Settings as SettingsIcon, Check, RefreshCw, Grid } from "lucide-react";

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"lista" | "historial" | "plantillas" | "config">("lista");

  // App core states initialized from localStorage with robust fallbacks
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem("superlista_items");
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem("superlista_categories");
    if (saved) {
      try {
        const parsed: Category[] = JSON.parse(saved);
        // Migrate to include presets
        return parsed.map(c => ({
          ...c,
          presets: c.presets || DEFAULT_CATEGORIES.find(dc => dc.id === c.id)?.presets || []
        }));
      } catch (e) {
        return DEFAULT_CATEGORIES;
      }
    }
    return DEFAULT_CATEGORIES;
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem("superlista_history");
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem("superlista_config");
    return saved ? JSON.parse(saved) : { monthlyBudget: 24500, currency: "$", userName: "Manuel" };
  });

  const [templates, setTemplates] = useState<ShoppingTemplate[]>(() => {
    const saved = localStorage.getItem("superlista_templates");
    if (saved) return JSON.parse(saved);

    // Default Starting Preset Templates
    return [
      {
        id: "tpl-asado",
        title: "Asado de Fin de Semana",
        description: "Los indispensables para hacer un asado/parrilla con amigos o familiares.",
        items: [
          { name: "Carne Vacuna", category: "Carnicería y Fiambrería", quantity: 2 },
          { name: "Carbón", category: "Otros", quantity: 1 },
          { name: "Refresco", category: "Bebidas", quantity: 3 },
          { name: "Pan de molde", category: "Panadería", quantity: 1 },
        ],
      },
      {
        id: "tpl-desayuno",
        title: "Desayuno Completo",
        description: "Artículos esenciales de desayuno semanal para empezar bien el día.",
        items: [
          { name: "Leche", category: "Lácteos", quantity: 3 },
          { name: "Café", category: "Abarrotes", quantity: 1 },
          { name: "Huevos", category: "Otros", quantity: 12 },
          { name: "Banana", category: "Frutas y Verduras", quantity: 6 },
        ],
      },
    ];
  });

  // Modal triggers for finalizing purchases
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [newHistoryTitle, setNewHistoryTitle] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Sync state to local storage when state changes
  useEffect(() => {
    localStorage.setItem("superlista_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("superlista_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("superlista_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("superlista_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("superlista_templates", JSON.stringify(templates));
  }, [templates]);

  // Handler functions
  const handleAddItem = (name: string, categoryName?: string, quantity: number = 1) => {
    const matchedCategory = categoryName || categorizeItem(name);
    const existing = items.find((i) => i.name.toLowerCase() === name.toLowerCase() && i.checked === false);

    if (existing) {
      // Incremet quantity if already exists
      setItems(
        items.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i))
      );
    } else {
      // Add fresh product
      const newItem: ShoppingItem = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        category: matchedCategory,
        quantity,
        checked: false,
        price: Math.floor(Math.random() * 1200) + 150, // simulated price for rich history metrics
      };
      setItems([newItem, ...items]);
    }
  };

  const handleToggleItem = (id: string) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const handleUpdateQuantity = (id: string, amount: number) => {
    setItems(
      items
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + amount;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as ShoppingItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleUpdateItemCategory = (id: string, category: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, category } : i)));
  };

  const handleClearList = () => {
    setClearModalOpen(true);
  };

  const confirmClearList = () => {
    setItems([]);
    setClearModalOpen(false);
  };

  const handleImportList = (text: string) => {
    const lines = text.split("\n");
    const updatedItems: ShoppingItem[] = [...items];

    lines.forEach((line) => {
      let trimmed = line.trim();
      
      // Cleanup markdown checkboxes like - [ ], [ ], - [x], or simple dashes
      trimmed = trimmed.replace(/^[\-\*]?\s*\[\s*[xX ]?\s*\]\s*/i, "");
      trimmed = trimmed.replace(/^[\-\*]\s+/, "");
      
      if (!trimmed) return;

      // regex matching numbers in listing, e.g. "3 Leche", "Leche x2", "Atún 4"
      const qtyMatch = trimmed.match(/^(\d+)\s+(.+)$/) || trimmed.match(/^(.+)\s+x(\d+)$/) || trimmed.match(/^(.+)\s+(\d+)$/);
      let quantity = 1;
      let name = trimmed;

      if (qtyMatch) {
         if (trimmed.match(/^(\d+)\s+(.+)$/)) {
            quantity = parseInt(qtyMatch[1]) || 1;
            name = qtyMatch[2].trim();
         } else {
            quantity = parseInt(qtyMatch[2]) || 1;
            name = qtyMatch[1].trim();
         }
      }

      const assignedCategory = categorizeItem(name);
      
      const existing = updatedItems.find(i => i.name.toLowerCase() === name.toLowerCase() && i.checked === false);
      if (existing) {
        existing.quantity += quantity;
      } else {
        updatedItems.unshift({
          id: Math.random().toString(36).substring(2, 9),
          name,
          category: assignedCategory,
          quantity,
          checked: false,
          price: Math.floor(Math.random() * 1200) + 150,
        });
      }
    });

    setItems(updatedItems);
  };

  // Finalize purchase appending record to history logs
  const handleFinalizePurchaseTrigger = () => {
    const checkedItems = items.filter((i) => i.checked);
    if (checkedItems.length === 0) {
      alert("Para finalizar, marca al menos un elemento que se encuentre ya en el carrito.");
      return;
    }
    setNewHistoryTitle(`Compra del ${new Date().toLocaleDateString("es-ES", { day: 'numeric', month: 'long' })}`);
    setFinalizeModalOpen(true);
  };

  const handleConfirmFinalize = () => {
    const checkedItems = items.filter((i) => i.checked);
    const activeItems = items.filter((i) => !i.checked);

    const calculatedTotal = checkedItems.reduce((acc, curr) => {
      const price = curr.price || 500;
      return acc + price * curr.quantity;
    }, 0);

    const newHistoryEntry: HistoryEntry = {
      id: "SHOP-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.random().toString(36).substring(2, 4).toUpperCase(),
      title: newHistoryTitle.trim() || "Compra Semanal",
      date: "Hoy, " + new Date().toLocaleDateString("es-ES", { day: 'numeric', month: 'long' }),
      timestamp: Date.now(),
      totalPrice: calculatedTotal,
      items: checkedItems.map((itm) => ({ ...itm, checked: true })), // force full bought checks
    };

    setHistory([newHistoryEntry, ...history]);
    
    // Retain lingering unbought active list, clear checked elements
    setItems(activeItems);
    setFinalizeModalOpen(false);
    setActiveTab("historial");
  };

  // Re-use past lists in dynamic shopping checklists
  const handleReplayPastList = (id: string) => {
    const entry = history.find((e) => e.id === id);
    if (!entry) return;

    const mergedItems = [...items];
    entry.items.forEach((pastItem) => {
      const existing = mergedItems.find((m) => m.name.toLowerCase() === pastItem.name.toLowerCase() && m.checked === false);
      if (existing) {
        existing.quantity += pastItem.quantity;
      } else {
        mergedItems.unshift({
          id: Math.random().toString(36).substring(2, 9),
          name: pastItem.name,
          category: pastItem.category,
          quantity: pastItem.quantity,
          checked: false,
          price: pastItem.price,
        });
      }
    });

    setItems(mergedItems);
    setActiveTab("lista");
  };

  const handleDeleteHistoryEntry = (id: string) => {
    setHistory(history.filter((h) => h.id !== id));
  };

  const handleUpdateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig({ ...config, ...newConfig });
  };

  const handleAddCategory = (name: string, emoji: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    setCategories([...categories, { id, name, emoji, presets: [] }]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Backup data triggered download
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ config, items, history, templates, categories }, null, 2)
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `superlista_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleApplyTemplate = (templateId: string) => {
    const targetTpl = templates.find((t) => t.id === templateId);
    if (!targetTpl) return;

    const updatedItems = [...items];
    targetTpl.items.forEach((tplItem) => {
      const existing = updatedItems.find((u) => u.name.toLowerCase() === tplItem.name.toLowerCase() && u.checked === false);
      if (existing) {
        existing.quantity += tplItem.quantity;
      } else {
        updatedItems.unshift({
          id: Math.random().toString(36).substring(2, 9),
          name: tplItem.name,
          category: tplItem.category,
          quantity: tplItem.quantity,
          checked: false,
          price: Math.floor(Math.random() * 1200) + 150,
        });
      }
    });

    setItems(updatedItems);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleSaveTemplate = (title: string, description: string, itemsContent: { name: string; category: string; quantity: number }[]) => {
    const newTpl: ShoppingTemplate = {
      id: "tpl-" + Math.random().toString(36).substring(2, 9),
      title,
      description,
      items: itemsContent.map((i) => ({ name: i.name, category: i.category, quantity: i.quantity })),
    };
    setTemplates([newTpl, ...templates]);
  };

  // Sync button trigger simulation
  const handleSyncClick = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  return (
    <div className="bg-[#f7fbf0] text-[#181d17] min-h-screen font-sans">
      
      {/* Top Mobile Heading App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 md:h-14 md:ml-64 md:w-[calc(100%-16rem)] bg-[#f7fbf0] border-b border-[#bfcaba]">
        <div className="font-sans text-xl font-bold text-[#0d631b] flex items-center gap-1">
          <span>🛒</span>
          <h2>SuperLista</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncClick}
            className="p-2 rounded-full hover:bg-[#f1f5eb] transition-all cursor-pointer text-[#0d631b] flex items-center justify-center active:opacity-80 active:scale-95"
            title="Refrescar y Sincronizar"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Main Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full py-6 px-4 gap-6 bg-[#f1f5eb] border-r border-[#bfcaba] w-64 select-none">
        <div className="px-3 mb-2 flex items-center gap-2">
          <span className="text-3xl">🛒</span>
          <div>
            <h1 className="font-sans text-xl font-extrabold text-[#0d631b] tracking-tight leading-none">
              SuperLista
            </h1>
            <p className="text-[10px] font-bold text-[#40493d] uppercase tracking-widest mt-1">
              Tu asistente de compras
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1 text-sm">
          <button
            onClick={() => setActiveTab("lista")}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all cursor-pointer text-left ${
              activeTab === "lista"
                ? "bg-[#64a1ff] text-white shadow-sm"
                : "text-[#40493d] hover:bg-[#ebefe5]"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Lista Activa</span>
          </button>

          <button
            onClick={() => setActiveTab("historial")}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all cursor-pointer text-left ${
              activeTab === "historial"
                ? "bg-[#64a1ff] text-white shadow-sm"
                : "text-[#40493d] hover:bg-[#ebefe5]"
            }`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span>Historial</span>
          </button>

          <button
            onClick={() => setActiveTab("plantillas")}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all cursor-pointer text-left ${
              activeTab === "plantillas"
                ? "bg-[#64a1ff] text-white shadow-sm"
                : "text-[#40493d] hover:bg-[#ebefe5]"
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Plantillas</span>
          </button>

          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all cursor-pointer text-left ${
              activeTab === "config"
                ? "bg-[#64a1ff] text-white shadow-sm"
                : "text-[#40493d] hover:bg-[#ebefe5]"
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Configuración</span>
          </button>
        </nav>

        {/* Footer profile summary on desktop */}
        <div className="bg-[#ebefe5] p-3.5 rounded-2xl border border-[#bfcaba]/60 text-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#2e7d32] text-[#cbffc2] font-semibold flex items-center justify-center">
            {config.userName.substring(0, 1).toUpperCase()}
          </div>
          <div className="truncate">
            <span className="font-extrabold text-[#181d17] block leading-tight">{config.userName}</span>
            <span className="text-[10px] text-[#40493d]/80 leading-none">Presupuesto: {config.currency}{config.monthlyBudget}</span>
          </div>
        </div>
      </aside>

      {/* Main Canvas layout container wrapper */}
      <main className="md:ml-64 pt-20 pb-28 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        {activeTab === "lista" && (
          <ActiveList
            items={items}
            categories={categories}
            currency={config.currency}
            onAddItem={handleAddItem}
            onToggleItem={handleToggleItem}
            onUpdateQuantity={handleUpdateQuantity}
            onFinalizePurchase={handleFinalizePurchaseTrigger}
            onClearList={handleClearList}
            onImportList={handleImportList}
            onRemoveItem={handleRemoveItem}
            onUpdateItemCategory={handleUpdateItemCategory}
          />
        )}

        {activeTab === "historial" && (
          <HistoryList
            history={history}
            currency={config.currency}
            onReplayList={handleReplayPastList}
            onDeleteHistoryEntry={handleDeleteHistoryEntry}
          />
        )}

        {activeTab === "plantillas" && (
          <TemplatesList
            templates={templates}
            currency={config.currency}
            onApplyTemplate={handleApplyTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onSaveTemplate={handleSaveTemplate}
            currentActiveItems={items.filter(i => !i.checked)}
          />
        )}

        {activeTab === "config" && (
          <ConfigScreen
            config={config}
            categories={categories}
            onUpdateConfig={handleUpdateConfig}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateCategory={handleUpdateCategory}
            onExportData={handleExportData}
          />
        )}
      </main>

      {/* Mobile Sticky Tab Bar (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-2 bg-[#f7fbf0] border-t border-[#bfcaba] max-w-[600px] left-1/2 -translate-x-1/2">
        <button
          onClick={() => setActiveTab("lista")}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === "lista"
              ? "text-[#0d631b] scale-105 font-bold"
              : "text-[#40493d] hover:text-[#0d631b]"
          }`}
        >
          <ShoppingCart className="w-5.5 h-5.5 stroke-[2]" />
          <span className="text-[10px] mt-1 font-semibold leading-none">Lista</span>
        </button>

        <button
          onClick={() => setActiveTab("historial")}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === "historial"
              ? "text-[#0d631b] scale-105 font-bold"
              : "text-[#40493d] hover:text-[#0d631b]"
          }`}
        >
          <HistoryIcon className="w-5.5 h-5.5 stroke-[2]" />
          <span className="text-[10px] mt-1 font-semibold leading-none">Historial</span>
        </button>

        <button
          onClick={() => setActiveTab("plantillas")}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === "plantillas"
              ? "text-[#0d631b] scale-105 font-bold"
              : "text-[#40493d] hover:text-[#0d631b]"
          }`}
        >
          <Layers className="w-5.5 h-5.5 stroke-[2]" />
          <span className="text-[10px] mt-1 font-semibold leading-none">Plantillas</span>
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === "config"
              ? "text-[#0d631b] scale-105 font-bold"
              : "text-[#40493d] hover:text-[#0d631b]"
          }`}
        >
          <SettingsIcon className="w-5.5 h-5.5 stroke-[2]" />
          <span className="text-[10px] mt-1 font-semibold leading-none">Ajustes</span>
        </button>
      </nav>

      {/* Finalize Purchase Dialog overlay */}
      {finalizeModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#bfcaba] shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-sans text-lg font-extrabold text-[#0d631b] border-b border-[#bfcaba] pb-2 text-center">
              🛒 Finalizar compra actual
            </h3>

            <div className="space-y-3.5 pt-1">
              <p className="text-xs text-[#40493d] text-center leading-relaxed">
                ¡Excelente! Al confirmar esta acción, todos los productos que están marcados en tu carrito se registrarán como una compra realizada. Los pendientes se conservarán.
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#181d17]">Título de compra en Historial</label>
                <input
                  type="text"
                  value={newHistoryTitle}
                  onChange={(e) => setNewHistoryTitle(e.target.value)}
                  placeholder="Ej: Compra Semanal, Compras Express, etc..."
                  className="w-full text-xs p-3 border border-[#bfcaba] bg-white rounded-xl focus:border-[#0d631b] outline-none"
                />
              </div>

              <div className="bg-[#f1f5eb] p-3 rounded-xl border border-[#bfcaba]/60 text-xs space-y-1.5 select-none text-[#181d17]">
                <div className="flex justify-between font-bold">
                  <span>Productos del carrito:</span>
                  <span className="text-[#0d631b] font-extrabold">
                    {items.filter(i => i.checked).reduce((acc, curr) => acc + curr.quantity, 0)} items
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-1.5 border-t border-[#bfcaba]/40 text-sm">
                  <span>Gasto estimado:</span>
                  <span className="text-[#0d631b] font-extrabold">
                    {config.currency}
                    {items
                      .filter((i) => i.checked)
                      .reduce((acc, curr) => acc + (curr.price || 500) * curr.quantity, 0)
                      .toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setFinalizeModalOpen(false)}
                className="px-4 py-2 bg-[#ebefe5] hover:bg-[#e5eadf] font-bold rounded-xl text-[#40493d] cursor-pointer text-xs transition-all active:scale-95"
              >
                No, volver
              </button>
              <button
                onClick={handleConfirmFinalize}
                className="px-4 py-2 bg-[#0d631b] hover:bg-[#2e7d32] font-bold rounded-xl text-white cursor-pointer text-xs transition-all active:scale-95 shadow-md"
              >
                Confirmar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear List Modal */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-error-app shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-sans text-lg font-extrabold text-error-app border-b border-error-container-app pb-2 text-center">
              🗑️ Limpiar Lista
            </h3>
            <p className="text-sm text-on-surface-variant-app text-center leading-relaxed">
              ¿Estás seguro de que deseas eliminar TODOS los artículos de la lista actual? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setClearModalOpen(false)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high font-bold rounded-xl text-on-surface-variant-app cursor-pointer text-sm transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearList}
                className="px-4 py-2 bg-error-app hover:bg-error-container-app font-bold rounded-xl text-on-primary-app cursor-pointer text-sm transition-all active:scale-95 shadow-md"
              >
                Sí, limpiar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
