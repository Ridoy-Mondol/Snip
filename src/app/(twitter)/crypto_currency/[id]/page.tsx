"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
} from "@mui/material";

import HistoricalChart from "@/components/chart/HistoricalChart";

const CoinDetails = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [coinDetails, setCoinDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCoinDetails = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}`
      );
      const data = await response.json();
      setCoinDetails(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coin details:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoinDetails();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!coinDetails) {
    return (
      <Typography variant="h6" color="error" sx={{ mt: 4, textAlign: "center" }}>
        Unable to fetch coin details. Please try again later.
      </Typography>
    );
  }

  const {
    image,
    name,
    symbol,
    description,
    market_data: {
      current_price,
      market_cap,
      price_change_percentage_24h,
      total_volume,
    },
  } = coinDetails;

  return (
    <Box sx={{ p: 4 }}>
      {/* Coin Overview */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <img src={image.large} alt={name} width={64} height={64} />
          </Grid>
          <Grid item>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {name} ({symbol.toUpperCase()})
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {description.en.split(".")[0] || "Description not available."}
        </Typography>
      </Paper>

      {/* Market Data */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Market Data
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Current Price:</strong> ${current_price.usd.toLocaleString()}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: price_change_percentage_24h > 0 ? "green" : "red",
              }}
            >
              <strong>24h Change:</strong>{" "}
              {price_change_percentage_24h.toFixed(2)}%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Market Cap:</strong> ${market_cap.usd.toLocaleString()}
            </Typography>
            <Typography variant="body1">
              <strong>Total Volume (24h):</strong>{" "}
              ${total_volume.usd.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
     
      {/* price chart */}
      <HistoricalChart coinId={id} />

    </Box>
  );
};

export default CoinDetails;
