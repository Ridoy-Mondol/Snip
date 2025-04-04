"use client";
import { Card, CardContent, CardHeader, Typography, Button, Grid, Box } from "@mui/material";
import { useState } from "react";

export default function ActiveElections() {
  const [elections] = useState([
    { name: "Council Election 2025", timeLeft: "3 Days", candidates: 5 },
    { name: "Moderator Election", timeLeft: "5 Days", candidates: 3 },
  ]);

  return (
    <Card sx={{ mx: "auto", boxShadow: 3, borderRadius: 2 }}>
      <CardHeader 
        title="🗳️ Active Elections"
        titleTypographyProps={{ variant: "h6", fontWeight: "bold", textAlign: "start" }}
      />
      <CardContent>
        <Grid container spacing={2} direction="column">
          {elections.map((election, index) => (
            <Grid item key={index}>
              <Box 
                sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  p: 2, 
                  borderRadius: 1,  
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {election.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {election.timeLeft} Left
                  </Typography>
                </Box>
                <Button variant="contained" size="small" sx={{ textTransform: "none" }}>
                  View
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
