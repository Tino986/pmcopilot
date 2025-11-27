
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { FeaturePane } from './components/FeaturePane';
import { GlobalContextModal } from './components/GlobalContextModal'; // New component
import { featureConfigs, PM_FEATURES } from './constants';
import { FeatureId, FeatureConfig, FeatureState } from './types';
import { PMCopilotIcon } from './components/icons';

const App: React.FC = () => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<FeatureId>(PM_FEATURES[0].id);
  
  // Persistence State: Dictionary to hold state for each feature
  const [featureStates, setFeatureStates] = useState<Record<string, FeatureState>>({});

  // Global Context State
  const [globalContext, setGlobalContext] = useState<string>("");
  const [isContextModalOpen, setIsContextModalOpen] = useState<boolean>(false);

  const selectedFeature = useCallback((): FeatureConfig | undefined => {
    return featureConfigs.find(feature => feature.id === selectedFeatureId);
  }, [selectedFeatureId]);

  const handleSelectFeature = useCallback((id: FeatureId) => {
    setSelectedFeatureId(id);
  }, []);

  // Callback to update state for a specific feature from FeaturePane
  const handleFeatureStateUpdate = useCallback((featureId: FeatureId, newState: FeatureState) => {
    setFeatureStates(prev => ({
      ...prev,
      [featureId]: newState
    }));
  }, []);

  const currentFeatureConfig = selectedFeature();
  const currentFeatureState = currentFeatureConfig ? featureStates[currentFeatureConfig.id] : undefined;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <Sidebar
        features={PM_FEATURES}
        selectedFeatureId={selectedFeatureId}
        onSelectFeature={handleSelectFeature}
        onOpenGlobalContext={() => setIsContextModalOpen(true)}
      />
      
      <main className="flex-1 p-6 sm:p-8 md:p-10 overflow-y-auto">
        {currentFeatureConfig ? (
          <FeaturePane 
            featureConfig={currentFeatureConfig} 
            key={currentFeatureConfig.id} 
            globalContext={globalContext}
            initialState={currentFeatureState}
            onSaveState={handleFeatureStateUpdate}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <PMCopilotIcon className="w-24 h-24 text-sky-500 mb-6" />
            <h1 className="text-3xl font-bold text-slate-200 mb-2">Bienvenido a PM Copilot</h1>
            <p className="text-slate-400">Selecciona una herramienta del menú lateral para comenzar.</p>
          </div>
        )}
      </main>

      <GlobalContextModal 
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        contextValue={globalContext}
        onSave={setGlobalContext}
      />
    </div>
  );
};

export default App;