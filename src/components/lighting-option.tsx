"use client";

import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Circle,
  Gem,
  SlidersHorizontal,
  Zap,
  Sun,
} from "lucide-react";
import type { ComponentType } from "react";

interface LightingOptionProps {
  lighting: string;
  selected: boolean;
  onClick: () => void;
}

type LightingIcon = ComponentType<{ className?: string; size?: number }>;

const lightingConfig: Record<
  string,
  { icon: LightingIcon; title: string; description: string }
> = {
  recessed: {
    icon: Lightbulb,
    title: "Recessed Lighting",
    description:
      "Modern recessed lights that blend seamlessly into the ceiling for a clean, minimal look.",
  },
  pendant: {
    icon: Circle,
    title: "Pendant Lights",
    description:
      "Stylish hanging lights that serve as both illumination and decorative focal points.",
  },
  chandelier: {
    icon: Gem,
    title: "Chandelier",
    description:
      "Sophisticated chandelier designs that add elegance and grandeur to your space.",
  },
  track: {
    icon: SlidersHorizontal,
    title: "Track Lighting",
    description:
      "Versatile track systems that allow you to direct light exactly where you need it.",
  },
  led: {
    icon: Zap,
    title: "LED Strip Lighting",
    description:
      "Modern LED strips for ambient lighting and contemporary aesthetics.",
  },
  natural: {
    icon: Sun,
    title: "Natural Light",
    description:
      "Designs that maximize natural light through skylights and light wells.",
  },
};

export function LightingOption({
  lighting,
  selected,
  onClick,
}: LightingOptionProps) {
  const key = lighting.toLowerCase();
  const config =
    lightingConfig[key] ?? {
      icon: Lightbulb,
      title: lighting,
      description: `${lighting} lighting option for your ceiling design.`,
    };

  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border-2 p-4 md:p-5 bg-card transition-all",
        "cursor-pointer flex flex-col gap-3",
        "hover:border-foreground/80 hover:shadow-md hover:-translate-y-0.5",
        selected
          ? "border-accent ring-2 ring-accent/20"
          : "border-border"
      )}
      data-testid={`lighting-${key.replace(/\s+/g, "-")}`}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-lg flex items-center justify-center">
          <Icon className="text-accent" size={22} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm md:text-base">
            {config.title}
          </h3>
          <p className="text-xs text-muted-foreground">{lighting}</p>
        </div>
      </div>

      <p className="text-xs md:text-sm text-muted-foreground leading-snug">
        {config.description}
      </p>
    </button>
  );
}
