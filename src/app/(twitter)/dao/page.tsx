"use client"
import { Box, Container, Grid } from "@mui/material";
import DaoHeader from "@/components/dashboard/DaoHeader";
import KeyMetrics from "@/components/dashboard/KeyMetrics";
import ActiveElections from "@/components/dashboard/ActiveElections";
import VotingData from "@/components/dashboard/VotingData";
import CommunityWallet from "@/components/dashboard/CommunityWallet";
import CouncilMembers from "@/components/dashboard/CouncilMembers";
import RecallVote from "@/components/dashboard/RecallVote";

export default function DaoDashboard() {
  return (
    <Container maxWidth="lg">
      {/* <DaoHeader /> */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <KeyMetrics />
        </Grid>
        <Grid item xs={12} md={12}>
          <ActiveElections />
        </Grid>
        <Grid item xs={12} md={12}>
          <VotingData />
        </Grid>
        <Grid item xs={12} md={12}>
          <CommunityWallet />
        </Grid>
        {/* <Grid item xs={12} md={12}>
          <CouncilMembers />
        </Grid>
        <Grid item xs={12}>
          <RecallVote />
        </Grid> */}
      </Grid>
    </Container>
  );
}
