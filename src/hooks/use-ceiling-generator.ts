import { useState, useCallback, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface GeneratorState {
  uploadedImage: string | null;
  selectedColor: string | null;
  selectedFinish: string | null;
  selectedLighting: string | null;
  selectedDesign: string | null;
  generationResult: GenerationResponse | null;
}

interface UploadResponse {
  success: boolean;
  imageUrl: string;
  originalName: string;
}

interface GenerationResponse {
  success: boolean;
  generation: {
    id: number;
    generatedImageUrl: string;
    userImageUrl: string;
    selectedColor: string;
    selectedStyle: string;
    selectedLighting: string;
    style?: {
      name: string;
      description: string;
      styleId: string;
    };
  };
}

const STORAGE_KEY = "ceiling-generator-state";

const EMPTY_STATE: GeneratorState = {
  uploadedImage: null,
  selectedColor: null,
  selectedFinish: null,
  selectedLighting: null,
  selectedDesign: null,
  generationResult: null,
};

// Load state from localStorage (SSR safe)
const getInitialState = (): GeneratorState => {
  if (typeof window === "undefined") {
    // On the server, there is no localStorage
    return EMPTY_STATE;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as GeneratorState;
    }
  } catch (error) {
    console.warn("Failed to load state from localStorage:", error);
  }

  return EMPTY_STATE;
};

// Save state to localStorage (SSR safe)
const saveState = (state: GeneratorState) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save state to localStorage:", error);
  }
};

export function useCeilingGenerator() {
  const [state, setState] = useState<GeneratorState>(() => getInitialState());
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Persist state whenever it changes (client only)
  useEffect(() => {
    saveState(state);
  }, [state]);

  const uploadImage = useCallback(async (file: File): Promise<UploadResponse> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiRequest("POST", "/api/upload", formData);
      const data: UploadResponse = await response.json();

      if (data.success) {
        setState((prev) => ({ ...prev, uploadedImage: data.imageUrl }));
      }

      return data;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const setColor = useCallback((color: string) => {
    setState((prev) => ({
      ...prev,
      selectedColor: color,
      // Reset downstream selections when color changes
      selectedFinish: prev.selectedFinish,
      selectedLighting: prev.selectedLighting,
      selectedDesign: prev.selectedDesign,
      generationResult: prev.generationResult,
    }));
  }, []);

  const setFinish = useCallback((finish: string) => {
    setState((prev) => ({
      ...prev,
      selectedFinish: finish,
      // Reset downstream selections when finish changes
      selectedLighting: prev.selectedLighting,
      selectedDesign: prev.selectedDesign,
      generationResult: prev.generationResult,
    }));
  }, []);

  const setLighting = useCallback((lighting: string) => {
    setState((prev) => ({
      ...prev,
      selectedLighting: lighting,
      // Reset downstream selections when lighting changes
      selectedDesign: prev.selectedDesign,
      generationResult: prev.generationResult,
    }));
  }, []);

  const setSelectedDesign = useCallback((designId: string) => {
    setState((prev) => ({
      ...prev,
      selectedDesign: designId,
      // Clear previous generation if user picks a new design
      generationResult: null,
    }));
  }, []);

  const generateDesign = useCallback(async (): Promise<GenerationResponse | null> => {
    if (
      !state.uploadedImage ||
      !state.selectedColor ||
      !state.selectedFinish ||
      !state.selectedLighting ||
      !state.selectedDesign
    ) {
      console.warn("Cannot generate design: missing required selections", {
        uploadedImage: !!state.uploadedImage,
        selectedColor: state.selectedColor,
        selectedFinish: state.selectedFinish,
        selectedLighting: state.selectedLighting,
        selectedDesign: state.selectedDesign,
      });
      return null;
    }

    setIsGenerating(true);
    try {
      console.log("Starting design generation with state:", {
        selectedColor: state.selectedColor,
        selectedFinish: state.selectedFinish,
        selectedLighting: state.selectedLighting,
        selectedDesign: state.selectedDesign,
      });

      const response = await apiRequest("POST", "/api/generate", {
        userImageUrl: state.uploadedImage,
        styleId: state.selectedDesign,
        selectedColor: state.selectedColor,
        selectedFinish: state.selectedFinish,
        selectedLighting: state.selectedLighting,
      });

      console.log("Generation API response status:", response.status);
      const data: GenerationResponse = await response.json();
      console.log("Generation response data:", data);

      if (!data.success || !data.generation) {
        console.error("Generation failed:", data);
        return null;
      }

      setState((prev) => ({
        ...prev,
        generationResult: data,
      }));

      return data;
    } catch (error) {
      console.error("Error during design generation:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [state]);

  const reset = useCallback(() => {
    setState(EMPTY_STATE);
  }, []);

  return {
    state,
    uploadImage,
    setColor,
    setFinish,
    setLighting,
    setSelectedDesign,
    generateDesign,
    reset,
    isUploading,
    isGenerating,
  };
}
