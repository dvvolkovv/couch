"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ValueRadarChart } from "@/components/ui/value-radar-chart";
import { formatPrice } from "@/lib/utils";
import type { ConsultationSummary as SummaryType } from "@/types";

interface ConsultationSummaryProps {
  summary: SummaryType;
  onConfirm: () => void;
  onEdit: () => void;
  loading?: boolean;
}

const SPECIALIST_TYPE_LABELS: Record<string, string> = {
  PSYCHOLOGIST: "Психолог",
  COACH: "Коуч",
  PSYCHOTHERAPIST: "Психотерапевт",
};

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "1 раз в неделю",
  biweekly: "1 раз в 2 недели",
  as_needed: "По необходимости",
};

const FORMAT_LABELS: Record<string, string> = {
  online: "Онлайн",
  offline: "Офлайн",
  hybrid: "Гибрид",
};

export function ConsultationSummary({
  summary,
  onConfirm,
  onEdit,
  loading,
}: ConsultationSummaryProps) {
  const values = summary?.valueProfile?.values ?? summary?.values ?? {};
  const preferences = summary?.preferences ?? {};
  const priceRange = preferences?.priceRange ?? [0, 0];
  const specialistType = summary?.recommendedSpecialistType ?? "PSYCHOLOGIST";

  return (
    <div className="rounded-xl border border-primary-200 bg-white shadow-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-primary-50 px-6 py-4 border-b border-primary-200">
        <h3 className="text-heading-5 text-primary-900">
          {"Результаты консультации"}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Request summary */}
        <div>
          <h4 className="text-heading-6 text-neutral-900 mb-2">
            {"Ваш запрос"}
          </h4>
          <p className="text-body-md text-neutral-700">
            {summary?.requestSummary || "Запрос сформирован на основе вашей консультации."}
          </p>
          <p className="mt-2 text-body-sm text-neutral-600">
            {"Рекомендуемый тип: "}
            <span className="font-medium text-primary-700">
              {SPECIALIST_TYPE_LABELS[specialistType] || "Психолог"}
            </span>
          </p>
        </div>

        {/* Value profile chart */}
        {Object.keys(values).length > 0 && (
          <div>
            <h4 className="text-heading-6 text-neutral-900 mb-2">
              {"Ваш ценностный профиль"}
            </h4>
            <ValueRadarChart
              clientValues={values}
              showLegend={false}
              height={220}
            />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {Object.entries(values)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([key]) => (
                  <Badge key={key} variant="default">
                    {key}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Preferences */}
        {Object.keys(preferences).length > 0 && (
          <div>
            <h4 className="text-heading-6 text-neutral-900 mb-3">
              {"Предпочтения"}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-body-sm">
              {preferences.format && (
                <div>
                  <span className="text-neutral-600">{"Формат:"}</span>
                  <span className="ml-2 font-medium text-neutral-900">
                    {FORMAT_LABELS[preferences.format] || preferences.format}
                  </span>
                </div>
              )}
              {priceRange[0] > 0 && (
                <div>
                  <span className="text-neutral-600">{"Бюджет:"}</span>
                  <span className="ml-2 font-medium text-neutral-900">
                    {formatPrice(priceRange[0])} &mdash;{" "}
                    {formatPrice(priceRange[1])}
                  </span>
                </div>
              )}
              {preferences.frequency && (
                <div>
                  <span className="text-neutral-600">{"Частота:"}</span>
                  <span className="ml-2 font-medium text-neutral-900">
                    {FREQUENCY_LABELS[preferences.frequency] || preferences.frequency}
                  </span>
                </div>
              )}
              <div>
                <span className="text-neutral-600">{"Пол:"}</span>
                <span className="ml-2 font-medium text-neutral-900">
                  {preferences.preferredGender || "Не важен"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-6 py-4 border-t border-neutral-300 bg-neutral-50">
        <Button onClick={onConfirm} loading={loading} className="flex-1">
          {"Подтвердить и получить рекомендации"}
        </Button>
        <Button variant="secondary" onClick={onEdit} disabled={loading}>
          {"Хочу уточнить"}
        </Button>
      </div>
    </div>
  );
}
