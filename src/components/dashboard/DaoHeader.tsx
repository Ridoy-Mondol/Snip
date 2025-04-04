"use client"
import { Box, Button, Typography } from "@mui/material";
import { FaVoteYea } from "react-icons/fa";
import { AiOutlineUserAdd } from "react-icons/ai";

export default function DaoHeader() {
  return (
    <Box textAlign="center" my={4}>
      <Typography variant="h4" fontWeight="bold">🏛️ Snipverse DAO Dashboard</Typography>
      <Typography variant="subtitle1" color="gray">Empowering the Snipverse community through decentralized governance.</Typography>
      <Box mt={2}>
        <Button variant="contained" color="primary" startIcon={<AiOutlineUserAdd />} sx={{ mx: 1 }}>
          Apply as Candidate
        </Button>
        <Button variant="contained" color="secondary" startIcon={<FaVoteYea />} sx={{ mx: 1 }}>
          View Elections
        </Button>
      </Box>
    </Box>
  );
}
