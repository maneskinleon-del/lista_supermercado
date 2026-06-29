/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import type {
  ShoppingItem,
  Category,
  ShoppingTemplate,
  AppConfig,
} from "./types";
import {
  DEFAULT_CATEGORIES,
  INITIAL_ITEMS,
  categorizeItem,
} from "./utils/categorizer";
import { usePersistentState } from "./hooks/usePersistentState";
import { MODAL_Z_INDEX, SYNC_SPINNER_MS } from "./utils/constants";
import ActiveList from "./components/ActiveList";
import PriceCatalog from "./components/PriceCatalog";
import TemplatesList from "./components/TemplatesList";
import ConfigScreen from "./components/ConfigScreen";
import { Modal } from "./components/Modal";
import {
  ShoppingCart,
  DollarSign,
  Layers,
  Settings as SettingsIcon,
  RefreshCw,
} from "lucide-react";
import type { CurrencyCode } from "./utils/format";
import { formatCurrency } from "./utils/format";

const DEFAULT_PRICE_CATALOG: Record<string, number> = {
  "Pan de molde": 1200,
  "Leche": 850,
  "Atún": 1100,
  "Arroz": 950,
  "Cloro": 1300,
  "Huevos": 3500,
  "Manzanas": 600,
  "Café": 4500,
  "Papel higiénico": 2500,
  "Detergente de ropa": 3200,
};

const DEFAULT_CONFIG: AppConfig = {
  monthlyBudget: 24500,
  currency: "CLP",
  userName: "",
};

const DEFAULT_TEMPLATES: ShoppingTemplate[] = [
  {
    id: "tpl-asado",
    title: "Asado de Fin de Semana",
    description:
      "Los indispensables para hacer un asado/parrilla con amigos o familiares.",
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
    description:
      "Artículos esenciales de desayuno semanal para empezar bien el día.",
    items: [
      { name: "Leche", category: "Lácteos", quantity: 3 },
      { name: "Café", category: "Abarrotes", quantity: 1 },
      { name: "Huevos", category: "Otros", quantity: 12 },
      { name: "Banana", category: "Frutas y Verduras", quantity: 6 },
    ],
  },
];

type TabId = "lista" | "precios" | "plantillas" | "config";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("lista");

  const [items, setItems] = usePersistentState<ShoppingItem[]>(
    "superlista_items",
    INITIAL_ITEMS,
  );
  const [categories, setCategories] = usePersistentState<Category[]>(
    "superlista_categories",
    DEFAULT_CATEGORIES,
    {
      deserialize: (raw) =>
        raw.map((c) => ({
          ...c,
          presets:
            c.presets ||
            DEFAULT_CATEGORIES.find((dc) => dc.id === c.id)?.presets ||
            [],
        })),
    },
  );
  const [priceCatalog, setPriceCatalog] = usePersistentState<
    Record<string, number>
  >("superlista_prices", DEFAULT_PRICE_CATALOG);
  const [config, setConfig] = usePersistentState<AppConfig>(
    "superlista_config",
    DEFAULT_CONFIG,
  );
  const [templates, setTemplates] = usePersistentState<ShoppingTemplate[]>(
    "superlista_templates",
    DEFAULT_TEMPLATES,
  );

  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const syncTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current !== null) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // --- Item handlers ---
  const handleAddItem = useCallback(
    (name: string, categoryName?: string, quantity: number = 1) => {
      const matchedCategory = categoryName || categorizeItem(name);
      const existing = items.find(
        (i) => i.name.toLowerCase() === name.toLowerCase() && i.checked === false,
      );

      if (existing) {
        setItems(
          items.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        );
      } else {
        const catalogPrice = priceCatalog[name] ?? priceCatalog[name.toLowerCase()] ?? 0;
        const newItem: ShoppingItem = {
          id: crypto.randomUUID(),
          name,
          category: matchedCategory,
          quantity,
          checked: false,
          price: catalogPrice > 0 ? catalogPrice : undefined,
        };
        setItems([newItem, ...items]);
      }
    },
    [items, priceCatalog, setItems],
  );

  const handleToggleItem = useCallback(
    (id: string) => {
      setItems(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
    },
    [items, setItems],
  );

  const handleUpdateQuantity = useCallback(
    (id: string, amount: number) => {
      setItems(
        items
          .map((i) => {
            if (i.id === id) {
              const newQty = i.quantity + amount;
              return newQty > 0 ? { ...i, quantity: newQty } : null;
            }
            return i;
          })
          .filter((i): i is ShoppingItem => i !== null),
      );
    },
    [items, setItems],
  );

  const handleRemoveItem = useCallback(
    (id: string) => {
      setItems(items.filter((i) => i.id !== id));
    },
    [items, setItems],
  );

  // --- Price catalog handlers ---
  const handleSavePrice = useCallback(
    (productName: string, price: number) => {
      setPriceCatalog({ ...priceCatalog, [productName]: price });
    },
    [priceCatalog, setPriceCatalog],
  );

  const handleDeletePrice = useCallback(
    (productName: string) => {
      const next = { ...priceCatalog };
      delete next[productName];
      setPriceCatalog(next);
    },
    [priceCatalog, setPriceCatalog],
  );

  // --- List actions ---
  const handleClearList = useCallback(() => {
    setClearModalOpen(true);
  }, []);

  const confirmClearList = useCallback(() => {
    setItems([]);
    setClearModalOpen(false);
  }, [setItems]);

  const handleImportList = useCallback(
    (text: string) => {
      const lines = text.split("\n");
      const updatedItems: ShoppingItem[] = [...items];

      lines.forEach((line) => {
        let trimmed = line.trim();
        trimmed = trimmed.replace(/^[-*]?\s*\[\s*[xX ]?\s*\]\s*/i, "");
        trimmed = trimmed.replace(/^[-*]\s+/, "");

        if (!trimmed) return;

        const qtyMatch =
          trimmed.match(/^(\d+)\s+(.+)$/) ||
          trimmed.match(/^(.+)\s+x(\d+)$/i) ||
          trimmed.match(/^(.+)\s+(\d+)$/);
        let quantity = 1;
        let name = trimmed;

        if (qtyMatch) {
          if (/^(\d+)\s+(.+)$/.test(trimmed)) {
            quantity = parseInt(qtyMatch[1]!, 10) || 1;
            name = qtyMatch[2]!.trim();
          } else {
            quantity = parseInt(qtyMatch[2]!, 10) || 1;
            name = qtyMatch[1]!.trim();
          }
        }

        const assignedCategory = categorizeItem(name);

        const existing = updatedItems.find(
          (i) => i.name.toLowerCase() === name.toLowerCase() && i.checked === false,
        );
        if (existing) {
          existing.quantity += quantity;
        } else {
          const catalogPrice =
            priceCatalog[name] ?? priceCatalog[name.toLowerCase()] ?? 0;
          updatedItems.unshift({
            id: crypto.randomUUID(),
            name,
            category: assignedCategory,
            quantity,
            checked: false,
            price: catalogPrice > 0 ? catalogPrice : undefined,
          });
        }
      });

      setItems(updatedItems);
    },
    [items, priceCatalog, setItems],
  );

  // --- Finalize purchase ---
  const handleFinalizePurchaseTrigger = useCallback(() => {
    const checkedCount = items.filter((i) => i.checked).length;
    if (checkedCount === 0) {
      window.alert(
        "Para finalizar, marca al menos un elemento que se encuentre ya en el carrito.",
      );
      return;
    }
    setFinalizeModalOpen(true);
  }, [items]);

  const handleConfirmFinalize = useCallback(() => {
    setItems(items.filter((i) => !i.checked));
    setFinalizeModalOpen(false);
    setActiveTab("lista");
  }, [items, setItems]);

  // --- Config handlers ---
  const handleUpdateConfig = useCallback(
    (newConfig: Partial<AppConfig>) => {
      setConfig({ ...config, ...newConfig });
    },
    [config, setConfig],
  );

  const handleAddCategory = useCallback(
    (name: string, emoji: string) => {
      const id = name.toLowerCase().replace(/\s+/g, "-");
      setCategories([...categories, { id, name, emoji, presets: [] }]);
    },
    [categories, setCategories],
  );

  const handleDeleteCategory = useCallback(
    (id: string) => {
      setCategories(categories.filter((c) => c.id !== id));
    },
    [categories, setCategories],
  );

  const handleUpdateCategory = useCallback(
    (id: string, updates: Partial<Category>) => {
      setCategories(
        categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    [categories, setCategories],
  );

  const handleExportData = useCallback(() => {
    const payload = {
      config,
      items,
      priceCatalog,
      templates,
      categories,
      exportedAt: new Date().toISOString(),
    };
    const dataStr =
      "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `superlista_backup_${new Date().toISOString().split("T")[0]}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [config, items, priceCatalog, templates, categories]);

  // --- Templates handlers ---
  const handleApplyTemplate = useCallback(
    (templateId: string) => {
      const targetTpl = templates.find((t) => t.id === templateId);
      if (!targetTpl) return;

      const updatedItems = [...items];
      targetTpl.items.forEach((tplItem) => {
        const existing = updatedItems.find(
          (u) =>
            u.name.toLowerCase() === tplItem.name.toLowerCase() &&
            u.checked === false,
        );
        if (existing) {
          existing.quantity += tplItem.quantity;
        } else {
          const catalogPrice =
            priceCatalog[tplItem.name] ??
            priceCatalog[tplItem.name.toLowerCase()] ??
            0;
          updatedItems.unshift({
            id: crypto.randomUUID(),
            name: tplItem.name,
            category: tplItem.category,
            quantity: tplItem.quantity,
            checked: false,
            price: catalogPrice > 0 ? catalogPrice : undefined,
          });
        }
      });

      setItems(updatedItems);
    },
    [items, priceCatalog, setItems, templates],
  );

  const handleDeleteTemplate = useCallback(
    (id: string) => {
      setTemplates(templates.filter((t) => t.id !== id));
    },
    [templates, setTemplates],
  );

  const handleSaveTemplate = useCallback(
    (
      title: string,
      description: string,
      itemsContent: { name: string; category: string; quantity: number }[],
    ) => {
      const newTpl: ShoppingTemplate = {
        id: `tpl-${crypto.randomUUID()}`,
        title,
        description,
        items: itemsContent.map((i) => ({
          name: i.name,
          category: i.category,
          quantity: i.quantity,
        })),
      };
      setTemplates([newTpl, ...templates]);
    },
    [templates, setTemplates],
  );

  // --- Sync button (visual feedback only — local data is always local) ---
  const handleSyncClick = useCallback(() => {
    setSyncing(true);
    if (syncTimeoutRef.current !== null) {
      window.clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = window.setTimeout(() => {
      setSyncing(false);
      syncTimeoutRef.current = null;
    }, SYNC_SPINNER_MS);
  }, []);

  const checkedSummary = items.filter((i) => i.checked);
  const checkedCount = checkedSummary.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );
  const checkedTotal = checkedSummary.reduce(
    (acc, curr) => acc + (curr.price ?? 0) * curr.quantity,
    0,
  );

  return (
    <div className="bg-[#f7fbf0] text-[#181d17] min-h-screen font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 h-16 md:h-14 md:ml-64 md:w-[calc(100%-16rem)] bg-[#f7fbf0] border-b border-[#bfcaba]">
        <div className="font-sans text-xl font-bold text-[#0d631b] flex items-center gap-1">
          <span aria-hidden="true">🛒</span>
          <h2>SuperLista</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSyncClick}
            className="p-2 rounded-full hover:bg-[#f1f5eb] transition-all text-[#0d631b] flex items-center justify-center active:opacity-80 active:scale-95"
            aria-label="Refrescar y sincronizar datos"
            title="Refrescar y sincronizar"
            disabled={syncing}
          >
            <RefreshCw
              className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full py-6 px-4 gap-6 bg-[#f1f5eb] border-r border-[#bfcaba] w-64 select-none"
        aria-label="Navegación principal"
      >
        <div className="px-3 mb-2 flex items-center gap-2">
          <span className="text-3xl" aria-hidden="true">🛒</span>
          <div>
            <h1 className="font-sans text-xl font-extrabold text-[#0d631b] tracking-tight leading-none">
              SuperLista
            </h1>
            <p className="text-[10px] font-bold text-[#40493d] uppercase tracking-widest mt-1">
              Tu asistente de compras
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1 text-sm" aria-label="Secciones">
          <SidebarTab
            id="lista"
            label="Lista Activa"
            active={activeTab === "lista"}
            onClick={setActiveTab}
            icon={<ShoppingCart className="w-5 h-5" aria-hidden="true" />}
          />
          <SidebarTab
            id="precios"
            label="Precios"
            active={activeTab === "precios"}
            onClick={setActiveTab}
            icon={<DollarSign className="w-5 h-5" aria-hidden="true" />}
          />
          <SidebarTab
            id="plantillas"
            label="Plantillas"
            active={activeTab === "plantillas"}
            onClick={setActiveTab}
            icon={<Layers className="w-5 h-5" aria-hidden="true" />}
          />
          <SidebarTab
            id="config"
            label="Configuración"
            active={activeTab === "config"}
            onClick={setActiveTab}
            icon={<SettingsIcon className="w-5 h-5" aria-hidden="true" />}
          />
        </nav>

        <div className="bg-[#ebefe5] p-3.5 rounded-2xl border border-[#bfcaba]/60 text-xs flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-[#2e7d32] text-[#cbffc2] font-semibold flex items-center justify-center"
            aria-hidden="true"
          >
            {config.userName.substring(0, 1).toUpperCase() || "?"}
          </div>
          <div className="truncate">
            <span className="font-extrabold text-[#181d17] block leading-tight">
              {config.userName || "Sin nombre"}
            </span>
            <span className="text-[10px] text-[#40493d]/80 leading-none">
              Presupuesto:{" "}
              {formatCurrency(config.monthlyBudget, config.currency as CurrencyCode)}
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        id="main-content"
        className="md:ml-64 pt-20 pb-28 px-4 md:px-8 max-w-7xl mx-auto min-h-screen"
      >
        {activeTab === "lista" && (
          <ActiveList
            items={items}
            categories={categories}
            onAddItem={handleAddItem}
            onToggleItem={handleToggleItem}
            onUpdateQuantity={handleUpdateQuantity}
            onFinalizePurchase={handleFinalizePurchaseTrigger}
            onClearList={handleClearList}
            onImportList={handleImportList}
            onRemoveItem={handleRemoveItem}
          />
        )}

        {activeTab === "precios" && (
          <PriceCatalog
            prices={priceCatalog}
            categories={categories}
            currency={config.currency}
            onSavePrice={handleSavePrice}
            onDeletePrice={handleDeletePrice}
          />
        )}

        {activeTab === "plantillas" && (
          <TemplatesList
            templates={templates}
            onApplyTemplate={handleApplyTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onSaveTemplate={handleSaveTemplate}
            currentActiveItems={items.filter((i) => !i.checked)}
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

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 mx-auto max-w-[600px] z-40 flex justify-around items-center h-16 px-2 bg-[#f7fbf0] border-t border-[#bfcaba]"
        aria-label="Navegación inferior"
      >
        <MobileTab
          id="lista"
          label="Lista"
          active={activeTab === "lista"}
          onClick={setActiveTab}
          icon={<ShoppingCart className="w-5 h-5 stroke-2" aria-hidden="true" />}
        />
        <MobileTab
          id="precios"
          label="Precios"
          active={activeTab === "precios"}
          onClick={setActiveTab}
          icon={<DollarSign className="w-5 h-5 stroke-2" aria-hidden="true" />}
        />
        <MobileTab
          id="plantillas"
          label="Plantillas"
          active={activeTab === "plantillas"}
          onClick={setActiveTab}
          icon={<Layers className="w-5 h-5 stroke-2" aria-hidden="true" />}
        />
        <MobileTab
          id="config"
          label="Ajustes"
          active={activeTab === "config"}
          onClick={setActiveTab}
          icon={<SettingsIcon className="w-5 h-5 stroke-2" aria-hidden="true" />}
        />
      </nav>

      {/* Finalize modal */}
      <Modal
        open={finalizeModalOpen}
        onClose={() => setFinalizeModalOpen(false)}
        title="🛒 Finalizar compra actual"
        titleClassName="text-[#0d631b]"
        zIndex={MODAL_Z_INDEX}
      >
        <p className="text-xs text-[#40493d] text-center leading-relaxed">
          Al confirmar, los productos marcados se retirarán del carrito y los
          pendientes se conservarán.
        </p>
        <div className="bg-[#f1f5eb] p-3 rounded-xl border border-[#bfcaba]/60 text-xs space-y-1.5 text-[#181d17]">
          <div className="flex justify-between font-bold">
            <span>Productos en el carrito:</span>
            <span className="text-[#0d631b] font-extrabold">{checkedCount} items</span>
          </div>
          <div className="flex justify-between font-bold pt-1.5 border-t border-[#bfcaba]/40 text-sm">
            <span>Gasto estimado:</span>
            <span className="text-[#0d631b] font-extrabold">
              {formatCurrency(checkedTotal, config.currency as CurrencyCode)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={() => setFinalizeModalOpen(false)}
            className="px-4 py-2 bg-[#ebefe5] hover:bg-[#e5eadf] font-bold rounded-xl text-[#40493d] text-xs transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmFinalize}
            className="px-4 py-2 bg-[#0d631b] hover:bg-[#2e7d32] font-bold rounded-xl text-white text-xs transition-all active:scale-95 shadow-md"
          >
            Confirmar y guardar
          </button>
        </div>
      </Modal>

      {/* Clear list modal */}
      <Modal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="🗑️ Limpiar Lista"
        titleClassName="text-[#ba1a1a]"
        zIndex={MODAL_Z_INDEX}
      >
        <p className="text-sm text-[#40493d] text-center leading-relaxed">
          ¿Estás seguro de que deseas eliminar <strong>todos</strong> los
          artículos de la lista actual? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={() => setClearModalOpen(false)}
            className="px-4 py-2 bg-[#ebefe5] hover:bg-[#e5eadf] font-bold rounded-xl text-[#40493d] text-sm transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmClearList}
            className="px-4 py-2 bg-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#ba1a1a] font-bold rounded-xl text-white text-sm transition-all active:scale-95 shadow-md"
          >
            Sí, limpiar
          </button>
        </div>
      </Modal>
    </div>
  );
}

interface SidebarTabProps {
  id: TabId;
  label: string;
  active: boolean;
  onClick: (id: TabId) => void;
  icon: React.ReactNode;
}

function SidebarTab({ id, label, active, onClick, icon }: SidebarTabProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all text-left ${
        active
          ? "bg-[#64a1ff] text-white shadow-sm"
          : "text-[#40493d] hover:bg-[#ebefe5]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface MobileTabProps {
  id: TabId;
  label: string;
  active: boolean;
  onClick: (id: TabId) => void;
  icon: React.ReactNode;
}

function MobileTab({ id, label, active, onClick, icon }: MobileTabProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center justify-center p-1 transition-all ${
        active
          ? "text-[#0d631b] scale-105 font-bold"
          : "text-[#40493d] hover:text-[#0d631b]"
      }`}
    >
      {icon}
      <span className="text-[10px] mt-1 font-semibold leading-none">
        {label}
      </span>
    </button>
  );
}
