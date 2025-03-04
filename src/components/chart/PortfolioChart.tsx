import React, { useEffect, useRef } from "react";
import {
  Box,
  Paper,
} from "@mui/material";
import { createChart, Time } from "lightweight-charts";

import CircularLoading from "@/components/misc/CircularLoading";
type ChartDataPoint = {
    time: Time, 
    value: number; 
  };
type PortfolioChartProps = {
    data: ChartDataPoint[];
    range: string;
    loading: boolean;
  };

const PortfolioChart: React.FC<PortfolioChartProps> = ({data, range, loading }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (chartContainer && data.length > 0) {
        const sortedData = [...data].sort(
            (a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime()
        );          
      chartContainer.innerHTML = "";
      const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 300,
        layout: {
          background: { color: "transparent" },
          textColor: "white",
        },
        grid: {
          vertLines: { color: "white", style: 0, visible: false },
          horzLines: { color: "white", style: 0, visible: false },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: range === "1H",
        },
        crosshair: {
          vertLine: { color: "white", width: 2 },
          horzLine: { color: "white", width: 2 },
        },
      });

      const lineSeries = chart.addLineSeries({
        color: "blue",
        lineWidth: 3,
      });

      const areaSeries = chart.addAreaSeries({
        topColor: "rgba(70, 130, 180, 0.3)",
        bottomColor: "rgba(25, 25, 112, 0.6)",
        lineColor: "blue",
        lineWidth: 3,
      });

      lineSeries.setData(sortedData);
      areaSeries.setData(sortedData);
    }
  }, [data]);

  return (
    <Paper elevation={3} sx={{ p:1, mt: 4 }}>
      {
        loading ? <CircularLoading /> :
        <Box
          ref={chartContainerRef}
          sx={{
            width: "100%",
            height: "300px",
            mt: 2,
            backgroundColor: "transparent",
          }}
          className="chart-container"
        />
      }
    </Paper>
  );
};

export default PortfolioChart;
