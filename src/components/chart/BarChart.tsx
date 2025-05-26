// components/GeneralBarChart.tsx

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type GeneralBarChartProps = {
  data: any[];
  dataKey: string; // e.g., "revenueShare"
  xAxisKey: string; // e.g., "month"
  name?: string; // bar name in tooltip
  barColors?: string[];
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: number) => string;
  tooltipFormatter?: (value: number) => [string, string];
  height?: number;
  sortBy?: string; // optional field to sort by
};

export default function GeneralBarChart({
  data,
  dataKey,
  xAxisKey,
  name = "",
  barColors = [],
  formatXAxis,
  formatYAxis,
  tooltipFormatter,
  height = 300,
  sortBy,
}: GeneralBarChartProps) {
  const sortedData = sortBy
    ? [...data].sort((a, b) => a[sortBy] - b[sortBy])
    : data;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} />
        <YAxis tickFormatter={formatYAxis} />
        <Tooltip formatter={tooltipFormatter} />
        <Bar dataKey={dataKey} name={name}>
          {sortedData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={barColors[index % barColors.length] || "#1976d2"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
