import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  ButtonGroup,
  Button,
  CircularProgress,
} from "@mui/material";
import { createChart, LineData } from "lightweight-charts";

type ChartPoint = { time: number; value: number };
const TimeRanges = [
  { label: "1H", value: "1H" },
  { label: "24H", value: "1" },
  { label: "7D", value: "7" },
  { label: "30D", value: "30" },
  { label: "1Y", value: "365" },
  // { label: "All", value: "max" },
];

const HistoricalChart = ({ coinId }: { coinId: string }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartData, setChartData] = useState<LineData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState("30");
  const [cache, setCache] = useState<Record<string, LineData[]>>({});

  const fetchHistoricalData = async (range: string) => {
    setSelectedRange(range);
    if (cache[range]) {
      setChartData(cache[range]);
      return;
    }
    setLoading(true);
    setChartData([]);
    try {
      const days = range === "1H" ? "1" : range;
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      const data = await response.json();

      let prices = data.prices.map(([timestamp, price]: [number, number]) => ({
        time: Math.floor(timestamp / 1000),
        value: price,
      }));

      if (range === "1H") {
        // Filter data for the last 1 hour
        const oneHourAgo = Math.floor(Date.now() / 1000) - 3600; // 1 hour in seconds
        prices = prices.filter((point: ChartPoint) => point.time >= oneHourAgo);
      }
      
      setCache((prev) => ({ ...prev, [range]: prices }));
      setChartData(prices);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData(selectedRange);
  }, []);

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (chartContainer && chartData.length > 0) {
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
          secondsVisible: selectedRange === "1H",
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

      lineSeries.setData(chartData);
      areaSeries.setData(chartData);
    }
  }, [chartData]);

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Price Charts
      </Typography>

      <ButtonGroup variant="contained" color="primary" sx={{ mb: 3 }}>
        {TimeRanges.map((range) => (
          <Button
            key={range.value}
            onClick={() => fetchHistoricalData(range.value)}
            sx={{
              backgroundColor: selectedRange === range.value ? "blue" : "inherit",
              color: selectedRange === range.value ? "white" : "inherit",
            }}
          >
            {range.label}
          </Button>
        ))}
      </ButtonGroup>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
      )}
    </Paper>
  );
};

export default HistoricalChart;
