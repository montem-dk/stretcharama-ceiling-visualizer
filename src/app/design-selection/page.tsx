// app/design-selection/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProgressNav } from "@/components/progress-nav";
import { StyleCard } from "@/components/style-card";
import { useCeilingGenerator } from "@/hooks/use-ceiling-generator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wand2, Filter } from "lucide-react";
import type { Style } from "@/types/style";

export default function DesignSelectionPage() {
  const router = useRouter();
  const { state, setSelectedDesign, generateDesign, isGenerating } =
    useCeilingGenerator();

  const { data: filteredStyles = [], isLoading, isError } = useQuery<Style[]>({
    queryKey: [
      "/api/styles/filter",
      state.selectedColor,
      state.selectedLighting,
      state.selectedFinish,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (state.selectedColor) params.append("color", state.selectedColor);
      if (state.selectedLighting)
        params.append("lighting", state.selectedLighting);
      if (state.selectedFinish) params.append("finish", state.selectedFinish);

      const response = await fetch(`/api/styles/filter?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch filtered styles");
      return response.json();
    },
    enabled:
      !!state.selectedColor && !!state.selectedFinish && !!state.selectedLighting,
  });

  useEffect(() => {
    if (
      !state.uploadedImage ||
      !state.selectedColor ||
      !state.selectedFinish ||
      !state.selectedLighting
    ) {
      router.replace("/");
    }
  }, [
    state.uploadedImage,
    state.selectedColor,
    state.selectedFinish,
    state.selectedLighting,
    router,
  ]);

  if (
    !state.uploadedImage ||
    !state.selectedColor ||
    !state.selectedFinish ||
    !state.selectedLighting
  )
    return null;

  const canGenerate = state.selectedDesign && !isGenerating;

  const handleGenerate = async () => {
    try {
      const result = await generateDesign();
      console.log("Generate design completed, result:", result);

      // small delay for state to flush
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/result");
    } catch (error) {
      console.error("Error generating design:", error);
    }
  };

  const getFilteringLevel = () => {
    if (!filteredStyles) return "";

    const totalStyles = filteredStyles.length;

    const exactMatches = filteredStyles.filter(
      (style) =>
        style.color === state.selectedColor &&
        style.lighting === state.selectedLighting &&
        style.finish === state.selectedFinish
    );

    if (exactMatches.length > 0) {
      return `Showing ${totalStyles} designs matching all your preferences`;
    }

    const finishColorMatches = filteredStyles.filter(
      (style) =>
        style.color === state.selectedColor &&
        style.finish === state.selectedFinish
    );

    if (finishColorMatches.length > 0) {
      return `Showing ${totalStyles} designs matching your color and finish`;
    }

    return `Showing ${totalStyles} designs matching your color preference`;
  };

  return (
    <div className="bg-background font-sans min-h-screen">
      <ProgressNav currentStep={5} totalSteps={6} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Select Your Design
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            Choose the perfect ceiling design from our curated selection
          </p>

          {filteredStyles.length > 0 && (
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {getFilteringLevel()}
              </Badge>
            </div>
          )}

          <div className="flex justify-center flex-wrap gap-2 mb-6">
            <Badge variant="outline">Color: {state.selectedColor}</Badge>
            <Badge variant="outline">Finish: {state.selectedFinish}</Badge>
            <Badge variant="outline">Lighting: {state.selectedLighting}</Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full h-48 rounded-xl" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-destructive mb-8">
            Failed to load styles. Please try again later.
          </p>
        ) : filteredStyles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredStyles.map((style) => (
              <StyleCard
                key={style.styleId}
                style={style}
                selected={state.selectedDesign === style.styleId}
                onClick={() => setSelectedDesign(style.styleId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              No designs found matching your preferences
            </div>
            <Button variant="outline" onClick={() => router.push("/lighting")}>
              Go Back and Adjust Preferences
            </Button>
          </div>
        )}

        <div className="text-center">
          <Button
            size="lg"
            disabled={!canGenerate}
            onClick={handleGenerate}
            data-testid="button-generate"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating Design...
              </>
            ) : (
              <>
                Generate My Ceiling Design
                <Wand2 className="ml-2" size={20} />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
