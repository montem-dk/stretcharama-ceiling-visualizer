"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useCeilingGenerator } from "@/hooks/use-ceiling-generator";
import { cn } from "@/lib/utils";

interface ProgressNavProps {
  currentStep: number;
  totalSteps?: number;
}

// Map steps to routes in your flow
const stepRoutes: Record<number, string> = {
  1: "/",
  2: "/color",
  3: "/finish",
  4: "/lighting",
  5: "/design-selection",
  6: "/result",
};

export function ProgressNav({ currentStep, totalSteps = 6 }: ProgressNavProps) {
  const router = useRouter();
  const { reset } = useCeilingGenerator();
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const handleStepClick = (step: number) => {
    // Only allow going to current or previous steps
    if (step > currentStep) return;

    const path = stepRoutes[step];
    if (path) {
      router.push(path);
    }
  };

  const handleReset = () => {
    reset();
    router.push("/");
  };

  return (
    <nav className="w-full border-b bg-background border-gray-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Left: Brand / Title */}
        <div className="font-semibold text-lg text-foreground">
          Stretcharama Ceiling Visualizer
        </div>

        {/* Right: Step info + Reset */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        

        {/* Center: Steps */}
        <div className="flex flex-1 items-center justify-center">
          {steps.map((step, index) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            const isClickable = step <= currentStep;

            return (
              <div key={step} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step)}
                  disabled={!isClickable}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-s font-semibold transition-all",
                    isCompleted
                      ? "bg-red-400 text-background border-accent "
                      : isCurrent
                      ? "bg-foreground text-background border-foreground"
                      : "bg-gray-300 text-black ",
                    isClickable
                      ? "cursor-pointer hover:shadow-sm hover:brightness-105"
                      : "cursor-default opacity-100"
                  )}
                >
                  {step}
                </button>

                {/* Connector line between steps */}
                {index < steps.length - 1 && (
                  <div className="mx-2 h-[2px] w-12 bg-foreground/30" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
