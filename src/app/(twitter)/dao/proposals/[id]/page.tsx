"use client"
import React, { useState, useEffect } from 'react';
import { JsonRpc } from 'eosjs';
import { Box, Typography, Button, Grid, Chip, Divider, LinearProgress, Card, CardContent, Avatar, RadioGroup, FormControlLabel, Radio, Stack, } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { formatDistanceToNowStrict } from 'date-fns';
import Countdown from "react-countdown";

import { getUser } from "@/utilities/fetch";
import { getFullURL } from "@/utilities/misc/getFullURL";
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";
import CircularLoading from "@/components/misc/CircularLoading";
import { useWallet } from "@/context/WalletContext";
import PieChart from '@/components/chart/PieChart';
import BarChart from '@/components/chart/BarChart';

const getProgress = (start: number, end: number) => {
  const now = Date.now();
  return ((now - start) / (end - start)) * 100;
};
  
const CategoryChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(0.5),
  fontWeight: 600,
  marginBottom: theme.spacing(1),
}));
  
const DescriptionTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  whiteSpace: 'pre-line', 
}));

const ProposalDetails = ({ params }: { params: { id: string } }) => {
  const [proposals, setProposals] = useState<any>(null);
  const [vote, setVote] = useState('');
  const [isVoted, setIsVoted] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

  const { activeSession, connectWallet } = useWallet();

  const proposalId = params.id;

  useEffect(() => {
    fetchProposals();
  }, []);

   const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
   const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;

   const fetchProposals = async () => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'proposals',
        lower_bound: proposalId,
        limit: 100,
      });

      const userFetchPromises = result.rows.map(async (p) => {
        try {
          const userData = await getCachedUser(p.userName
          );
          return { ...p, photoUrl: userData.photoUrl };
        } catch (error) {
          console.error(`Failed to fetch user data for ${p.userName}:`, error);
          return { ...p, photoUrl: null };
        }
      });
        
      const membersWithPhotos = await Promise.all(userFetchPromises);

      setProposals(membersWithPhotos[0]);
    } catch (error) {
      console.error('Failed to fetch election:', error);
    }
   };
  
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

  const fetchVoter = async () => {
    try {
      if (!activeSession || !activeSession.auth || !activeSession.auth.actor) { 
        return;
      }
      const rpc = new JsonRpc(endpoint);
      const actorName = activeSession.auth.actor.toString();
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'propvoters',
        lower_bound: actorName,
        limit: 100,
      });
      const filtered = result.rows.filter(
        (row: any) =>
          row.voter.toString() === actorName && row.proposalId.toString() === proposalId
      );
      if (filtered.length > 0) {
        setIsVoted(true);
      }
    } catch (error) {
      console.log('Failed to fetch voters:', error);
    }
  };

  useEffect(() => {
    fetchVoter();
  }, [activeSession]);
  
  const handleVoteChange = (event: any) => {
    setVote(event.target.value);
  };

  const handleCastVote = async () => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: "error",
        open: true,
      });
      connectWallet();
      return;
    }

    if (!vote) {
      setSnackbar({
        message: 'Please choose a option',
        severity: "error",
        open: true,
      });
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: 'voteprop',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          voter: activeSession.auth.actor.toString(),
          proposalId: proposalId,
          vote: vote,
        },
      };

      const result = await activeSession.transact(
        {
          actions: [action],
        },
        {
          broadcast: true,
        }
      );
      
      setSnackbar({
        message: `You successfully voted in this proposal!`,
        severity: "success",
        open: true,
      });
      fetchProposals();

    } catch (error: any) {
      console.error('Vote failed:', error);
    }
  }

  if (!proposals) return <CircularLoading />;

  const now = Math.floor(Date.now() / 1000);
  const {
    id,
    proposer,
    title,
    description,
    category,
    yesCount,
    noCount,
    deadline,
    photoUrl
  } = proposals;

  const votingOpen = now < deadline;
  const votingEnded = now > deadline;

  const getCountdown = (timestamp: number) => formatDistanceToNowStrict(new Date(timestamp * 1000), { addSuffix: true });

  const chartData = [
    { name: "Yes", votes: yesCount },
    { name: "No", votes: noCount },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* HEADER */}
      <Typography variant="h3" gutterBottom fontWeight={600}>
         Proposal Details and Voting
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
         Explore the full details of the proposal below and make your voice heard by casting your vote.
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Phase Tracker */}
      <Box sx={{ mb: 4 }}>
          <Typography variant="body1" gutterBottom>
          <strong>Election Phase:</strong>{" "}
          {votingOpen && <Chip label="Open" color="success" />}
          {votingEnded && <Chip label="Closed" color="error" />}
          </Typography>
          <LinearProgress
          variant="determinate"
          value={votingEnded ? 100 : (votingOpen ? getProgress(id * 1000, deadline * 1000) : 0)}
          sx={{
              height: 8,
              borderRadius: 2,
              mt: 3,
              backgroundColor: 'grey.300',
              '& .MuiLinearProgress-bar': {
              backgroundColor: 'blue',
              },
          }}
          />
      </Box>


      {/* Countdown Section */}
      <Box sx={{ mb: 4 }}>
          {votingOpen && (
          <>
              <Typography variant="h6">🗳️ Voting is live!</Typography>
              <Typography variant="body2">Ends in: {<Countdown date={deadline * 1000} />}</Typography>
          </>
          )}
          
          {votingEnded && (
          <>
              <Typography variant="h6">📉 Voting has ended.</Typography>
              <Typography mt={1}>Ended:  {getCountdown(deadline)}</Typography>
          </>
          )}
      </Box>

      {/* vote card */}
      <Typography variant="h5" gutterBottom fontWeight={600}>🗳️ Proposal Vote
      </Typography>


      <Card sx={{ mb: 4, p: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
          {/* Proposer Image and Name */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Avatar
              alt={proposer}
              src={photoUrl ? getFullURL(photoUrl) : undefined}
              sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Typography variant="h6" fontWeight="bold" align="center">
              {proposer}
              </Typography>
          </Box>

          {/* Title */}
          <Typography variant="h5" fontWeight="bold" mb={1}>
              {title}
          </Typography>

          {/* Category */}
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <CategoryChip label={category} color="secondary" size="small" />
          </Stack>

          {/* About Section */}
          <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
              About this proposal:
              </Typography>
              <DescriptionTypography variant="body2">
              {description}
              </DescriptionTypography>
          </Box>

          {/* Vote Section */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
              Cast Your Vote
          </Typography>

          <RadioGroup
              aria-label="proposal-vote"
              name="proposalVote"
              value={vote}
              onChange={handleVoteChange}
              sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', mb: 3 }}
          >
              <FormControlLabel
              value="yes"
              control={
                  <Radio
                  icon={<AiOutlineCheckCircle size={30} />}
                  checkedIcon={<AiOutlineCheckCircle size={30}            color="green" />}
                  disabled={!votingOpen || isVoted}
                  />
              }
              label={<Typography variant="subtitle1">Yes</Typography>}
              />
              <FormControlLabel
              value="no"
              control={
                  <Radio
                  icon={<AiOutlineCloseCircle size={30} />}
                  checkedIcon={<AiOutlineCloseCircle size={30}            color="red" />}
                  disabled={!votingOpen || isVoted}
                  />
              }
              label={<Typography variant="subtitle1">No</Typography>}
              />
          </RadioGroup>

          {/* Submit Vote Button */}
          <Button
              variant="contained"
              size="large"
              disabled={!vote || !votingOpen || isVoted}
              sx={{
              width: '100%',
              py: 1.5,
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' },
              fontWeight: 'bold',
              fontSize: '1rem',
              borderRadius: 2,
              }}
              onClick={handleCastVote}
          >
              Submit Vote
          </Button>
          </CardContent>
      </Card>

      {/* Vote Chart */}
      {((yesCount + noCount > 0) && (votingEnded || isVoted)) && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            📊 Proposal Vote Distribution
          </Typography>
          <Grid container spacing={4}>
          <Grid item xs={12} md={12}>

          <PieChart
            data={chartData}
            nameKey="name"
            valueKey="votes"
            PIE_COLORS={["#4caf50", "#f44336"]}
            centerLabel="Votes"
          />

      </Grid>
              
      {/* bar chart */}
      <Grid item xs={12} md={12}>
        
        <BarChart
          data={chartData}
          dataKey="votes"
          xAxisKey="name"
          name="Votes"
          barColors={["#4caf50", "#f44336"]}
        />

      </Grid>
      </Grid>
     </Box>
     )}
      
      {/* Total Votes */}
      {
      (votingOpen || votingEnded) &&
      <Box mt={5}>
        <Typography variant="body1">
          🧮 Total Votes Counted: <strong>{yesCount + noCount}</strong>
        </Typography>
      </Box>
      }

      {snackbar.open && (
        <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
      )}

    </Box>
  );
};

export default ProposalDetails;




