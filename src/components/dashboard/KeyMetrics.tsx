"use client";
import { Grid, Typography, Box } from "@mui/material";
import {
  FaUsers,
  FaUserShield,
  FaBalanceScale,
  FaWallet,
  FaChartLine,
} from "react-icons/fa";
import { AiOutlineClockCircle } from "react-icons/ai";
import { HiOutlineChartBar } from "react-icons/hi";
import { StatCard } from "@/components/dashboard/StatCard";

interface KeyMetricsProps {
  members: any[];
  moderators: any[];
  election: any[];
  proposals: any[];
  totalBalance?: number;
  revenue: any[];
}

export default function KeyMetrics({
  members,
  moderators,
  election,
  proposals,
  totalBalance,
  revenue,
}: KeyMetricsProps) {
  const metrics = [
    {
      label: "Council Members",
      value: members.length.toString(),
      icon: <FaUsers />,
    },
    {
      label: "Total Moderators",
      value: moderators.length.toString(),
      icon: <FaUserShield />,
    },
    {
      label: "Total Council Elections",
      value: Array.isArray(election) ? election.length.toString() : election ? "1" : "0",
      icon: <AiOutlineClockCircle />,
    },
    {
      label: "Total Proposals Submitted",
      value: proposals.length.toString(),
      icon: <FaBalanceScale />,
    },
    {
      label: "Community Wallet Balance",
      value: totalBalance ? `${totalBalance.toFixed(4)} SNIPS` : "0 SNIPS",
      icon: <FaWallet />,
    },
    {
      label: "Total Ad Revenue",
      value:
        revenue.length > 0
          ? `${revenue.reduce((sum, r) => sum + (r.totalRevenue / 10000 || 0), 0).toFixed(4)} SNIPS`
          : "0 SNIPS",
      icon: <FaChartLine />,
    },
  ];

  return (
    <Box mt={6}>
      <Typography variant="h4" align="left" fontWeight={600} gutterBottom>
        <Box component="span" sx={{ verticalAlign: "middle", mr: 1 }}>
          <HiOutlineChartBar />
        </Box>
        Snipverse DAO Key Metrics
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={4}>
        Explore the real-time metrics that highlight the operational status of Snipverse DAO —
        from active council members and moderator strength to submitted proposals, election history,
        and overall financial performance.
      </Typography>

      <Grid container spacing={6}>
        {metrics.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <StatCard icon={item.icon} label={item.label} value={item.value} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
