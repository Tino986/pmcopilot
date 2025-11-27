import React, { useState, useEffect } from 'react';

interface GlobalContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextValue: string;
  onSave: (value: string) => void;
}

export const GlobalContextModal: React.FC<GlobalContextModalProps> = ({
  isOpen,
  onClose,
  contextValue,
  onSave,
}) => {
  const [localContext, setLocalContext] = useState(contextValue);

  useEffect(() => {
    setLocalContext(contextValue);
  }, [contextValue, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-slate-100">Contexto Global del Producto</h2>
          <p className="text-slate-400 text-sm mt-1">
            Define un contexto (ej: PRD, Resumen Ejecutivo, descripción de la empresa) que será utilizado por todas las herramientas de IA para personalizar las respuestas.
          </p>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <label htmlFor="global-context" className="block text-sm font-medium text-slate-300 mb-2">
            Descripción / Contexto
          </label>
          <textarea
            id="global-context"
            value={localContext}
            onChange={(e) => setLocalContext(e.target.value)}
            placeholder="Ej: Somos una empresa SaaS que ofrece soluciones de logística para e-commerce en Latinoamérica. Nuestro público objetivo son PYMES..."
            className="w-full h-64 p-3 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-200 placeholder-slate-500 transition-colors resize-none"
          />
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(localContext);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-md transition-colors"
          >
            Guardar Contexto
          </button>
        </div>
      </div>
    </div>
  );
};
