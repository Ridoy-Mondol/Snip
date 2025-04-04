"use client";

import { ReactNode } from "react";
import { AppBar, Toolbar, Tabs, Tab, Box, Button, Typography } from "@mui/material";
import { FaVoteYea } from "react-icons/fa";
import { AiOutlineUserAdd } from "react-icons/ai";
import Link from "next/link";
// import { useRouter } from "next/router";

const NAV_LINKS = [
  { label: "🏛️ Elections", path: "/dao/elections" },
  { label: "📝 Registration", path: "/dao/candidate-registration" },
  { label: "🗳️ Voting", path: "/dao/voting" },
  { label: "👥 Council Members", path: "/dao/council-members" },
  { label: "⚠️ Recall Voting", path: "/dao/recall-vote" },
  { label: "💰 Community Wallet", path: "/dao/community-wallet" },
];

export default function DaoDashboardLayout({ children }: { children: ReactNode }) {
//   const router = useRouter();

  return (
    <Box>
      {/* Navbar */}
      {/* <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🏛️ Snipverse DAO Dashboard
          </Typography>
        </Toolbar>
      </AppBar> */}

      {/* DAO Header Section */}
      <Box textAlign="center" my={4}>
        <Typography variant="h4" fontWeight="bold">
          🏛️ Snipverse DAO Dashboard
        </Typography>
        <Typography variant="subtitle1" color="gray">
          Empowering the Snipverse community through decentralized governance.
        </Typography>
        {/* Internal DAO Navigation */}
      <Tabs
        // value={NAV_LINKS.findIndex((link) => router.pathname.startsWith(link.path))}
        variant="scrollable"
        scrollButtons="auto"
        centered
      >
        {NAV_LINKS.map((link, index) => (
          <Tab key={index} label={link.label} component={Link} href={link.path} />
        ))}
      </Tabs>
        {/* <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AiOutlineUserAdd />}
            sx={{ mx: 1 }}
            component={Link}
            href="/dao/candidate-registration"
          >
            Apply as Candidate
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FaVoteYea />}
            sx={{ mx: 1 }}
            component={Link}
            href="/dao/elections"
          >
            View Elections
          </Button>
        </Box> */}
      </Box>

      {/* Page Content */}
      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
}
