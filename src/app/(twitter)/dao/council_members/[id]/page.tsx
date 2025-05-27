'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { JsonRpc } from 'eosjs';
import { Box, Card, CardContent, Typography, Grid, Container, Avatar } from '@mui/material';
import { FaTasks, FaVoteYea, FaDollarSign, FaStar } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { getUser } from "@/utilities/fetch";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { StatCard } from "@/components/dashboard/StatCard";
import PieChart from '@/components/chart/PieChart';
import BarChart from '@/components/chart/BarChart';

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
  const [memberInfo, setMemberInfo] = useState<{ status: string; image: string }>({
    status: '',
    image: '',
  });

  const [performanceData, setPerformanceData] = useState<any[]>([]);

  const member = params.id;

  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;

  const fetchMemPerformance = async () => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
       json: true,
       code: contractAcc,
       scope: contractAcc,
       table: 'memberperf',
      });

      const memberRecords = result.rows.filter((m) => m.member === member)
  
      setPerformanceData(memberRecords);
             
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  };

  const fetchMembers = async () => {
    try {
    const rpc = new JsonRpc(endpoint);
    const result = await rpc.get_table_rows({
      json: true,
      code: contractAcc,
      scope: contractAcc,
      table: 'council',
      limit: 100,
    });
    const currentMember = result.rows.filter((m) => (m.account === member));
  
    const memberImg = await getCachedUser(currentMember[0].userName)

    setMemberInfo({
      status: currentMember[0].status,
      image: memberImg.photoUrl,
    });    
  
    } catch (error) {
    console.error('Failed to fetch members:', error);
    }
  };
     
  useEffect(() => {
    fetchMemPerformance();
    fetchMembers();
  }, [])

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
      member,
      year: currentYear,
      month,
      proposalCount: 0,
      tokenAllocProposalCount: 0,
      votesCast: 0,
      revenueShare: 0,
      performanceScore: 0,
    };
  });

    return filled;
  }, [performanceData, member]);

  // Helper function to format month numbers to names
  const formatMonth = (monthNumber: number) => {
    const date = new Date(2000, monthNumber - 1, 1);
    return date.toLocaleString('en-US', { month: 'short' });
  };

  // Calculate stats
  const totalProposals = performanceData.reduce((acc, row) => acc + row.proposalCount, 0);
  const totalTokenAllocProposals = performanceData.reduce((acc, row) => acc + row.tokenAllocProposalCount, 0);
  const totalVotesCast = performanceData.reduce((acc, row) => acc + row.votesCast, 0);
  const totalRevenueShare = performanceData.reduce((acc, row) => acc + row.revenueShare, 0);
  const averagePerformanceScore = performanceData.length > 0 ? (performanceData.reduce((acc, row) => acc + row.performanceScore, 0) / performanceData.length).toFixed(1) : '0';

  // --- Data for Contribution Breakdown Pie Chart ---
  const contributionData = [
    { name: 'Proposals', value: totalProposals - totalTokenAllocProposals },
    { name: 'Token Alloc Proposal', value: totalTokenAllocProposals },
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
        Profile Overview: {member}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Explore key performance indicators, monthly score trends, contribution breakdowns, and revenue share insights for <strong>{member}</strong>.
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
            alt={member}
            src={getFullURL(memberInfo.image)}
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
              {member}
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={0.5}>
              Current Member Status: <strong style={{ color: '#4caf50' }}>Active</strong>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* --- Stat Cards --- */}
      <Grid container spacing={6} mt={0}>
        <Grid item xs={12} md={6}>
          <StatCard icon={<FaTasks />} label="Total Proposals Submitted" value={`${totalProposals + totalTokenAllocProposals}`} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard icon={<FaVoteYea />} label="Total Votes Cast" value={`${totalVotesCast}`} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard icon={<FaDollarSign />} label="Total Revenue Share" value={`${(totalRevenueShare / 10000).toFixed(4)} SNIPS`} />
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
              Monthly Revenue Share
            </Typography>

            <BarChart
              data={currentYearPerformance}
              dataKey="revenueShare"
              xAxisKey="month"
              name="Revenue Share"
              barColors={BAR_COLORS}
              formatXAxis={formatMonth}
              formatYAxis={(value) => `${(value / 10000).toFixed(0)}`}
              tooltipFormatter={(value) => [`${(value / 10000).toFixed(4)} SNIPS`, "Revenue Share"]}
              sortBy="month"
            />

          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}














