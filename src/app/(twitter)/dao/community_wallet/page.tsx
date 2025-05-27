"use client"
import React, { useEffect, useState } from 'react';
import { JsonRpc } from 'eosjs';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent
} from '@mui/material';
import {
  FaWallet,
  FaHistory,
  FaChartPie,
  FaChartBar,
  FaMoneyBillWave,
} from 'react-icons/fa';
import GeneralPieChart from '@/components/chart/PieChart';
import BarChart from '@/components/chart/BarChart';

const COLORS = ['#ff9800', '#2196f3', '#4caf50', '#f44336'];

interface Proposal {
  id: number;
  proposer: string;
  recipient: string;
  amount: string;
  category: string;
  approvedBy: number;
  rejectedBy: number;
  status: 'open' | 'approved' | 'rejected' | 'executed' | 'paused';
  createdAt: number;
  approvedAt: number;
}

const CommunityWalletDashboard = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>();
  const [wallet, setWallet] = useState("");

  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;
  const tokenAcc = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ACC!;

  const fetchProposals = async () => {
    try {
    const rpc = new JsonRpc(endpoint);
    const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'fundprops',
        limit: 100,
    });
        setProposals(result.rows);
    } catch (error) {
    console.error('Failed to fetch proposal:', error);
    }
  };
  
  useEffect(() => {
      fetchProposals();
  }, []);
  
  const transactionHistory = proposals.filter((proposal) => proposal.status === 'approved');

  const fetchWallet = async () => {
    try {
    const rpc = new JsonRpc(endpoint);
    const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'fundconfig',
    });
  
    const account = result?.rows?.[0]?.communityWallet;
    if (!account) return null;
    setWallet(account);

    } catch (error) {
    console.error('Failed to fetch community wallet:', error);
    }
  };

  useEffect (() => {
    fetchWallet();
  }, []);

  const fetchToken = async () => {
    try {
    const rpc = new JsonRpc(endpoint);
    const result = await rpc.get_table_rows({
        json: true,
        code: tokenAcc,
        scope: wallet,
        table: 'accounts',
    });
  
    const balanceStr = result?.rows?.[0]?.balance;
    if (!balanceStr) return null;
  
    const [amountStr] = balanceStr.split(' ');
    const amount = parseFloat(amountStr);
    setTotalBalance(amount);
          
    } catch (error) {
    console.error('Failed to fetch reports:', error);
    }
  };

  useEffect (() => {
    fetchToken();
  }, [wallet]);

  const ChartData = transactionHistory.map(item => ({
  ...item,
  amount: parseFloat(item.amount) / 10000,
 }));

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        <FaWallet style={{ marginRight: 8 }} /> Community Rewards Wallet
      </Typography>

      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <FaMoneyBillWave style={{ marginRight: 8 }} /> Total Balance: {totalBalance} SNIPS
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <FaChartPie style={{ marginRight: 8 }} /> Fund Distribution (Current Allocations)
            </Typography>
            <GeneralPieChart
              data={ChartData}
              nameKey="category"
              valueKey="amount"
              PIE_COLORS={COLORS}
              centerLabel="Distribution"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <FaChartBar style={{ marginRight: 8 }} /> Allocation Breakdown by Category
            </Typography>
            
            <BarChart
              data={ChartData}
              dataKey="amount"
              xAxisKey="category"
              name="Amount"
              barColors={COLORS}
            />

          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ mt: 3 }}>
              <CardContent>
              <Typography variant="h6" gutterBottom>
                  <FaHistory style={{ marginRight: 8 }} />  Transaction History
              </Typography>
              <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="allocation history table">
                  <TableHead>
                      <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Recipient</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount(SNIPS)</TableCell>
                      <TableCell>Date</TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionHistory.map((allocation, index) => (
                      <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {allocation.id}
                      </TableCell>
                      <TableCell>{allocation.recipient}</TableCell>
                      <TableCell>{allocation.category}</TableCell>
                      <TableCell>{(parseFloat(allocation.amount) / 10000).toFixed(4)}</TableCell>
                      <TableCell>{new Date(allocation.approvedAt * 1000).toISOString().split('T')[0]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
              </TableContainer>
              </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommunityWalletDashboard;