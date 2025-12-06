"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProgressNav } from "@/components/progress-nav";
import { ColorSwatch } from "@/components/color-swatch";
import { useCeilingGenerator } from "@/hooks/use-ceiling-generator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ColorPage() {
  const router = useRouter();
  const { state, setColor } = useCeilingGenerator();

  const {
    data: colors = [],
    isLoading,
    isError,
  } = useQuery<string[]>({
    queryKey: ["/api/colors"],
    queryFn: async () => {
      const res = await fetch("/api/colors");
      if (!res.ok) {
        throw new Error("Failed to fetch colors");
      }
      return res.json();
    },
  });

  // Redirect if upload not done
  useEffect(() => {
    if (!state.uploadedImage) {
      router.replace("/");
    }
  }, [state.uploadedImage, router]);

  if (!state.uploadedImage) return null;

  const colorNames: Record<string, string> = {
    white: "Classic White",
    cream: "Warm Cream",
    beige: "Soft Beige",
    gray: "Modern Gray",
    blue: "Sky Blue",
    green: "Sage Green",
    black: "Deep Black",
    brown: "Rich Brown",
    yellow: "Sunny Yellow",
    red: "Warm Red",
  };

  const canContinue = state.selectedColor;

  return (
    <div className="bg-background font-sans min-h-screen">
      <ProgressNav currentStep={2} totalSteps={6} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Ceiling Color
          </h2>
          <p className="text-lg text-muted-foreground">
            Select the base color for your ceiling design
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-destructive mb-8">
            Failed to load colors. Please try again later.
          </p>
        ) : colors.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mb-8">
            No colors available yet. Please add styles in the admin panel.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto mb-8">
            {colors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                name={colorNames[color] || color}
                selected={state.selectedColor === color}
                onClick={() => setColor(color)}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={() => router.push("/finish")}
            data-testid="button-continue"
          >
            Continue to Finish Selection
            <span className="ml-2">→</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
