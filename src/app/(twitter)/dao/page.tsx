"use client"
import React, {useState, useEffect} from 'react';
import { JsonRpc } from 'eosjs';
import { FiActivity } from "react-icons/fi";
import { Box, Container, Grid, Typography } from "@mui/material";
import DaoHeader from "@/components/dashboard/DaoHeader";
import KeyMetrics from "@/components/dashboard/KeyMetrics";
import RecentElections from "@/components/dashboard/RecentElections";
import RecentProposals from '@/components/dashboard/RecentProposals';
import RecentTransaction from '@/components/dashboard/RecentTransaction';
import AboutSection from '@/components/dashboard/About';
import Announcements from '@/components/dashboard/Announcements';

export default function DaoDashboard() {
  const [election, setElection] = useState<any[]>([]);
  const [members, setMembers] = useState<any>([]);
  const [moderators, setModerators] = useState<any>([]);
  const [totalBalance, setTotalBalance] = useState<number>();
  const [wallet, setWallet] = useState("");
  const [proposals, setProposals] = useState<any>([]);
  const [revenue, setRevenue] = useState<any>([]);
  const [transaction, setTransaction] = useState<any []>([])

  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;
  const tokenAcc = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ACC!;

  
  const fetchElections = async () => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'elections',
        limit: 100,
      });
      setElection(result.rows);
    } catch (error) {
      console.error('Failed to fetch election:', error);
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
    
      setMembers(result.rows);
    
    } catch (error) {
      console.error('Failed to fetch member:', error);
    }
  };

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
    
  const fetchModerators = async () => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'moderators',
        limit: 100,
      });
          
      setModerators(result.rows);
    } catch (error) {
      console.error('Failed to fetch moderators:', error);
    }
  };
  const fetchProposals = async () => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'proposals',
        limit: 100,
      });
      
      setProposals(result.rows);
    } catch (error) {
      console.error('Failed to fetch moderator:', error);
    }
  };

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

  const fetchTransac = async () => {
    try {
    const rpc = new JsonRpc(endpoint);
    const result = await rpc.get_table_rows({
      json: true,
      code: contractAcc,
      scope: contractAcc,
      table: 'fundprops',
      limit: 100,
    });
    const filtered = result.rows.filter((t) => t.status === "approved")
    setTransaction(filtered);
    } catch (error) {
      console.error('Failed to fetch election:', error);
    }
  };

  useEffect(() => {
    fetchElections();
    fetchMembers();
    fetchModerators();
    fetchProposals();
    fetchToken();
    fetchRevenue();
    fetchTransac();
  },[wallet]);
  return (
    <Container maxWidth="lg">
      <DaoHeader />
      <Grid container spacing={3}>

        <Grid item xs={12} md={12}>
          <AboutSection />
        </Grid>

        <Grid item xs={12}>
          <KeyMetrics
            election={election}
            members={members}
            moderators={moderators}
            totalBalance={totalBalance}
            proposals={proposals}
            revenue={revenue}
          />
        </Grid>

        <Grid item xs={12} md={12}>
          <Announcements
            election={election}
            proposals={proposals}
            transaction={transaction}
          />
        </Grid>

        <Grid item xs={12} md={12} mt={6}> 
        <Typography variant="h4" align="left" fontWeight={600} gutterBottom>
          <Box component="span" sx={{ verticalAlign: "middle", mr: 1 }}>
            <FiActivity />
          </Box>
          Recent DAO Activity
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={4}>
          Stay informed with the latest DAO actions — from newly submitted proposals and recent council elections
          to updates on key governance decisions. This section highlights the ongoing evolution of the Snipverse ecosystem.
        </Typography>
        <Grid item xs={12} md={12}>
          <RecentElections election={election} />
        </Grid>
        <Grid item xs={12} md={12} mt={4}>
          <RecentProposals proposals={proposals} />
        </Grid>
        <Grid item xs={12} md={12} my={4}>
          <RecentTransaction transaction={transaction}  />
        </Grid>
        </Grid>
      
      </Grid>
    </Container>
  );
}
