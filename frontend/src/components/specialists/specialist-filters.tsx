"use client";

import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CatalogFilters } from "@/types";

const SPECIALIST_TYPES = [
  { value: "PSYCHOLOGIST", label: "\u041F\u0441\u0438\u0445\u043E\u043B\u043E\u0433" },
  { value: "COACH", label: "\u041A\u043E\u0443\u0447" },
  { value: "PSYCHOTHERAPIST", label: "\u041F\u0441\u0438\u0445\u043E\u0442\u0435\u0440\u0430\u043F\u0435\u0432\u0442" },
];

const APPROACHES = [
  "\u041A\u041F\u0422",
  "\u0413\u0435\u0448\u0442\u0430\u043B\u044C\u0442",
  "\u041F\u0441\u0438\u0445\u043E\u0430\u043D\u0430\u043B\u0438\u0437",
  "\u042D\u043A\u0437\u0438\u0441\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u0430\u044F",
  "\u041A\u043E\u0443\u0447\u0438\u043D\u0433",
  "EMDR",
  "\u0410\u0440\u0442-\u0442\u0435\u0440\u0430\u043F\u0438\u044F",
  "\u0422\u0435\u043B\u0435\u0441\u043D\u0430\u044F",
];

const RATING_OPTIONS = [
  { value: 0, label: "\u041B\u044E\u0431\u043E\u0439" },
  { value: 4.0, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
  { value: 4.8, label: "4.8+" },
];

interface SpecialistFiltersProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  className?: string;
}

export function SpecialistFilters({
  filters,
  onChange,
  className,
}: SpecialistFiltersProps) {
  const [showAllApproaches, setShowAllApproaches] = useState(false);
  const displayedApproaches = showAllApproaches
    ? APPROACHES
    : APPROACHES.slice(0, 5);

  const updateFilter = (key: keyof CatalogFilters, value: unknown) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleInArray = (key: "type" | "approach", value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? updated : undefined);
  };

  const resetFilters = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== "all" && (Array.isArray(v) ? v.length > 0 : true)
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-heading-5 text-neutral-900 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          {"\u0424\u0438\u043B\u044C\u0442\u0440\u044B"}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-body-sm text-primary-700 hover:underline"
          >
            {"\u0421\u0431\u0440\u043E\u0441"}
          </button>
        )}
      </div>

      {/* Specialist type */}
      <fieldset>
        <legend className="text-heading-6 text-neutral-900 mb-3">
          {"\u0422\u0438\u043F \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u0430"}
        </legend>
        <div className="space-y-2">
          {SPECIALIST_TYPES.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={(filters.type || []).includes(value as any)}
                onChange={() => toggleInArray("type", value)}
                className="h-4 w-4 rounded border-neutral-400 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-body-sm text-neutral-700 group-hover:text-neutral-900">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Price range */}
      <fieldset>
        <legend className="text-heading-6 text-neutral-900 mb-3">
          {"\u0426\u0435\u043D\u0430 \u0437\u0430 \u0441\u0435\u0441\u0441\u0438\u044E"}
        </legend>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="1 000"
            value={filters.priceMin || ""}
            onChange={(e) =>
              updateFilter(
                "priceMin",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded-md border border-neutral-400 px-3 py-2 text-body-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            min={0}
            aria-label="\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0446\u0435\u043D\u0430"
          />
          <span className="text-neutral-500">&mdash;</span>
          <input
            type="number"
            placeholder="10 000"
            value={filters.priceMax || ""}
            onChange={(e) =>
              updateFilter(
                "priceMax",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded-md border border-neutral-400 px-3 py-2 text-body-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            min={0}
            aria-label="\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0446\u0435\u043D\u0430"
          />
        </div>
        <p className="mt-1 text-caption text-neutral-500">{"\u0420\u0443\u0431\u043B\u0435\u0439 \u0437\u0430 \u0441\u0435\u0441\u0441\u0438\u044E"}</p>
      </fieldset>

      {/* Format */}
      <fieldset>
        <legend className="text-heading-6 text-neutral-900 mb-3">
          {"\u0424\u043E\u0440\u043C\u0430\u0442"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "\u0412\u0441\u0435" },
            { value: "online", label: "\u041E\u043D\u043B\u0430\u0439\u043D" },
            { value: "offline", label: "\u041E\u0444\u043B\u0430\u0439\u043D" },
          ].map(({ value, label }) => (
            <button
              key={value}
              className={cn(
                "rounded-full border px-4 py-1.5 text-body-sm font-medium transition-colors",
                (filters.format || "all") === value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-neutral-400 text-neutral-700 hover:border-primary-300"
              )}
              onClick={() => updateFilter("format", value as any)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Approaches */}
      <fieldset>
        <legend className="text-heading-6 text-neutral-900 mb-3">
          {"\u041F\u043E\u0434\u0445\u043E\u0434"}
        </legend>
        <div className="space-y-2">
          {displayedApproaches.map((approach) => (
            <label
              key={approach}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={(filters.approach || []).includes(approach)}
                onChange={() => toggleInArray("approach", approach)}
                className="h-4 w-4 rounded border-neutral-400 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-body-sm text-neutral-700 group-hover:text-neutral-900">
                {approach}
              </span>
            </label>
          ))}
        </div>
        {APPROACHES.length > 5 && (
          <button
            className="mt-2 text-body-sm text-primary-700 hover:underline"
            onClick={() => setShowAllApproaches(!showAllApproaches)}
          >
            {showAllApproaches
              ? "\u0421\u043A\u0440\u044B\u0442\u044C"
              : `\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0441\u0435 (${APPROACHES.length})`}
          </button>
        )}
      </fieldset>

      {/* Rating */}
      <fieldset>
        <legend className="text-heading-6 text-neutral-900 mb-3">
          {"\u0420\u0435\u0439\u0442\u0438\u043D\u0433"}
        </legend>
        <div className="space-y-2">
          {RATING_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="rating"
                checked={(filters.ratingMin || 0) === value}
                onChange={() =>
                  updateFilter("ratingMin", value || undefined)
                }
                className="h-4 w-4 border-neutral-400 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-body-sm text-neutral-700 group-hover:text-neutral-900">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Gender */}
      <fieldset>
        <legend className="text-heading-6 text-neutral-900 mb-3">
          {"\u041F\u043E\u043B"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "\u0412\u0441\u0435" },
            { value: "female", label: "\u0416" },
            { value: "male", label: "\u041C" },
          ].map(({ value, label }) => (
            <button
              key={value}
              className={cn(
                "rounded-full border px-4 py-1.5 text-body-sm font-medium transition-colors",
                (filters.gender || "all") === value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-neutral-400 text-neutral-700 hover:border-primary-300"
              )}
              onClick={() => updateFilter("gender", value as any)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
