/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppConfig, Category } from "../types";
import { Settings, Plus, Trash, HelpCircle, Save, CheckCircle, Database, FileCode, Landmark, Edit3, X } from "lucide-react";

interface ConfigScreenProps {
  config: AppConfig;
  categories: Category[];
  onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
  onAddCategory: (name: string, emoji: string) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onExportData: () => void;
}

export default function ConfigScreen({
  config,
  categories,
  onUpdateConfig,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory,
  onExportData,
}: ConfigScreenProps) {
  const [userName, setUserName] = useState(config.userName);
  const [budget, setBudget] = useState(config.monthlyBudget.toString());
  const [currency, setCurrency] = useState(config.currency);
  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("");
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatEmoji, setEditCatEmoji] = useState("");
  const [editCatPresetsTxt, setEditCatPresetsTxt] = useState("");

  const handleEditCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatId || !editCatName.trim()) return;

    const parsedPresets = editCatPresetsTxt
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    onUpdateCategory(editingCatId, {
      name: editCatName.trim(),
      emoji: editCatEmoji.trim() || "📦",
      presets: parsedPresets
    });

    setEditingCatId(null);
  };

  const openEditModal = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatEmoji(cat.emoji);
    setEditCatPresetsTxt(cat.presets ? cat.presets.join("\n") : "");
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      userName: userName.trim(),
      monthlyBudget: parseFloat(budget) || 0,
      currency: currency.trim() || "CLP",
    });

    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 1500);
  };

  const handleAddCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    onAddCategory(catName.trim(), catEmoji.trim() || "📦");
    setCatName("");
    setCatEmoji("");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant-app/60 pb-3">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-background-app">Configuración</h2>
        <p className="text-xs font-semibold text-outline-app mt-0.5">
          Personaliza tu perfil, presupuesto, monedas y categorías de forma local.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: General Profiles and Budget Configuration options */}
        <section className="bg-surface-container-lowest border border-outline-variant-app p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-headline-md font-bold text-primary-app flex items-center gap-2 border-b border-outline-variant-app pb-2">
            <Landmark className="w-5 h-5 text-primary-app" />
            Perfil y Presupuesto
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-app">Tu Nombre</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej: Manuel, María..."
                className="w-full text-sm p-3 border border-outline-variant-app bg-white rounded-xl focus:border-primary-app outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-app">Presupuesto Mensual</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Ej: 20000"
                  className="w-full text-sm p-3 border border-outline-variant-app bg-white rounded-xl focus:border-primary-app outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-app">Moneda Regional</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-[46px] mt-1 pr-6 text-sm px-3 border border-outline-variant-app bg-white rounded-xl focus:border-primary-app outline-none cursor-pointer font-extrabold"
                >
                  <option value="CLP">CLP $ (Peso Chileno)</option>
                  <option value="$">$ (Peso / Dólar)</option>
                  <option value="€">€ (Euro)</option>
                  <option value="S/">S/ (Sol Peruano)</option>
                  <option value="Mex$">Mex$ (Peso Mexicano)</option>
                  <option value="R$">R$ (Real Brasileño)</option>
                  <option value="¢">¢ (Colón / Centavo)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full h-11 flex items-center justify-center gap-2 font-bold font-label-lg rounded-xl transition-all cursor-pointer active:scale-95 ${
                showSavedFeedback
                  ? "bg-primary-container-app text-on-primary-container-app"
                  : "bg-primary-app hover:bg-primary-container-app text-on-primary-app"
              }`}
            >
              {showSavedFeedback ? (
                <>
                  <CheckCircle className="w-4 h-4 text-[#cbffc2] stroke-[2.5]" />
                  <span>¡Guardado con éxito!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Guardar Preferencias</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Export Backups block */}
        <section className="bg-surface-container-lowest border border-outline-variant-app p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-headline-md font-bold text-primary-app flex items-center gap-2 border-b border-outline-variant-app pb-2">
              <Database className="w-5 h-5 text-primary-app" /> Respaldo de Datos
            </h3>

            <p className="text-xs text-on-surface-variant-app leading-relaxed">
              SuperLista funciona localmente con el almacenamiento del navegador (localStorage). 
              Para asegurar tu información, puedes exportar una copia de seguridad en formato JSON de todas tus listas, historial y categorías personalizadas.
            </p>
          </div>

          <button
            onClick={onExportData}
            className="w-full h-12 mt-6 border-2 border-primary-app hover:bg-primary-container-app hover:text-on-primary-app hover:border-transparent text-primary-app font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 text-sm"
          >
            <FileCode className="w-4.5 h-4.5" />
            Descargar Copia de Seguridad JSON
          </button>
        </section>

        {/* Complete Bottom categories setting panel */}
        <section className="bg-surface-container-lowest border border-outline-variant-app p-5 rounded-2xl shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-headline-md font-bold text-primary-app flex items-center gap-2 border-b border-outline-variant-app pb-2">
            <Plus className="w-5 h-5 text-primary-app" /> Administrar Categorías de Compra
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: add category form */}
            <div className="md:col-span-1 bg-surface-container-low p-4 rounded-xl border border-outline-variant-app space-y-3">
              <span className="font-label-lg font-extrabold text-on-surface-app block">Añadir Categoría</span>
              <form onSubmit={handleAddCatSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline-app">Nombre de Categoría</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Ej: Mascotas, Electrónicos..."
                    className="w-full text-xs p-2 bg-white border border-outline-variant-app rounded-lg focus:border-primary-app outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline-app">Emoji Identificador</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={catEmoji}
                    onChange={(e) => setCatEmoji(e.target.value)}
                    placeholder="Ej: 🐶, ⚡, 🧺..."
                    className="w-full text-xs p-2 bg-white border border-outline-variant-app rounded-lg focus:border-primary-app outline-none text-center font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary-app hover:bg-primary-container-app text-on-primary-app font-bold rounded-lg text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Categoría
                </button>
              </form>
            </div>

            {/* Right: categories grids listing with dynamic deletes */}
            <div className="md:col-span-2 space-y-2">
              <span className="font-label-lg font-extrabold text-on-surface-app block">Categorías Configuradas</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2 px-3 bg-white border border-outline-variant-app/70 rounded-xl shadow-xs"
                    >
                      <div className="flex items-center gap-2 select-none min-w-0 pr-1">
                        <span className="text-base font-bold shrink-0">{cat.emoji}</span>
                        <span className="text-xs font-semibold text-on-surface-app truncate">
                          {cat.name}
                        </span>
                      </div>

                      {/* Edit Button */}
                      <div className="flex items-center shrink-0">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1 rounded text-outline-app hover:text-primary-app hover:bg-primary-container-app transition-colors duration-150 cursor-pointer"
                          title="Editar Categoría"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1 rounded text-outline-app hover:text-error-app hover:bg-error-container-app transition-colors duration-150 cursor-pointer"
                          title="Eliminar Categoría"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Edit Category Modal */}
      {editingCatId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-outline-variant-app shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-outline-variant-app pb-3">
              <h3 className="font-headline-md font-bold text-primary-app">
                Editar Categoría
              </h3>
              <button
                onClick={() => setEditingCatId(null)}
                className="p-1 rounded-lg hover:bg-surface-container-low transition-colors text-outline-app cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCatSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-[11px] font-bold text-outline-app">Emoji</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={editCatEmoji}
                    onChange={(e) => setEditCatEmoji(e.target.value)}
                    className="w-full text-sm p-3 border border-outline-variant-app bg-white rounded-xl focus:border-primary-app outline-none text-center font-bold"
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-outline-app">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full text-sm p-3 border border-outline-variant-app bg-white rounded-xl focus:border-primary-app outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline-app">Opciones del Catálogo Rápido (Menú desplegable)</label>
                <p className="text-[10px] text-on-surface-variant-app pb-1">Agrega una sugerencia por línea (ej: pan de molde, pan de completo):</p>
                <textarea
                  rows={4}
                  value={editCatPresetsTxt}
                  onChange={(e) => setEditCatPresetsTxt(e.target.value)}
                  placeholder="Ej: pan lactal&#10;galletas&#10;medialunas"
                  className="w-full text-sm p-3 border border-outline-variant-app bg-white rounded-xl focus:border-primary-app outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCatId(null)}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high font-bold rounded-xl text-on-surface-variant-app cursor-pointer text-sm transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-app hover:bg-primary-container-app font-bold rounded-xl text-on-primary-app cursor-pointer text-sm transition-all active:scale-95"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
