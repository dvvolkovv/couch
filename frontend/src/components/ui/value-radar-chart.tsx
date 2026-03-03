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
  career: "\u041A\u0430\u0440\u044C\u0435\u0440\u0430",
  family: "\u0421\u0435\u043C\u044C\u044F",
  freedom: "\u0421\u0432\u043E\u0431\u043E\u0434\u0430",
  security: "\u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C",
  development: "\u0420\u0430\u0437\u0432\u0438\u0442\u0438\u0435",
  spirituality: "\u0414\u0443\u0445\u043E\u0432\u043D\u043E\u0441\u0442\u044C",
  relationships: "\u041E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u044F",
  health: "\u0417\u0434\u043E\u0440\u043E\u0432\u044C\u0435",
  creativity: "\u0422\u0432\u043E\u0440\u0447\u0435\u0441\u0442\u0432\u043E",
  justice: "\u0421\u043F\u0440\u0430\u0432\u0435\u0434\u043B\u0438\u0432\u043E\u0441\u0442\u044C",
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
    <div role="img" aria-label="\u0426\u0435\u043D\u043D\u043E\u0441\u0442\u043D\u044B\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044C">
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          {clientValues && (
            <Radar
              name="\u0412\u0430\u0448 \u043F\u0440\u043E\u0444\u0438\u043B\u044C"
              dataKey="client"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          )}
          {specialistValues && (
            <Radar
              name="\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u0430"
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
