
// FIX: Removed InlineDataPart and TextPart as they are not exported from @google/genai
import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";

// Safely get the API key to prevent crashing in environments where 'process' is not defined.
const getApiKey = (): string | undefined => {
  // 1. Try standard process.env (Node.js / Webpack / Polyfilled environments)
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
      if (process.env.API_KEY) return process.env.API_KEY;
    }
  } catch (e) {
    // process is not defined
  }

  // 2. Try import.meta.env (Vite / Modern ES Modules)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_GEMINI_API_KEY;
      }
      // @ts-ignore
      if (import.meta.env.VITE_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_API_KEY;
      }
      // @ts-ignore
      if (import.meta.env.GEMINI_API_KEY) {
        // @ts-ignore
        return import.meta.env.GEMINI_API_KEY;
      }
      // @ts-ignore
      if (import.meta.env.API_KEY) {
        // @ts-ignore
        return import.meta.env.API_KEY;
      }
    }
  } catch (e) {
    // import.meta is not defined
  }

  // 3. Try global window object (Manual injection script in index.html)
  try {
    if (typeof window !== 'undefined') {
      if ((window as any).GEMINI_API_KEY) return (window as any).GEMINI_API_KEY;
      if ((window as any).API_KEY) return (window as any).API_KEY;
    }
  } catch (e) {
    // window is not defined
  }

  return undefined;
};

const API_KEY = getApiKey();


let ai: GoogleGenAI | null = null;

// Only initialize the AI client if the API key exists.
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("API_KEY is not set. Please set VITE_GEMINI_API_KEY, GEMINI_API_KEY, or API_KEY environment variable.");
}

const MODEL_NAME = 'gemini-2.5-flash';

interface GeminiServiceResponse {
  text: string;
  groundingChunks?: GroundingChunk[];
}

export const callGeminiAPI = async (prompt: string, useGoogleSearch: boolean = false): Promise<GeminiServiceResponse> => {
  // Check if the AI client was initialized before using it.
  if (!ai) {
    return { text: "Error: API_KEY no está configurada. En Vercel, configura la variable de entorno 'VITE_GEMINI_API_KEY' (recomendado) o 'GEMINI_API_KEY'." };
  }

  try {
    const config: any = {
      temperature: 0.7, // A bit of creativity
      topP: 0.95,
      topK: 64,
    };

    if (useGoogleSearch) {
      config.tools = [{ googleSearch: {} }];
      // Do not set responseMimeType to application/json when using googleSearch
    }
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: config,
    });

    const generatedText = response.text;
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const chunks = groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;

    return { text: generatedText, groundingChunks: chunks };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "Ocurrió un error desconocido al contactar el modelo de IA.";
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage = `Error: ${error}`;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = `Error: ${(error as {message: string}).message}`;
    }
    
    // Check for specific Gemini API error details
    const typedError = error as any; // Type assertion to access potential Gemini error properties
    if (typedError?.response?.candidates?.[0]?.finishReason === 'SAFETY') {
        errorMessage = "La respuesta fue bloqueada debido a políticas de seguridad. Intenta reformular tu pregunta.";
    } else if (typedError?.message?.includes("API key not valid")) {
        errorMessage = "Error: La API Key de Gemini no es válida. Por favor, verifica la configuración.";
    }


    return { text: errorMessage };
  }
};

export const callGeminiJsonAPI = async (prompt: string): Promise<Record<string, any> | null> => {
    if (!ai) return null;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.8, // High creativity for examples
            },
        });

        const text = response.text;
        if (!text) return null;
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating JSON example:", error);
        return null;
    }
};

// Example for image and text (not used in current features but good for reference)
export const callGeminiMultimodalAPI = async (promptText: string, base64ImageData: string, mimeType: string): Promise<string> => {
  // Check if the AI client was initialized before using it.
  if (!ai) {
    return "Error: API_KEY no está configurada.";
  }
  try {
    // FIX: Removed InlineDataPart type annotation. Let TypeScript infer the type.
    const imagePart = {
      inlineData: {
        mimeType: mimeType, // e.g., 'image/png', 'image/jpeg'
        data: base64ImageData,
      },
    };
    // FIX: Removed TextPart type annotation. Let TypeScript infer the type.
    const textPart = { text: promptText };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME, // Ensure this model supports multimodal input
      contents: { parts: [textPart, imagePart] }, // Correct structure for single turn multimodal
    });
    return response.text;
  } catch (error) {
    console.error("Error calling multimodal Gemini API:", error);
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI model.";
  }
};
