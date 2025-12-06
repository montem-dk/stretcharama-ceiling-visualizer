import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  color: string;
  name: string;
  selected: boolean;
  onClick: () => void;
}

const colorMap: Record<string, string> = {
  white: "bg-white",
  cream: "bg-amber-50",
  beige: "bg-stone-100",
  gray: "bg-gray-200",
  blue: "bg-blue-100",
  green: "bg-green-100",
  black: "bg-gray-900",
  brown: "bg-amber-200",
  yellow: "bg-yellow-100",
  red: "bg-red-100",
};

export function ColorSwatch({ color, name, selected, onClick }: ColorSwatchProps) {
  const bgClass = colorMap[color.toLowerCase()] || "bg-gray-200";

  return (
    <div 
      className="color-swatch cursor-pointer transition-all hover:scale-105" 
      onClick={onClick}
      data-testid={`color-${color}`}
    >
      <div
        className={cn(
          "w-full aspect-square border-2 rounded-xl shadow-sm hover:shadow-md transition-all mb-2",
          bgClass,
          selected ? "border-accent ring-2 ring-accent/20" : "border-border"
        )}
      />
      <p className="text-center text-sm font-medium text-foreground">{name}</p>
    </div>
  );
}
