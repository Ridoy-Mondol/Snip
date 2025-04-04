"use client";
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box, Container } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Fund allocation data
const fundDistribution = [
  { name: "Rewards Pool", value: 40, color: "#4CAF50" },
  { name: "Development", value: 30, color: "#2196F3" },
  { name: "Marketing", value: 20, color: "#FF9800" },
  { name: "Operations", value: 10, color: "#E91E63" },
];

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63"];

// Recent transactions
const transactions = [
  { date: "March 15, 2025", type: "Reward Distribution", amount: "5,000,000" },
  { date: "March 10, 2025", type: "Marketing Fund", amount: "2,000,000" },
];

export default function CommunityWallet() {
  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold">💰 Community Wallet Overview</Typography>

        {/* Total Treasury/Wallet Value */}
        <Typography variant="subtitle1" color="textSecondary">
          Total Treasury: <b>20,000,000 Tokens</b>
        </Typography>

        {/* Pie Chart Section */}
        <Container sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <Box sx={{ width: 250, height: 250, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fundDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  labelLine={false}
                  dataKey="value"
                  paddingAngle={2}
                  stroke="transparent"
                >
                  {fundDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Text */}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              Distribution
            </Box>
          </Box>
        </Container>

        {/* Fund Distribution Legend */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap", mb: 3 }}>
          {fundDistribution.map((item, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", fontSize: "0.9rem" }}>
              <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: "50%", mr: 1 }} />
              {item.name}
            </Box>
          ))}
        </Box>

        {/* Transaction History */}
        <Typography variant="subtitle1" mt={4}>📜 Recent Transactions</Typography>
        <List>
          {transactions.map((tx, index) => (
            <ListItem key={index}>
              <ListItemText primary={`${tx.type}: ${tx.amount} Tokens`} secondary={tx.date} />
            </ListItem>
          ))}
        </List>

      </CardContent>
    </Card>
  );
}
