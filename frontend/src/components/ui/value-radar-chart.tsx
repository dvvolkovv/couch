"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

const VALUE_LABELS: Record<string, string> = {
  career: "Карьера",
  family: "Семья",
  freedom: "Свобода",
  security: "Безопасность",
  development: "Развитие",
  spirituality: "Духовность",
  relationships: "Отношения",
  health: "Здоровье",
  creativity: "Творчество",
  justice: "Справедливость",
};

interface ValueRadarChartProps {
  clientValues?: Record<string, number>;
  specialistValues?: Record<string, number>;
  showLegend?: boolean;
  height?: number;
}

export function ValueRadarChart({
  clientValues,
  specialistValues,
  showLegend = true,
  height = 300,
}: ValueRadarChartProps) {
  const allKeys = new Set([
    ...Object.keys(clientValues || {}),
    ...Object.keys(specialistValues || {}),
  ]);

  const data = Array.from(allKeys).map((key) => ({
    axis: VALUE_LABELS[key] || key,
    client: clientValues?.[key]
      ? Math.round(clientValues[key] * 100)
      : undefined,
    specialist: specialistValues?.[key]
      ? Math.round(specialistValues[key] * 100)
      : undefined,
  }));

  return (
    <div role="img" aria-label="Ценностный профиль">
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          {clientValues && (
            <Radar
              name="Ваш профиль"
              dataKey="client"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          )}
          {specialistValues && (
            <Radar
              name="Профиль специалиста"
              dataKey="specialist"
              stroke="#EC4899"
              fill="#EC4899"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          )}
          {showLegend && <Legend />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
