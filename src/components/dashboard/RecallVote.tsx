"use client"
import { Card, CardContent, Typography, Button, LinearProgress, Box } from "@mui/material";

const recallVotes = [
  { name: "Bob Smith", role: "Elected Member", progress: 55 },
  { name: "Charlie Lee", role: "Elected Member", progress: 30 },
];

export default function RecallVote() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">⚠️ Recall Vote Progress</Typography>
        {recallVotes.map((vote, index) => (
          <Box key={index} mt={2}>
            <Typography variant="body1">{vote.name} ({vote.role})</Typography>
            <LinearProgress variant="determinate" value={vote.progress} sx={{ height: 10, borderRadius: 5 }} />
            <Button variant="contained" color="error" size="small" sx={{ mt: 1 }}>Vote to Remove</Button>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
