
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { FeatureConfig, GroundingChunk, FeatureId, AITicketAnalysisSection, ChartDataItem, ScatterPoint, FeatureState } from '../types';
import { callGeminiAPI, callGeminiJsonAPI } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { SparklesIcon, ClipboardDocumentIcon, LinkIcon, DocumentArrowUpIcon, ChevronDownIcon, ChevronUpIcon, ChartBarIcon, LightBulbIcon, BookOpenIcon, CheckIcon } from './icons';
import { Bar, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import { RichTextEditor } from './RichTextEditor';
import { parse } from 'marked';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend);

interface FeaturePaneProps {
  featureConfig: FeatureConfig;
  globalContext: string;
  initialState?: FeatureState;
  onSaveState: (id: FeatureId, state: FeatureState) => void;
}

const parseAITicketAnalysisOutput = (markdownText: string): AITicketAnalysisSection[] => {
  const sections: AITicketAnalysisSection[] = [];
  const rawSections = markdownText.split(/^##\s+/m).filter(Boolean); // Split by "## " at the beginning of a line

  rawSections.forEach((rawSectionText, index) => {
    const lines = rawSectionText.trim().split('\n');
    const title = lines[0].trim();
    // Reconstruct the rest of the content. We need valid Markdown for parsing later.
    const contentMarkdown = lines.slice(1).join('\n').trim();
    
    let sectionId = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    let chartData: ChartDataItem[] | ScatterPoint[] | undefined = undefined;
    let chartType: AITicketAnalysisSection['chartType'] = 'none';

    const lowerTitle = title.toLowerCase();

    // Helper to clean Markdown bolding from labels
    const cleanLabel = (text: string) => text.replace(/\*\*/g, '').trim();

    // Chart Parsing Logic
    if (lowerTitle.includes('patrones') && lowerTitle.includes('problemas')) {
      sectionId = 'common-problem-patterns';
      chartType = 'bar';
      const patternRegex = /-\s*(.+?)\s*\(Frecuencia:\s*(\d+)\)/g;
      const data: ChartDataItem[] = [];
      let match;
      while ((match = patternRegex.exec(contentMarkdown)) !== null) {
        data.push({ label: cleanLabel(match[1]), value: parseInt(match[2], 10) });
      }
      if (data.length > 0) chartData = data;
    } else if (lowerTitle.includes('expectativas') && lowerTitle.includes('solución')) {
      sectionId = 'solution-expectations';
      chartType = 'bar';
      const expectationRegex = /-\s*(.+?)\s*\(Importancia Estimada:\s*(\d+)(?: de 1 a 5)?\)/g;
      const data: ChartDataItem[] = [];
      let match;
      while ((match = expectationRegex.exec(contentMarkdown)) !== null) {
        data.push({ label: cleanLabel(match[1]), value: parseInt(match[2], 10) });
      }
      if (data.length > 0) chartData = data;
    } else if (lowerTitle.includes('insights') && lowerTitle.includes('volumen')) {
      sectionId = 'volume-impact-insights';
      chartType = 'scatter';
      const tableRegex = /\|\s*(.*?)\s*\|\s*(\d)\s*\|\s*(\d)\s*\|(.*?)\|/g;
      const data: ScatterPoint[] = [];
      let match;
      const contentRows = contentMarkdown.split('\n').filter(row => row.includes('|') && !row.toLowerCase().includes('insight') && !row.includes('---'));

      for (const row of contentRows) {
        match = tableRegex.exec(row); 
         if (match) {
            data.push({ label: cleanLabel(match[1]), x: parseInt(match[2], 10), y: parseInt(match[3], 10) });
        }
        tableRegex.lastIndex = 0; 
      }
      if (data.length > 0) chartData = data;
    } else if (lowerTitle.includes('predicción') && lowerTitle.includes('baja')) {
      sectionId = 'customer-churn-prediction';
      chartType = 'bar';
      const churnRegex = /-\s*(.+?)\s*\(Riesgo Estimado:\s*(\d+)%?\)/g;
      const data: ChartDataItem[] = [];
      let match;
      const mainReasonLines = contentMarkdown.split('\n').filter(line => line.match(churnRegex));
      for (const line of mainReasonLines) {
        match = churnRegex.exec(line);
        if (match) {
            data.push({ label: cleanLabel(match[1]), value: parseInt(match[2], 10) });
        }
        churnRegex.lastIndex = 0; 
      }
      if (data.length > 0) chartData = data;
    } else if (lowerTitle.includes('estrategias')) {
      sectionId = 'preventive-strategies';
      chartType = 'bar';
      const strategyRegex = /-\s*(.+?)\s*\(Impacto Potencial Estimado:\s*(\d+)(?: de 1 a 5)?\)/g;
      const data: ChartDataItem[] = [];
      let match;
      while ((match = strategyRegex.exec(contentMarkdown)) !== null) {
        data.push({ label: cleanLabel(match[1]), value: parseInt(match[2], 10) });
      }
      if (data.length > 0) chartData = data;
    }

    // Convert the markdown content to HTML for the editor immediately
    const contentHtml = parse(contentMarkdown) as string;

    sections.push({
      id: sectionId || `section-${index}`,
      title,
      rawContent: contentHtml, // Storing HTML in rawContent for consistency with the new editor flow
      chartData,
      chartType: chartData && chartData.length > 0 ? chartType : 'none',
    });
  });
  return sections;
};

export const FeaturePane: React.FC<FeaturePaneProps> = ({ featureConfig, globalContext, initialState, onSaveState }) => {
  const defaultInputValues = useMemo(() => featureConfig.inputFields
    .filter(field => field.type !== 'file')
    .reduce((acc, field) => {
      acc[field.id] = field.defaultValue || '';
      return acc;
    }, {} as Record<string, string>), [featureConfig.inputFields]);

  const [inputValues, setInputValues] = useState<Record<string, string>>(initialState?.inputValues || defaultInputValues);
  const [csvFileContent, setCsvFileContent] = useState<string | null>(initialState?.csvFileContent || null);
  const [csvFileName, setCsvFileName] = useState<string | null>(initialState?.csvFileName || null);
  const [output, setOutput] = useState<string>(initialState?.output || ''); // Stores raw output from AI (MD) or HTML if modified? Let's treat this as the source of truth for persistence.
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>(initialState?.groundingChunks || []);
  
  // New State for Editor: We need to store the HTML content currently in the editor.
  // For standard features, this is a single string.
  // For Ticket Analysis, this is embedded in the sections array.
  const [editorHtml, setEditorHtml] = useState<string>(''); 
  const [aiTicketAnalysisSections, setAiTicketAnalysisSections] = useState<AITicketAnalysisSection[]>(initialState?.aiTicketAnalysisSections || []);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingExample, setIsLoadingExample] = useState<boolean>(false); // New state for example loading
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeAccordionSections, setActiveAccordionSections] = useState<Record<string, boolean>>({});

  // Sync state persistence
  useEffect(() => {
    onSaveState(featureConfig.id, {
      inputValues,
      csvFileContent,
      csvFileName,
      output: output, // We keep the "original" output or the last generated state
      groundingChunks,
      aiTicketAnalysisSections
    });
  }, [inputValues, csvFileContent, csvFileName, output, groundingChunks, aiTicketAnalysisSections, featureConfig.id, onSaveState]);


  // Initialization Effect
  useEffect(() => {
    if (initialState?.output && !editorHtml && featureConfig.id !== FeatureId.AI_TICKET_ANALYSIS) {
        // Restore editor state from persisted markdown (convert to HTML first)
        // If we persisted HTML we could use it directly, but let's re-parse to be safe or assuming 'output' was the MD.
        // Actually, let's assume 'output' in persisted state might be MD from the API.
        const html = parse(initialState.output) as string;
        setEditorHtml(html);
    }

    if (featureConfig.id === FeatureId.AI_TICKET_ANALYSIS && output) {
      if (aiTicketAnalysisSections.length === 0) {
          const parsedSections = parseAITicketAnalysisOutput(output);
          setAiTicketAnalysisSections(parsedSections);
          const initialActiveSections: Record<string, boolean> = {};
          parsedSections.forEach(sec => initialActiveSections[sec.id] = true);
          setActiveAccordionSections(initialActiveSections);
      } else {
           const initialActiveSections: Record<string, boolean> = {};
           aiTicketAnalysisSections.forEach(sec => initialActiveSections[sec.id] = true);
           setActiveAccordionSections(initialActiveSections);
      }
    } else if (featureConfig.id !== FeatureId.AI_TICKET_ANALYSIS) {
        // Clear ticket sections if switching away
        setAiTicketAnalysisSections([]);
    }
  }, [output, featureConfig.id]);

  const toggleAccordionSection = (sectionId: string) => {
    setActiveAccordionSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleInputChange = useCallback((id: string, value: string) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv") || file.type === "application/vnd.ms-excel") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setCsvFileContent(text);
          setCsvFileName(file.name);
           if (featureConfig.id === FeatureId.AI_TICKET_ANALYSIS && fieldId === 'ticketCsvFile') {
             setInputValues(prev => ({ ...prev, ticketText: '' }));
           }
          setError(null);
        };
        reader.onerror = () => {
          setError("Error al leer el archivo CSV.");
        };
        reader.readAsText(file);
      } else {
        setError("Por favor, sube un archivo CSV válido.");
        event.target.value = '';
      }
    }
  }, [featureConfig.id]);

  const handleLoadExample = useCallback(async () => {
    setError(null);
    setIsLoadingExample(true);

    // Identify which fields need examples (skip file inputs)
    const fieldsToPopulate = featureConfig.inputFields.filter(f => f.type !== 'file');
    const fieldIds = fieldsToPopulate.map(f => f.id);

    try {
      // Construct prompt for dynamic generation
      const prompt = `Genera un objeto JSON con datos de ejemplo en Español para probar la funcionalidad de una herramienta de Product Management.
      
      Herramienta: "${featureConfig.title}"
      Descripción: "${featureConfig.description}"
      Campos a completar (IDs): ${fieldIds.join(', ')}

      CONTEXTO DEL PRODUCTO: ${globalContext ? `"${globalContext}"` : "No hay contexto definido. Inventa un producto digital innovador, realista y creativo (puede ser una App, SaaS, Marketplace, etc) para usar como ejemplo."}

      Instrucciones:
      1. Genera contenido realista y profesional que encaje con el Contexto del Producto (si existe) o el producto inventado.
      2. El JSON debe tener como claves EXACTAMENTE los IDs de los campos listados arriba.
      3. IMPORTANTE: Los valores de los campos deben ser cadenas de texto (Strings).
      4. Si un campo requiere una lista (ej: listas de funcionalidades, tickets, competidores), el valor debe ser UN SOLO STRING con los elementos separados por "\\n" (escapado). Asegúrate de que el JSON no contenga caracteres de control reales (saltos de línea sin escapar) dentro de los valores. NO devuelvas Arrays ([]) ni Objetos ({}) anidados.
      5. No incluyas markdown, solo el JSON crudo.
      `;

      // Call AI to get JSON
      const dynamicData = await callGeminiJsonAPI(prompt);

      if (dynamicData) {
        // Merge dynamic data into input values
        // We only take values that match our field IDs to be safe
        const newValues: Record<string, string> = {};
        fieldIds.forEach(id => {
          if (dynamicData[id] !== undefined) {
             let value = dynamicData[id];

             // Robust handling for unexpected types (Arrays or Objects)
             if (Array.isArray(value)) {
                 // Convert Array to multiline string
                 value = value.map((item: any) => {
                     if (typeof item === 'object' && item !== null) {
                         // Flatten object to string retaining keys for context
                         return Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ');
                     }
                     return String(item);
                 }).join('\n');
             } else if (typeof value === 'object' && value !== null) {
                 // Convert Object to string if it slipped through
                 value = JSON.stringify(value); 
             }

            newValues[id] = String(value);
          } else if (featureConfig.exampleInputs && featureConfig.exampleInputs[id]) {
             // Partial fallback if AI missed a field
             newValues[id] = featureConfig.exampleInputs[id];
          }
        });
        
        setInputValues(prev => ({ ...prev, ...newValues }));
      } else {
        // Fallback to static examples if AI fails completely (or null returned)
        console.warn("Falling back to static examples due to AI failure.");
        if (featureConfig.exampleInputs) {
           setInputValues(prev => ({ ...prev, ...featureConfig.exampleInputs }));
        }
      }

      // Cleanup specific to Ticket Analysis
      if (featureConfig.id === FeatureId.AI_TICKET_ANALYSIS) {
        setCsvFileContent(null);
        setCsvFileName(null);
      }

    } catch (e) {
      console.error("Error loading example:", e);
      // Final Fallback
      if (featureConfig.exampleInputs) {
        setInputValues(prev => ({ ...prev, ...featureConfig.exampleInputs }));
      }
    } finally {
      setIsLoadingExample(false);
    }
  }, [featureConfig, globalContext]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setOutput(''); 
    setEditorHtml('');
    setGroundingChunks([]);
    setAiTicketAnalysisSections([]);
    setCopied(false);

    const promptInputs: Record<string, string | null> = { ...inputValues };
    if (featureConfig.id === FeatureId.AI_TICKET_ANALYSIS) {
        promptInputs.ticketCsvFileContent = csvFileContent; 
    }

    let prompt = featureConfig.promptGenerator(promptInputs);

    if (globalContext && globalContext.trim() !== "") {
        prompt += `\n\n--- CONTEXTO GLOBAL ---\n${globalContext}\n-----------------------`;
    }

    const useGoogleSearch = featureConfig.id === FeatureId.COMPETITIVE_FEATURES || featureConfig.id === FeatureId.SWOT_ANALYSIS;

    try {
      const response = await callGeminiAPI(prompt, useGoogleSearch);
      
      // Store raw MD for persistence/backup
      setOutput(response.text); 
      
      if (!response.text.startsWith("Error:")) {
        // Convert Markdown to HTML for the Editor
        if (featureConfig.id !== FeatureId.AI_TICKET_ANALYSIS) {
            const parsedHtml = parse(response.text) as string;
            setEditorHtml(parsedHtml);
        }
      }

      if (response.groundingChunks) {
        setGroundingChunks(response.groundingChunks);
      }
      if (response.text.startsWith("Error:")) { 
        setError(response.text);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [featureConfig, inputValues, csvFileContent, globalContext]);

  const handleCopyOutput = useCallback(async (contentToCopy: string) => {
    if (!contentToCopy) return;

    try {
      // Clean HTML for Google Docs/Word
      // We wrap it in a div with black color to ensure it doesn't paste as white-on-white
      const cleanHtml = `
        <div style="font-family: Arial, sans-serif; color: #000000; line-height: 1.6;">
          ${contentToCopy.replace(/class="[^"]*"/g, '')} 
        </div>
      `;
      
      const blobHtml = new Blob([cleanHtml], { type: 'text/html' });
      // Create a plain text fallback by stripping HTML tags
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentToCopy;
      const plainText = tempDiv.innerText || tempDiv.textContent || '';
      const blobText = new Blob([plainText], { type: 'text/plain' });

      const data = [new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
      })];

      await navigator.clipboard.write(data);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text/html: ', err);
      // Fallback
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentToCopy;
      await navigator.clipboard.writeText(tempDiv.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleSectionContentChange = (sectionId: string, newHtml: string) => {
    setAiTicketAnalysisSections(prev => prev.map(sec => 
        sec.id === sectionId ? { ...sec, rawContent: newHtml } : sec
    ));
  };

  // Helper for charts (reuse same logic)
  const renderBarChart = (chartItems: ChartDataItem[], chartTitle: string, yAxisLabel: string = 'Valor') => {
    if (!chartItems || chartItems.length === 0) return null;
    const data: ChartData<'bar'> = {
      labels: chartItems.map(item => item.label),
      datasets: [{
          label: yAxisLabel,
          data: chartItems.map(item => item.value),
          backgroundColor: 'rgba(56, 189, 248, 0.6)', 
          borderColor: 'rgba(14, 165, 233, 1)', 
          borderWidth: 1,
      }],
    };
    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: '#475569' } },
        y: { ticks: { color: '#cbd5e1', autoSkip: false }, grid: { display: false } },
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: chartTitle, color: '#f1f5f9' }
      },
    };
    return <div style={{ height: `${Math.max(150, chartItems.length * 40 + 50)}px` }} className="my-4 p-2 bg-slate-700/30 rounded"><Bar options={options} data={data} /></div>;
  };
  
  const renderScatterChart = (scatterPoints: ScatterPoint[], chartTitle: string) => {
    if (!scatterPoints || scatterPoints.length === 0) return null;
    const data: ChartData<'scatter'> = {
      datasets: [{
          label: 'Insights',
          data: scatterPoints.map(p => ({x: p.x, y: p.y})), 
          backgroundColor: 'rgba(56, 189, 248, 0.7)', 
      }],
    };
    const options: ChartOptions<'scatter'> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { min: 0, max: 6, title: { display: true, text: 'Volumen', color: '#cbd5e1' }, ticks: { color: '#94a3b8' }, grid: { color: '#475569' } },
        y: { min: 0, max: 6, title: { display: true, text: 'Impacto', color: '#cbd5e1' }, ticks: { color: '#94a3b8' }, grid: { color: '#475569' } },
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: chartTitle, color: '#f1f5f9' },
        tooltip: {
            callbacks: {
                label: (ctx) => `${scatterPoints[ctx.dataIndex]?.label}: (${ctx.parsed.x}, ${ctx.parsed.y})`
            }
        }
      },
    };
    return <div style={{ height: '350px' }} className="my-4 p-2 bg-slate-700/30 rounded"><Scatter options={options} data={data} /></div>;
  };

  const FeatureIcon = featureConfig.icon || SparklesIcon;

  return (
    <div className="bg-slate-800 shadow-xl rounded-xl p-6 md:p-8 max-w-4xl mx-auto animate-fadeIn pb-24">
      {globalContext && globalContext.trim() !== "" && (
          <div className="mb-6 p-3 bg-sky-900/30 border border-sky-800 rounded-md flex items-center">
             <BookOpenIcon className="w-5 h-5 text-sky-400 mr-3 flex-shrink-0" />
             <div className="text-sm text-sky-200">
               <span className="font-semibold">Contexto Global Activo</span>
             </div>
          </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center mb-2">
            <FeatureIcon className="w-8 h-8 text-sky-500 mr-3" />
            <h2 className="text-2xl font-bold text-slate-100">{featureConfig.title}</h2>
          </div>
          <p className="text-slate-400">{featureConfig.description}</p>
        </div>
        
        {/* Load Example Button */}
        <button
          onClick={handleLoadExample}
          disabled={isLoading || isLoadingExample}
          className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-sky-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
          title="Carga un ejemplo dinámico generado por IA"
        >
          {isLoadingExample ? (
            <LoadingSpinner className="w-4 h-4 text-sky-300" />
          ) : (
            <LightBulbIcon className="w-4 h-4" />
          )}
          <span>{isLoadingExample ? 'Generando...' : 'Cargar Ejemplo'}</span>
        </button>
      </div>

      <div className="space-y-6 mb-8">
        {featureConfig.inputFields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-slate-300 mb-2">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.id}
                rows={field.rows || 4}
                className="w-full p-3 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-500 transition-colors"
                placeholder={field.placeholder}
                value={inputValues[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              />
            ) : field.type === 'file' ? (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                   <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-md transition-colors flex items-center border border-slate-500">
                    <DocumentArrowUpIcon className="w-5 h-5 mr-2 text-sky-400" />
                    <span>Seleccionar Archivo</span>
                    <input
                      id={field.id}
                      type="file"
                      accept={field.accept}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, field.id)}
                    />
                  </label>
                  <span className="ml-3 text-sm text-slate-400 italic">
                    {csvFileName ? csvFileName : 'Ningún archivo seleccionado'}
                  </span>
                </div>
                {csvFileName && (
                  <p className="text-xs text-green-400">
                    ✓ Archivo cargado correctamente. El texto ingresado manualmente será ignorado.
                  </p>
                )}
              </div>
            ) : (
              <input
                type={field.type}
                id={field.id}
                className="w-full p-3 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-500 transition-colors"
                placeholder={field.placeholder}
                value={inputValues[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || isLoadingExample}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="w-5 h-5 mr-2" />
            Analizando y Generando...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generar {featureConfig.outputTitle}
          </>
        )}
      </button>

      {error && <ErrorDisplay message={error} className="mt-6" />}

      {isLoading && (
        <div className="mt-8 space-y-6 animate-pulse pt-8 border-t border-slate-700">
            {/* Header Structure */}
            <div className="flex items-center space-x-4 mb-6">
                <div className="h-8 bg-slate-700/50 rounded w-1/3"></div>
            </div>
            
            {/* Paragraph block 1 */}
            <div className="space-y-3">
              <div className="h-4 bg-slate-700/50 rounded w-full"></div>
              <div className="h-4 bg-slate-700/50 rounded w-11/12"></div>
              <div className="h-4 bg-slate-700/50 rounded w-full"></div>
              <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
            </div>

            {/* Subheader and List */}
            <div className="pt-4 space-y-4">
               <div className="h-6 bg-slate-700/50 rounded w-1/4 mb-2"></div>
               <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-slate-700/50 flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700/50 rounded w-11/12"></div>
                    <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
                  </div>
               </div>
               <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-slate-700/50 flex-shrink-0"></div>
                   <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700/50 rounded w-10/12"></div>
                  </div>
               </div>
            </div>

            <div className="flex justify-center mt-6 pt-4">
               <span className="text-sm text-slate-500 font-medium animate-pulse">Generando respuesta inteligente...</span>
            </div>
        </div>
      )}

      {/* Output Display */}
      {((editorHtml && featureConfig.id !== FeatureId.AI_TICKET_ANALYSIS) || 
        (aiTicketAnalysisSections.length > 0 && featureConfig.id === FeatureId.AI_TICKET_ANALYSIS)) && !isLoading && (
        <div className="mt-8 pt-8 border-t border-slate-700 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-200">
              {featureConfig.outputTitle}
            </h3>
            <button
              onClick={() => handleCopyOutput(featureConfig.id === FeatureId.AI_TICKET_ANALYSIS ? output : editorHtml)}
              className="flex items-center space-x-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
              title="Copiar resultado formateado para Google Docs"
            >
              {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Formato'}</span>
            </button>
          </div>
          
          {featureConfig.id === FeatureId.AI_TICKET_ANALYSIS ? (
             // Special Rendering for Ticket Analysis with Accordions and Editors inside
             <div className="space-y-4">
                {aiTicketAnalysisSections.map((section) => (
                  <div key={section.id} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50">
                    <button 
                      onClick={() => toggleAccordionSection(section.id)}
                      className="w-full flex items-center justify-between p-4 text-left bg-slate-700/50 hover:bg-slate-700 transition-colors"
                    >
                      <span className="font-semibold text-slate-200">{section.title}</span>
                      {activeAccordionSections[section.id] ? (
                        <ChevronUpIcon className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    
                    {activeAccordionSections[section.id] && (
                      <div className="p-4 bg-slate-800 border-t border-slate-700 animate-fadeIn">
                        {/* Render Chart if available */}
                        {section.chartType === 'bar' && section.chartData && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                              <ChartBarIcon className="w-4 h-4 mr-2" />
                              Visualización de Datos
                            </h4>
                            {renderBarChart(section.chartData as ChartDataItem[], section.title)}
                          </div>
                        )}
                        {section.chartType === 'scatter' && section.chartData && (
                           <div className="mb-6">
                            <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                              <ChartBarIcon className="w-4 h-4 mr-2" />
                              Matriz de Impacto
                            </h4>
                            {renderScatterChart(section.chartData as ScatterPoint[], section.title)}
                          </div>
                        )}

                        {/* Editable Content */}
                        <div className="mt-4">
                           <h4 className="text-xs uppercase font-bold text-slate-500 mb-2 tracking-wider">Análisis Detallado (Editable)</h4>
                           <RichTextEditor 
                              initialContent={section.rawContent} 
                              onContentChange={(newHtml) => handleSectionContentChange(section.id, newHtml)} 
                           />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
             </div>
          ) : (
             // Standard Features: Single Rich Text Editor
             <RichTextEditor 
                initialContent={editorHtml} 
                onContentChange={setEditorHtml} 
             />
          )}

          {groundingChunks.length > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-700">
               <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Fuentes y Referencias
               </h4>
               <ul className="space-y-2">
                  {groundingChunks.map((chunk, index) => {
                     const url = chunk.web?.uri || chunk.retrievedContext?.uri;
                     const title = chunk.web?.title || chunk.retrievedContext?.title || url;
                     if (!url) return null;
                     return (
                        <li key={index} className="text-sm">
                           <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sky-400 hover:text-sky-300 hover:underline truncate block"
                           >
                              {title}
                           </a>
                        </li>
                     );
                  })}
               </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
