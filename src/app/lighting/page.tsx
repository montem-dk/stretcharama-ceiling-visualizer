// app/lighting/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProgressNav } from "@/components/progress-nav";
import { LightingOption } from "@/components/lighting-option";
import { useCeilingGenerator } from "@/hooks/use-ceiling-generator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

export default function LightingPage() {
  const router = useRouter();
  const { state, setLighting } = useCeilingGenerator();

  const {
    data: lightingOptions = [],
    isLoading,
    isError,
  } = useQuery<string[]>({
    queryKey: ["/api/lighting"],
    queryFn: async () => {
      const res = await fetch("/api/lighting");
      if (!res.ok) throw new Error("Failed to fetch lighting options");
      return res.json();
    },
  });

  useEffect(() => {
    if (!state.uploadedImage || !state.selectedColor || !state.selectedFinish) {
      router.replace("/");
    }
  }, [
    state.uploadedImage,
    state.selectedColor,
    state.selectedFinish,
    router,
  ]);

  if (!state.uploadedImage || !state.selectedColor || !state.selectedFinish)
    return null;

  const canContinue = state.selectedLighting;

  const handleNext = () => {
    router.push("/design-selection");
  };

  return (
    <div className="bg-background font-sans min-h-screen">
      <ProgressNav currentStep={4} totalSteps={6} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Lighting
          </h2>
          <p className="text-lg text-muted-foreground">
            Select the lighting type that best fits your space
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-destructive mb-8">
            Failed to load lighting options. Please try again later.
          </p>
        ) : lightingOptions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mb-8">
            No lighting options available yet. Please add styles in the admin
            panel.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
            {lightingOptions.map((lighting) => (
              <LightingOption
                key={lighting}
                lighting={lighting}
                selected={state.selectedLighting === lighting}
                onClick={() => setLighting(lighting)}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={handleNext}
            data-testid="button-next"
          >
            Next
            <ChevronRight className="ml-2" size={20} />
          </Button>
        </div>
      </main>
    </div>
  );
}
