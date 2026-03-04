"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
  className,
}: StarRatingProps) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`Рейтинг: ${rating} из ${maxRating}`}
    >
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.floor(rating);
        const halfFilled =
          !filled && starValue === Math.ceil(rating) && rating % 1 >= 0.3;

        return (
          <button
            key={i}
            type="button"
            className={cn(
              "transition-colors",
              interactive
                ? "cursor-pointer hover:scale-110"
                : "cursor-default pointer-events-none"
            )}
            onClick={() => interactive && onChange?.(starValue)}
            tabIndex={interactive ? 0 : -1}
            aria-label={
              interactive ? `Оценка ${starValue}` : undefined
            }
            role={interactive ? "radio" : undefined}
            aria-checked={interactive ? starValue === Math.round(rating) : undefined}
          >
            <Star
              className={cn(
                sizeMap[size],
                filled
                  ? "fill-warning-500 text-warning-500"
                  : halfFilled
                    ? "fill-warning-500/50 text-warning-500"
                    : "fill-neutral-300 text-neutral-300"
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-body-sm font-medium text-neutral-800">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
