'use client';

import React, { useEffect, useState } from 'react';
import { JsonRpc } from 'eosjs';
import { Box, Card, CardContent, Typography, Grid, Container } from '@mui/material';
import { FaDollarSign, FaClock, FaChartBar, FaHandHoldingUsd } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { StatCard } from "@/components/dashboard/StatCard";
import GeneralPieChart from '@/components/chart/PieChart';

type RevenueRecord = {
  id: number;
  submittedBy: string;
  totalRevenue: number;
  percentToDistribute: number;
  amountPerRecipient: number;
  timestamp: number; 
  status: 'pending' | 'distributed' | 'failed';
};

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28',
  '#FF8042', '#A28EFF', '#FF5C8D', 
  '#00BFA6', '#FF7F50', '#6A5ACD',
  '#20C997', '#FF6B6B', '#B0E57C'
];

export default function RevenueDashboard() {
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);

   const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
   const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;  

   const fetchRevenue = async () => {
     try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
      json: true,
      code: contractAcc,
      scope: contractAcc,
      table: 'revenues',
      });

      setRevenue(result.rows);
           
     } catch (error) {
      console.error('Failed to fetch revenues:', error);
     }
   };
   
   useEffect(() => {
     fetchRevenue();
   }, [])

   const totalRevenue = revenue.reduce((acc, row) => acc + Number(row.totalRevenue), 0) / 10000;

   const totalRevenueShared = revenue.reduce((acc, row) => {
    const total = Number(row.totalRevenue) / 10000;
    const shared = total * (Number(row.percentToDistribute) / 100);
    return acc + shared;
   }, 0);

   const lastRevenue = revenue.length > 0 ? Number(revenue[revenue.length - 1].totalRevenue) / 10000 : 0;

   const lastRevenueShared = revenue.length > 0 ? (Number(revenue[revenue.length - 1].totalRevenue) / 10000) * (Number(revenue[revenue.length - 1].percentToDistribute) / 100) : 0;

   const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

   const currentYear = new Date().getUTCFullYear();

   const currentYearRevenue = revenue.filter((r) => {
     const recordYear = new Date(r.timestamp * 1000).getUTCFullYear();
     return recordYear === currentYear;
  })
  .map((r) => {
     const date = new Date(r.timestamp * 1000);
     const monthIndex = date.getUTCMonth();
     const total = Number(r.totalRevenue) / 10000;
     const distributed = total * (Number(r.percentToDistribute) / 100);
     return {
      totalRevenue: total,
      revenueDistributed: distributed,
      monthLabel: MONTHS[monthIndex],
     };
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Revenue & Compensation Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Get real-time insights into advertising revenue, earnings distribution, and payout activity.
      </Typography>
           
      <Grid container spacing={6} mt={0}>
        <Grid item xs={12} md={6}>
          <StatCard icon={<FaChartBar />} label="Total Revenue Generated" value={`${totalRevenue} SNIPX`} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard icon={<FaClock />} label="Revenue This Month" value={`${lastRevenue} SNIPX`} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard icon={<FaHandHoldingUsd />} label="Total Revenue Shared" value={`${totalRevenueShared} SNIPX`} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard icon={<FaDollarSign />} label="Shared This Month" value={`${lastRevenueShared} SNIPX`} />
        </Grid>

        <Grid item xs={12} md={12}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentYearRevenue} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="monthLabel" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="totalRevenue" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Distribution Per Month
              </Typography>
              
              <GeneralPieChart              
                data={currentYearRevenue}
                nameKey="monthLabel"
                valueKey="revenueDistributed"
                PIE_COLORS={COLORS}
                centerLabel="Distribution"
              />

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
