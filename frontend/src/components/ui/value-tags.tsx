import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ValueTagsProps {
  tags: string[];
  variant?: "default" | "secondary" | "outline";
  limit?: number;
  className?: string;
}

export function ValueTags({
  tags,
  variant = "default",
  limit,
  className,
}: ValueTagsProps) {
  const displayedTags = limit ? tags.slice(0, limit) : tags;
  const remaining = limit ? tags.length - limit : 0;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} role="list">
      {displayedTags.map((tag) => (
        <Badge key={tag} variant={variant} role="listitem">
          {tag}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="neutral" role="listitem">
          +{remaining}
        </Badge>
      )}
    </div>
  );
}
