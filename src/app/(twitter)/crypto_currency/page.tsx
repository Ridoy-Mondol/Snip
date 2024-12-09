"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import {
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

import { CoinGeckoClient } from "@/utilities/coingeckoclient";

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  currentPrice: string;
  priceChange1h: string;
  priceChange24h: string;
  priceChange7d: string;
  priceChange30d: string;
  volume24h: string;
  circulatingSupply: string;
  totalSupply: string;
  marketCap: string;
  logoUrl: string;
  priceHistory: number[];
}

const CryptoCurrency = () => {
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filteredAssets, setFilteredAssets] = useState<CryptoAsset[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const marketData = await CoinGeckoClient.coinsMarkets({
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 100,
          page: 1,
          sparkline: true,
          price_change_percentage: "1h,24h,7d,30d",
        });

        const updatedAssets: CryptoAsset[] = marketData.map((priceData: any) => ({
          id: priceData.id,
          name: priceData.name,
          symbol: priceData.symbol.toUpperCase(),
          rank: priceData.market_cap_rank,
          currentPrice: priceData.current_price.toLocaleString(),
          priceChange1h: priceData.price_change_percentage_1h_in_currency?.toFixed(2) || "0",
          priceChange24h: priceData.price_change_percentage_24h_in_currency?.toFixed(2) || "0",
          priceChange7d: priceData.price_change_percentage_7d_in_currency?.toFixed(2) || "0",
          priceChange30d: priceData.price_change_percentage_30d_in_currency?.toFixed(2) || "0",
          volume24h: priceData.total_volume?.toLocaleString() || "0",
          circulatingSupply: priceData.circulating_supply?.toLocaleString() || "0",
          totalSupply: priceData.total_supply?.toLocaleString() || "0",
          marketCap: priceData.market_cap?.toLocaleString() || "0",
          logoUrl: priceData.image || "",
          priceHistory: priceData.sparkline_in_7d.price,
        }));
        setCryptoAssets(updatedAssets);
        setFilteredAssets(updatedAssets);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      }
    };

    fetchCryptoData();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredAssets(cryptoAssets);
    } else {
      const filtered = cryptoAssets.filter((asset) =>
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredAssets(filtered);
    }
  }, [search, cryptoAssets]);

  const TrendGraph = ({ data }: { data: number[] }) => {
    const isUpwardTrend = data[data.length - 1] > data[data.length - 2];
    const chartData = {
      labels: data.map((_, i) => i),
      datasets: [
        {
          data: data,
          borderColor: isUpwardTrend ? "#28a745" : "#dc3545",
          backgroundColor: "transparent",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3, 
        },
      ],
    };

    const chartOptions = {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: { display: false }, 
        y: { display: false },
      },
      responsive: true,
      maintainAspectRatio: false,
    };

    return (
      <div style={{ width: "100px", height: "40px" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };

  const getTextColor = (percentage: string) => {
    const value = parseFloat(percentage);
    if (value < 0) {
      return "red";
    } else if (value > 0) {
      return "green";
    }
    return "gray"; 
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Cryptocurrency Market Overview
      </Typography>
      <Typography variant="body1" gutterBottom>
         Explore the latest data and trends in the cryptocurrency market. Click
         on a coin to learn more about its performance and analytics.
       </Typography>
      <TextField
        label="Search for a coin"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mt: 2, mb: 4 }}
      />
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Coin</TableCell>
              <TableCell>Price (USD)</TableCell>
              <TableCell>1h %</TableCell>
              <TableCell>24h %</TableCell>
              <TableCell>7d %</TableCell>
              <TableCell>30d %</TableCell>
              <TableCell>24h Volume</TableCell>
              <TableCell>Circulating Supply</TableCell>
              <TableCell>Total Supply</TableCell>
              <TableCell>Market Cap</TableCell>
              <TableCell>Last 7d</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssets.map((asset) => (
              <TableRow
                key={asset.id}
                onClick={() => router.push(`/crypto_currency/${asset.id}`)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>{asset.rank}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <img
                      src={asset.logoUrl}
                      alt={asset.name}
                      width={24}
                      height={24}
                      style={{ borderRadius: "50%" }}
                    />
                    {asset.name} ({asset.symbol})
                  </Box>
                </TableCell>
                <TableCell>${asset.currentPrice}</TableCell>
                <TableCell style={{ color: getTextColor(asset.priceChange1h) }}>
                  {asset.priceChange1h}%
                </TableCell>
                <TableCell style={{ color: getTextColor(asset.priceChange24h) }}>
                  {asset.priceChange24h}%
                </TableCell>
                <TableCell style={{ color: getTextColor(asset.priceChange7d) }}>
                  {asset.priceChange7d}%
                </TableCell>
                <TableCell style={{ color: getTextColor(asset.priceChange30d) }}>{asset.priceChange30d}%</TableCell>
                <TableCell>${asset.volume24h}</TableCell>
                <TableCell>{asset.circulatingSupply}</TableCell>
                <TableCell>{asset.totalSupply}</TableCell>
                <TableCell>${asset.marketCap}</TableCell>
                <TableCell>
                  <TrendGraph data={asset.priceHistory} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CryptoCurrency;
