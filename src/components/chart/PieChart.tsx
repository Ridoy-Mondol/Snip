// components/GeneralPieChart.tsx

import { Box, Container } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import React from "react";

interface Props {
  data: any[];
  nameKey: string;
  valueKey: string; 
  PIE_COLORS: string[]; 
  centerLabel: string;
}

const GeneralPieChart: React.FC<Props> = ({
  data,
  nameKey,
  valueKey,
  PIE_COLORS,
  centerLabel,
}) => {
  const hasValidData = data.length > 0 && data.some(item => item[valueKey] > 0);

  return (
    <>
      <Container sx={{ display: "flex", justifyContent: "center", my: 3 }}>
        <Box sx={{ width: 350, height: 350, position: "relative" }}>
          {hasValidData && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  labelLine={false}
                  paddingAngle={2}
                  stroke="transparent"
                  dataKey={valueKey}
                  label={(entry: any) => {
                    const percent = entry.percent ?? 0;
                    return `${(percent * 100).toFixed(0)}%`;
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value}`,
                    props.payload[nameKey],
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "1rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {data.length > 0 ? centerLabel : "No data available."}
          </Box>
        </Box>
      </Container>

      {/* Legend */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center", fontSize: "0.9rem" }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: PIE_COLORS[index % PIE_COLORS.length],
                borderRadius: "50%",
                mr: 1,
              }}
            />
            {item[nameKey]}
          </Box>
        ))}
      </Box>
    </>
  );
};

export default GeneralPieChart;
