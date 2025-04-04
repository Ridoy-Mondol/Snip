"use client";
import { Card, CardContent, Typography, LinearProgress, useTheme } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar
} from "recharts";

const voterData = [
  { name: "Voted", value: 3200 },
  { name: "Did Not Vote", value: 800 },
];

const stakingData = [
  { name: "Staked Tokens", value: 10_000_000 },
  { name: "Required Staking", value: 5_000_000 },
];

// Calculate Percentage
const totalVotes = voterData.reduce((acc, item) => acc + item.value, 0);
const votedPercentage = Math.round((voterData[0].value / totalVotes) * 100);
const notVotedPercentage = 100 - votedPercentage;

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
      const isDarkMode = theme.palette.mode === "dark";

      return (
          <div
              style={{
                  background: isDarkMode ? "#1E1E1E" : "#fff",
                  color: isDarkMode ? "#fff" : "#000",
                  padding: "10px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  border: isDarkMode ? "1px solid #444" : "1px solid #ddd",
              }}
          >
              <Typography variant="body2" fontWeight="bold">
                  {label}: {payload[0].value.toLocaleString()}
              </Typography>
          </div>
      );
  }
  return null;
};

export default function VotingData() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold">
          📊 Voting & Staking Data
        </Typography>

        {/* Voting Distribution using Linear Progress Bar */}
        <Typography variant="subtitle1" fontWeight="bold" mt={2}>
          🗳️ Voting Participation
        </Typography>
        <Typography variant="body2">Voted: {votedPercentage}%</Typography>
        <LinearProgress 
          variant="determinate" 
          value={votedPercentage} 
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: isDarkMode ? "#2E3B4E" : "#e0e0e0",
            "& .MuiLinearProgress-bar": { backgroundColor: "#4CAF50" } // Green bar
          }} 
        />
        <Typography variant="body2" mt={1}>Did Not Vote: {notVotedPercentage}%</Typography>
        <LinearProgress 
          variant="determinate" 
          value={notVotedPercentage} 
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: isDarkMode ? "#2E3B4E" : "#e0e0e0",
            "& .MuiLinearProgress-bar": { backgroundColor: "#F44336" } // Red bar
          }} 
        />

        {/* Bar Chart for Staking Data */}
        <Typography variant="subtitle1" fontWeight="bold" mt={4}>
          Staking Overview
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={stakingData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barSize={50}
          >
            <CartesianGrid horizontal={false} stroke={ isDarkMode ? "#272B30" : "#EFEFEF"} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fontWeight: "500", fill: "#6F767E" }}
              tickLine={false}
              stroke={isDarkMode ? "#272B30" : "#EFEFEF"}
            />
            <Tooltip 
              content={<CustomTooltip theme={theme} />}
              cursor={{ fill: isDarkMode ? "#222628" : "#F6F6F6" }}
            />
            <Bar dataKey="value" radius={2} fill="#B5E4CA">
              {stakingData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? "#0C68E9" : "#B5E4CA"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
