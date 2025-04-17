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
  { label: "👥 Council Members", path: "/dao/council_members" },
  { label: "⚠️ Recall Voting", path: "/dao/recall-vote" },
  { label: "💰 Community Wallet", path: "/dao/community-wallet" },
];

export default function DaoDashboardLayout({ children }: { children: ReactNode }) {
//   const router = useRouter();

  return (
    <Box>
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
      </Box>

      {/* Page Content */}
      <Box sx={{ p: 0 }}>{children}</Box>
    </Box>
  );
}
