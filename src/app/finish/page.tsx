// app/finish/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProgressNav } from "@/components/progress-nav";
import { useCeilingGenerator } from "@/hooks/use-ceiling-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinishPage() {
  const router = useRouter();
  const { state, setFinish } = useCeilingGenerator();

  const {
    data: finishes = [],
    isLoading,
    isError,
  } = useQuery<string[]>({
    queryKey: ["/api/finishes"],
    queryFn: async () => {
      const res = await fetch("/api/finishes");
      if (!res.ok) throw new Error("Failed to fetch finishes");
      return res.json();
    },
  });

  useEffect(() => {
    if (!state.uploadedImage || !state.selectedColor) {
      router.replace("/");
    }
  }, [state.uploadedImage, state.selectedColor, router]);

  if (!state.uploadedImage || !state.selectedColor) return null;

  const canContinue = state.selectedFinish;

  return (
    <div className="bg-background font-sans min-h-screen">
      <ProgressNav currentStep={3} totalSteps={6} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Finish
          </h2>
          <p className="text-lg text-muted-foreground">
            Select the finish type for your ceiling design
          </p>
        </div>

        {isLoading ? (
          <div className="text-center">
            <p className="text-muted-foreground">Loading finishes...</p>
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-destructive mb-8">
            Failed to load finishes. Please try again later.
          </p>
        ) : finishes.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mb-8">
            No finishes available yet. Please add styles in the admin panel.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {finishes.map((finish) => (
              <Card
                key={finish}
                className={cn(
                  "cursor-pointer transition-all border-2",
                  state.selectedFinish === finish
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                )}
                onClick={() => setFinish(finish)}
                data-testid={`finish-option-${finish
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">
                        {finish.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {finish}
                  </h3>
                  {state.selectedFinish === finish && (
                    <Badge variant="default" className="mt-2">
                      Selected
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/color")}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back: Color
          </Button>

          <Button
            size="lg"
            disabled={!canContinue}
            onClick={() => router.push("/lighting")}
            data-testid="button-continue"
          >
            Next: Lighting
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
