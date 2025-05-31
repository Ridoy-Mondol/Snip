'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, Container, Avatar } from '@mui/material';
import { FaTasks, FaVoteYea, FaFlag, FaStar } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { getUser } from "@/utilities/fetch";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { StatCard } from "@/components/dashboard/StatCard";
import PieChart from '@/components/chart/PieChart';
import GeneralBarChart from '@/components/chart/BarChart';
import { fetchTableRows } from '@/components/blockchain/fetchTable';

// Colors for Pie Charts
const PIE_COLORS = [
  '#0088FE', // Blue
  '#00C49F', // Green
  '#FFBB28', // Yellow
  '#FF8042', // Orange
  '#8884d8', // Purple
  '#FF6B6B', // Red
  '#B0E57C', // Light Green
  '#6A5ACD', // Slate Blue
  '#FF5C8D', // Pink
  '#00BFA6', // Teal
  '#FF7F50', // Coral
  '#20C997', // Mint Green
];

// Colors for Bar Chart (more distinct set for monthly bars)
const BAR_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#83a6ed', '#8dd1e1', '#82b6c1', '#e580a5', '#c8d8f0', '#f4d0d0', '#b8b8b8'
];

export default function MemberProfile({ params }: { params: { id: string } }) {
  const [modInfo, setModInfo] = useState<{ image: string }>({ image: '', });

  const [performanceData, setPerformanceData] = useState<any[]>([]);

  const moderator = params.id;

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [modPerfRows, moderatorRows] = await Promise.all([
        fetchTableRows({
          table: 'modperf',
          filterFn: (rows) => rows.filter((m) => m.moderator === moderator),
        }),
        fetchTableRows({
          table: 'moderators',
          filterFn: (rows) => rows.filter((m) => m.account === moderator),
        }),
      ]);

      setPerformanceData(modPerfRows);

      const currentMod = moderatorRows?.[0];
      if (currentMod) {
        const modImg = await getCachedUser(currentMod.userName);
        setModInfo({
          image: modImg?.photoUrl ?? null,
        });
      }

    } catch (error) {
      console.error('Failed to fetch moderator or performance:', error);
    }
  };

    fetchData();
  }, []);

  const currentYearPerformance = useMemo(() => {
  const currentYear = new Date().getFullYear();

  const filtered = performanceData.filter(
    (item) => Number(item.year) === currentYear 
  );

  const monthMap = new Map<number, any>();
  filtered.forEach((item) => {
    monthMap.set(item.month, item);
  });

  const filled = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return monthMap.get(month) || {
      moderator,
      year: currentYear,
      month,
      reportCount: 0,
      proposalCount: 0,
      votesCast: 0,
      performanceScore: 0,
    };
  });

    return filled;
  }, [performanceData, moderator]);

  // Helper function to format month numbers to names
  const formatMonth = (monthNumber: number) => {
    const date = new Date(2000, monthNumber - 1, 1);
    return date.toLocaleString('en-US', { month: 'short' });
  };

  // Calculate stats
  const totalReports = performanceData.reduce((acc, row) => acc + row.reportCount, 0);
  const totalProposals = performanceData.reduce((acc, row) => acc + row.proposalCount, 0);
  const totalVotesCast = performanceData.reduce((acc, row) => acc + row.votesCast, 0);
  const averagePerformanceScore = performanceData.length > 0 ? (performanceData.reduce((acc, row) => acc + row.performanceScore, 0) / performanceData.length).toFixed(1) : '0';

  // --- Data for Contribution Breakdown Pie Chart ---
  const contributionData = [
    { name: 'Reports', value: totalReports },
    { name: 'Proposals', value: totalProposals },
    { name: 'Votes Cast', value: totalVotesCast },
  ].filter(item => item.value > 0);

  const getCachedUser = async (username: string) => {
    const key = `user_${username}`;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const userData = await getUser(username);
    sessionStorage.setItem(key, JSON.stringify(userData.user));
    return userData.user;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Profile Overview: {moderator}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Explore key performance indicators, monthly score trends, and contribution breakdowns for <strong>{moderator}</strong>.
      </Typography>

      {/* Member Profile Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 4,
          mb: 5,
          borderRadius: 4,
          bgcolor: 'background.paper',
          boxShadow: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}      >
          <Avatar
            alt={moderator}
            src={getFullURL(modInfo.image)}
            sx={{
              width: 100,
              height: 100,
              mr: 3,
              border: '3px solid #1976d2',
              boxShadow: 2,
            }}
          />
          <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              {moderator}
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={0.5}>
              Current Moderator Status: <strong style={{ color: '#4caf50' }}>Active</strong>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* --- Stat Cards --- */}
      <Grid container spacing={6} mt={0}>
        <Grid item xs={12} md={6}>
          <StatCard icon={<FaTasks />} label="Total Proposals Submitted" value={totalProposals} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard icon={<FaVoteYea />} label="Total Votes Cast" value={`${totalVotesCast}`} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard icon={<FaFlag />} label="Total Content Reported" value={totalReports} />
        </Grid>
        <Grid item xs={12} md={6} sx={{ p: 0 }}>
          <StatCard icon={<FaStar />} label="Avg. Impact Score" value={`${averagePerformanceScore}`} />
        </Grid>
      </Grid>

      {/* --- Monthly Performance Score Trend (Line Chart) --- */}
      <Grid item xs={12} mt={6}>
        <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Performance Score Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentYearPerformance.sort((a, b) => a.month - b.month)} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tickFormatter={formatMonth} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="performanceScore" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* --- Contribution Breakdown (New Pie Chart) --- */}
      <Grid item xs={12} md={6} mt={6}>
        <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Overall Contribution Breakdown
            </Typography>

            <PieChart
              data={contributionData}
              nameKey="name"
              valueKey="value"
              PIE_COLORS={PIE_COLORS}
              centerLabel="Contributions"
            />

          </CardContent>
        </Card>
      </Grid>

      {/* --- Monthly Revenue Share (Bar Chart with different colors) --- */}
      <Grid item xs={12} md={6} mt={6}>
        <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Report Count
            </Typography>
            
            <GeneralBarChart
              data={currentYearPerformance}
              dataKey="reportCount"
              xAxisKey="month"
              name="Report Count"
              barColors={BAR_COLORS}
              formatXAxis={formatMonth}
              formatYAxis={(value) => `${value}`}
              tooltipFormatter={(value) => [`${value}`, "Total Reports"]}
              sortBy="month"
            />

          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}














