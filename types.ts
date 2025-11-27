import React from 'react';

export enum FeatureId {
  USER_STORY = 'user-story',
  ACCEPTANCE_CRITERIA = 'acceptance-criteria',
  COMPETITIVE_FEATURES = 'competitive-features',
  PRD_OUTLINE = 'prd-outline',
  FEATURE_PRIORITIZATION = 'feature-prioritization', // General one, will point to RICE or specific method
  SWOT_ANALYSIS = 'swot-analysis',
  AI_TICKET_ANALYSIS = 'ai-ticket-analysis', // Renamed from CUSTOMER_FEEDBACK_SUMMARY
  RELEASE_NOTES = 'release-notes',
  AB_TEST_IDEAS = 'ab-test-ideas',
  ELEVATOR_PITCH = 'elevator-pitch',
  KANO_MODEL = 'kano-model',
  RICE_SCORING = 'rice-scoring',
  HYPOTHESIS_GENERATOR = 'hypothesis-generator',
  VALIDATION_INTERVIEW_SCRIPT = 'validation-interview-script',
  OKR_GENERATOR = 'okr-generator',
  KPI_GENERATOR = 'kpi-generator',
}

export interface FeatureInputField {
  id: string;
  label: string;
  placeholder: string;
  type: 'textarea' | 'text' | 'file'; // Added 'file' type
  rows?: number;
  defaultValue?: string;
  accept?: string; // For file inputs
}

export interface FeatureConfig {
  id: FeatureId;
  title: string;
  description: string;
  // Added React import to fix namespace error
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  inputFields: FeatureInputField[];
  promptGenerator: (inputs: Record<string, string | null>) => string; // input values can be null for file content
  outputTitle: string;
  exampleInputs?: Record<string, string>; // Added to store example data
}

export interface PMFeatureListItem {
  id: FeatureId;
  title: string;
  // Added React import to fix namespace error
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface GroundingChunkWeb {
  // FIX: Made properties optional to match the type from @google/genai
  uri?: string;
  title?: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  retrievedContext?: {
    // FIX: Made properties optional to match the type from @google/genai
    uri?: string;
    title?: string;
  };
}

// Specific types for AI Ticket Analysis feature
export interface ChartDataItem { // Used for Bar charts
  label: string;
  value: number;
}

export interface ScatterPoint { // Used for Scatter plots
  x: number;
  y: number;
  label: string; // For tooltip or point label
}

export interface AITicketAnalysisSection {
  id: string; // e.g., 'common-problem-patterns', 'solution-expectations'
  title: string;
  rawContent: string; // The full markdown content for this section, including details for section 4
  chartData?: ChartDataItem[] | ScatterPoint[]; // Data for the chart
  chartType: 'bar' | 'scatter' | 'none'; // Type of chart to render
  // 'affectedCustomers' and 'ticketIds' for section 4 will be part of 'rawContent'
}

// State Persistence Interface
export interface FeatureState {
  inputValues: Record<string, string>;
  csvFileContent: string | null;
  csvFileName: string | null;
  output: string;
  groundingChunks: GroundingChunk[];
  // Specific for ticket analysis to avoid re-parsing
  aiTicketAnalysisSections?: AITicketAnalysisSection[]; 
}