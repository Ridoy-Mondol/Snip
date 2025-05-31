"use client"
import React, {useState, useEffect} from 'react';
import { FiActivity } from "react-icons/fi";
import { Box, Container, Grid, Typography } from "@mui/material";
import DaoHeader from "@/components/dashboard/DaoHeader";
import KeyMetrics from "@/components/dashboard/KeyMetrics";
import RecentElections from "@/components/dashboard/RecentElections";
import RecentProposals from '@/components/dashboard/RecentProposals';
import RecentTransaction from '@/components/dashboard/RecentTransaction';
import AboutSection from '@/components/dashboard/About';
import Announcements from '@/components/dashboard/Announcements';
import { fetchTableRows } from '@/components/blockchain/fetchTable';

export default function DaoDashboard() {
  const [election, setElection] = useState<any[]>([]);
  const [members, setMembers] = useState<any>([]);
  const [moderators, setModerators] = useState<any>([]);
  const [totalBalance, setTotalBalance] = useState<number>();
  const [wallet, setWallet] = useState("");
  const [proposals, setProposals] = useState<any>([]);
  const [revenue, setRevenue] = useState<any>([]);
  const [transaction, setTransaction] = useState<any []>([])

  const tokenAcc = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ACC!;

  useEffect(() => {
    const fetchWallet = async () => {
      const rows = await fetchTableRows({ table: 'fundconfig', limit: 1 });
      const account = rows?.[0]?.communityWallet;
      if (account) setWallet(account);
    };
    fetchWallet();
  }, []);

  useEffect(() => {
    if (!wallet) return;

    const fetchData = async () => {
      const [
        electionData,
        memberData,
        moderatorData,
        proposalData,
        revenueData,
        tokenData,
        transactionData,
      ] = await Promise.all([
        fetchTableRows({ table: 'elections' }),
        fetchTableRows({ table: 'council' }),
        fetchTableRows({ table: 'moderators' }),
        fetchTableRows({ table: 'proposals' }),
        fetchTableRows({ table: 'revenues' }),
        fetchTableRows({
          table: 'accounts',
          code: tokenAcc,
          scope: wallet,
        }),
        fetchTableRows({
          table: 'fundprops',
          filterFn: (rows) => rows.filter((t) => t.status === 'approved'),
        }),
      ]);

      setElection(electionData);
      setMembers(memberData);
      setModerators(moderatorData);
      setProposals(proposalData);
      setRevenue(revenueData);

      const balanceStr = tokenData?.[0]?.balance;
      if (balanceStr) {
        const [amountStr] = balanceStr.split(' ');
        setTotalBalance(parseFloat(amountStr));
      }

      setTransaction(transactionData);
    };

    fetchData();
  }, [wallet]);

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
