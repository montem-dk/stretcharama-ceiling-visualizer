"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCeilingGenerator } from "@/hooks/use-ceiling-generator";

interface ProgressNavProps {
  currentStep: number;
  totalSteps?: number;
}

export function ProgressNav({ currentStep, totalSteps = 5 }: ProgressNavProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const router = useRouter();
  const { reset } = useCeilingGenerator();

  const handleReset = () => {
    reset();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">CeilingAI</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
                data-testid="button-reset"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  step < currentStep
                    ? "bg-accent text-accent-foreground"
                    : step === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step}
              </div>
              {index < steps.length - 1 && (
                <div className="w-12 h-0.5 bg-muted"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
