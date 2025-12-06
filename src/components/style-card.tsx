import { cn } from "@/lib/utils";
import type { Style } from "@/types/style";

interface StyleCardProps {
  style: Style;
  selected: boolean;
  onClick: () => void;
}

export function StyleCard({ style, selected, onClick }: StyleCardProps) {
  return (
    <div
      className={cn(
        "style-card cursor-pointer bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1",
        selected && "ring-4 ring-accent"
      )}
      onClick={onClick}
      data-testid={`style-${style.styleId}`}
    >
      <img
        src={style.previewImageUrl}
        alt={`${style.name} ceiling design`}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2">
          {style.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {style.description}
        </p>
      </div>
    </div>
  );
}
