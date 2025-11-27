
import React from 'react';
import { FeatureId, PMFeatureListItem } from '../types';
import { PMCopilotIcon, BookOpenIcon } from './icons';

interface SidebarProps {
  features: PMFeatureListItem[];
  selectedFeatureId: FeatureId;
  onSelectFeature: (id: FeatureId) => void;
  onOpenGlobalContext: () => void; // New prop
}

export const Sidebar: React.FC<SidebarProps> = ({ features, selectedFeatureId, onSelectFeature, onOpenGlobalContext }) => {
  return (
    <aside className="w-64 md:w-72 bg-slate-800 p-4 space-y-6 overflow-y-auto flex flex-col">
      <div className="flex items-center space-x-3 px-2 pt-2 pb-4 border-b border-slate-700">
        <PMCopilotIcon className="h-10 w-10 text-sky-500" />
        <h1 className="text-2xl font-bold text-slate-100">PM Copilot</h1>
      </div>
      
      {/* Global Context Button */}
      <div className="px-1">
        <button
          onClick={onOpenGlobalContext}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-sky-400 hover:text-sky-300 rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-150 ease-in-out text-sm font-semibold"
        >
          <BookOpenIcon className="h-5 w-5" />
          <span>Definir Contexto Global</span>
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          const isSelected = feature.id === selectedFeatureId;
          return (
            <button
              key={feature.id}
              onClick={() => onSelectFeature(feature.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all duration-150 ease-in-out
                ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                }`}
            >
              <IconComponent className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
              <span>{feature.title}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-slate-700 text-center">
        <p className="text-xs text-slate-500">
          Powered by Gemini API
        </p>
         <p className="text-xs text-slate-500 mt-1">
          &copy; {new Date().getFullYear()} PM Copilot
        </p>
      </div>
    </aside>
  );
};