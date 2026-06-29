/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import type { ShoppingTemplate } from "../types";
import { Modal } from "./Modal";
import { Copy, PlusCircle, Trash, Layers, CheckCircle } from "lucide-react";

interface TemplatesListProps {
  templates: ShoppingTemplate[];
  onApplyTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onSaveTemplate: (title: string, description: string, items: { name: string; category: string; quantity: number }[]) => void;
  currentActiveItems: { name: string; category: string; quantity: number }[];
}

export default function TemplatesList({
  templates,
  onApplyTemplate,
  onDeleteTemplate,
  onSaveTemplate,
  currentActiveItems,
}: TemplatesListProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateTitle.trim()) return;

    onSaveTemplate(templateTitle.trim(), templateDesc.trim(), currentActiveItems);
    setTemplateTitle("");
    setTemplateDesc("");
    setSaveModalOpen(false);
  };

  const triggerApplyFeedback = (templateId: string) => {
    onApplyTemplate(templateId);
    setAppliedTemplateId(templateId);
    setTimeout(() => {
      setAppliedTemplateId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-outline-variant-app/60 pb-3">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-background-app">Plantillas</h2>
          <p className="text-xs font-semibold text-outline-app mt-0.5">
            Carga listas completas al instante para tus compras recurrentes.
          </p>
        </div>

        <button
          onClick={() => setSaveModalOpen(true)}
          disabled={currentActiveItems.length === 0}
          className="bg-primary-app hover:bg-primary-container-app text-on-primary-app disabled:opacity-50 disabled:cursor-not-allowed font-bold px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm select-none"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          Guardar lista actual como plantilla
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant-app">
          <Layers className="w-12 h-12 text-outline-app opacity-40 mx-auto mb-3" />
          <p className="font-body-lg font-medium text-on-surface-variant-app">No tienes plantillas creadas.</p>
          <p className="text-xs text-outline-app mt-1">Crea plantillas personalizadas haciendo clic en el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-surface-container-lowest border border-outline-variant-app p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between group"
            >
              {/* Delete button option */}
              <button
                type="button"
                onClick={() => setPendingDelete({ id: tpl.id, title: tpl.title })}
                className="absolute right-4 top-4 p-1 rounded-lg text-outline-app hover:text-error-app hover:bg-error-container-app transition-colors duration-150"
                aria-label={`Eliminar plantilla ${tpl.title}`}
                title="Eliminar plantilla"
              >
                <Trash className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="space-y-3 pb-4">
                <div>
                  <h4 className="font-headline-md font-bold text-on-surface-app pr-8">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant-app mt-1 leading-relaxed">
                    {tpl.description || "Sin descripción proporcionada."}
                  </p>
                </div>

                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant-app/40">
                  <span className="text-[10px] font-bold text-outline-app uppercase tracking-wider block mb-1.5">
                    Contenido de la plantilla ({tpl.items.length} productos)
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {tpl.items.map((item, index) => (
                      <span
                        key={`${item.name}-${index}`}
                        className="bg-white border border-outline-variant-app/60 text-xs text-on-surface-app px-2.5 py-1 rounded-md font-bold"
                      >
                        {item.name} <span className="text-outline-app">x{item.quantity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply trigger button */}
              <button
                onClick={() => triggerApplyFeedback(tpl.id)}
                className={`w-full h-11 flex items-center justify-center gap-2 font-bold font-label-lg rounded-xl transition-all cursor-pointer active:scale-95 ${
                  appliedTemplateId === tpl.id
                    ? "bg-primary-container-app text-on-primary-container-app"
                    : "bg-primary-app hover:bg-primary-container-app text-on-primary-app"
                }`}
              >
                {appliedTemplateId === tpl.id ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#cbffc2] stroke-[2.5]" />
                    <span>¡Cargado con éxito!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>Importar esta plantilla</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Save Template Modal */}
      <Modal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Crear Nueva Plantilla"
        titleClassName="text-primary-app"
      >
        <div className="space-y-1.5 text-xs text-outline-app">
          <p>Tu lista vigente contiene <span className="font-extrabold text-primary-app">{currentActiveItems.length} productos</span> y se guardará como la base para esta plantilla.</p>
        </div>

        <form
          onSubmit={(e) => {
            handleSaveSubmit(e);
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-app">Título de la plantilla *</label>
            <input
              type="text"
              required
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              placeholder="Ej: Compras del Fin de Semana, Limpieza Express..."
              className="w-full text-sm p-3 border border-outline-variant-app bg-white rounded-xl focus:border-primary-app outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-app">Descripción (opcional)</label>
            <textarea
              rows={2}
              value={templateDesc}
              onChange={(e) => setTemplateDesc(e.target.value)}
              placeholder="Ej: Contiene la carne para parrilla, carbón y refrescos esenciales de fin de semana..."
              className="w-full text-sm p-3 border border-outline-variant-app bg-white rounded-xl focus:border-primary-app outline-none resize-none"
            ></textarea>
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-outline-variant-app/50 justify-end">
            <button
              type="button"
              onClick={() => setSaveModalOpen(false)}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high font-bold rounded-xl text-on-surface-variant-app text-sm transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-app hover:bg-primary-container-app font-bold rounded-xl text-on-primary-app text-sm transition-all active:scale-95"
            >
              Guardar Plantilla
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Eliminar plantilla"
        titleClassName="text-[#ba1a1a]"
      >
        <p className="text-sm text-[#40493d] text-center leading-relaxed">
          ¿Seguro que deseas eliminar la plantilla{" "}
          <strong>"{pendingDelete?.title}"</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={() => setPendingDelete(null)}
            className="px-4 py-2 bg-[#ebefe5] hover:bg-[#e5eadf] font-bold rounded-xl text-[#40493d] text-sm transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (pendingDelete) onDeleteTemplate(pendingDelete.id);
              setPendingDelete(null);
            }}
            className="px-4 py-2 bg-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#ba1a1a] font-bold rounded-xl text-white text-sm transition-all active:scale-95 shadow-md"
          >
            Sí, eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
