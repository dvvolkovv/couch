"use client";

import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CatalogFilters } from "@/types";

const SPECIALIST_TYPES = [
  { value: "PSYCHOLOGIST", label: "Психолог" },
  { value: "COACH", label: "Коуч" },
  { value: "PSYCHOTHERAPIST", label: "Психотерапевт" },
];

const APPROACHES = [
  "КПТ",
  "Гештальт",
  "Психоанализ",
  "Экзистенциальная",
  "Коучинг",
  "EMDR",
  "Арт-терапия",
  "Телесная",
];

const RATING_OPTIONS = [
  { value: 0, label: "Любой" },
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
          {"Фильтры"}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-body-sm text-primary-700 hover:underline"
          >
            {"Сброс"}
          </button>
        )}
      </div>

      {/* Specialist type */}
      <fieldset>
        <legend className="text-heading-6 text-neutral-900 mb-3">
          {"Тип специалиста"}
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
          {"Цена за сессию"}
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
            aria-label="Минимальная цена"
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
            aria-label="Максимальная цена"
          />
        </div>
        <p className="mt-1 text-caption text-neutral-500">{"Рублей за сессию"}</p>
      </fieldset>

      {/* Format */}
      <fieldset>
        <legend className="text-heading-6 text-neutral-900 mb-3">
          {"Формат"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "Все" },
            { value: "online", label: "Онлайн" },
            { value: "offline", label: "Офлайн" },
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
          {"Подход"}
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
              ? "Скрыть"
              : `Показать все (${APPROACHES.length})`}
          </button>
        )}
      </fieldset>

      {/* Rating */}
      <fieldset>
        <legend className="text-heading-6 text-neutral-900 mb-3">
          {"Рейтинг"}
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
          {"Пол"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "Все" },
            { value: "female", label: "Ж" },
            { value: "male", label: "М" },
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
