"use client";

import { cn, getMatchLabel, getMatchColor } from "@/lib/utils";

interface MatchPercentageRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { wh: 48, stroke: 4, radius: 20, fontSize: "text-caption" },
  md: { wh: 72, stroke: 5, radius: 30, fontSize: "text-body-sm" },
  lg: { wh: 96, stroke: 6, radius: 40, fontSize: "text-heading-4" },
};

export function MatchPercentageRing({
  score,
  size = "md",
  showLabel = true,
  className,
}: MatchPercentageRingProps) {
  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (score / 100) * circumference;
  const center = config.wh / 2;

  return (
    <div
      className={cn("flex flex-col items-center gap-1", className)}
      role="img"
      aria-label={`${score}% совпадение`}
    >
      <div className="relative" style={{ width: config.wh, height: config.wh }}>
        <svg
          width={config.wh}
          height={config.wh}
          className="transform -rotate-90"
        >
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={config.stroke}
          />
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke="url(#matchGradient)"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient
              id="matchGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "font-bold text-neutral-950",
              config.fontSize
            )}
          >
            {score}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-caption font-medium", getMatchColor(score))}>
          {getMatchLabel(score)}
        </span>
      )}
    </div>
  );
}
