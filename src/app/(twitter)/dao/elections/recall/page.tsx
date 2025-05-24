"use client"
import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { JsonRpc } from 'eosjs';
import { Box, Typography, Button, Grid, Chip, Divider, LinearProgress, Card, CardContent, Avatar, RadioGroup, FormControlLabel, Radio, } from '@mui/material';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { formatDistanceToNowStrict } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import Countdown from "react-countdown";

import { AuthContext } from "@/context/AuthContext";
import { getUser } from "@/utilities/fetch";
import { getFullURL } from "@/utilities/misc/getFullURL";
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";
import CircularLoading from "@/components/misc/CircularLoading";
import { useWallet } from "@/context/WalletContext";

const getProgress = (start: number, end: number) => {
  const now = Date.now();
  return ((now - start) / (end - start)) * 100;
};

const ElectionDetails = () => {
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [vote, setVote] = useState('');
  const [isVoted, setIsVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

  const searchParams = useSearchParams();
  const member = searchParams.get('member');
  const election = searchParams.get('election');

  const { token } = useContext(AuthContext);
  const { activeSession, connectWallet } = useWallet();

  useEffect(() => {
    fetchRecallElections();
    fetchMembers();
  }, []);

  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;

  const fetchRecallElections = async () => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'recallvotes',
        limit: 100,
      });
      const filteredElection = result.rows.filter((e) => (e.electionName === election && e.councilMember === member));
      setSelectedElection(filteredElection[0]);
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

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'winners',
        limit: 100,
      });
      const currentMember = result.rows.filter((m) => (m.electionName === election && m.winner === member));
      
      const userFetchPromises = currentMember.map(async (member) => {
        try {
          const userData = await getCachedUser(member.userName);
          return { photoUrl: userData.photoUrl };
        } catch (error) {
          console.error(`Failed to fetch user data for ${member.userName}:`, error);
          return { ...member, photoUrl: null };
        }
      });
  
      const memberWithPhotos = await Promise.all(userFetchPromises);
      setSelectedElection((prev: any) => ({
        ...prev,
        ...memberWithPhotos[0],
      }));      

    } catch (error) {
      console.error('Failed to fetch member:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchVoter = async () => {
    try {
      if (!activeSession || !activeSession.auth || !activeSession.auth.actor) {
        console.log('No active session or actor found');
        return;
      }
      const rpc = new JsonRpc(endpoint);
      const actorName = activeSession.auth.actor.toString();
      console.log('Querying voter for:', actorName);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'recallvoters',
        lower_bound: actorName,
        limit: 100,
      });
      const filtered = result.rows.filter(
        (row: any) =>
          row.voter === actorName && row.electionName === election
      );
      console.log('filtered', filtered);
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
        name: 'recall',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          voter: activeSession.auth.actor.toString(),
          userName: token?.username,
          councilMember: member,
          electionName: selectedElection.electionName,
          voteToReplace: vote === 'yes' ? true : false,
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
        message: `You successfully voted in this recall election!`,
        severity: "success",
        open: true,
      });
      fetchRecallElections();

    } catch (error: any) {
      console.error('Vote failed:', error);
    }
  }

  if (!selectedElection) return <CircularLoading />;;

  const now = Math.floor(Date.now() / 1000);
  const {
    reason,
    startTime,
    endTime,
    keepVotes,
    replaceVotes,
    photoUrl
  } = selectedElection;

  const votingOpen = now >= startTime && now <= endTime;
  const votingNotStarted = now < startTime;
  const votingEnded = now > endTime;

  const getCountdown = (timestamp: number) => formatDistanceToNowStrict(new Date(timestamp * 1000), { addSuffix: true });

  return (
    <Box sx={{ p: 4 }}>
      {/* HEADER */}
      <Typography variant="h3" gutterBottom fontWeight={600}>
         Recall Election for: {member}
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        You're participating in the Snipverse recall election to decide the future of a current council member. Your vote matters.
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Phase Tracker */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Election Phase:</strong>{" "}
                {votingNotStarted && <Chip label="Upcoming" color="warning" />}
                {votingOpen && <Chip label="Ongoing" color="success" />}
                {votingEnded && <Chip label="Closed" color="error" />}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={votingEnded ? 100 : (votingOpen ? getProgress(startTime * 1000, endTime * 1000) : 0)}
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
                  {votingNotStarted && (
                    <>
                      <Typography variant="h6">🕒 Voting hasn't started yet.</Typography>
                      <Typography variant="body2"> starts in: {<Countdown date={startTime * 1000} />}</Typography>
                    </>
                  )}
          
                  {votingOpen && (
                    <>
                      <Typography variant="h6">🗳️ Voting is live!</Typography>
                      <Typography variant="body2">Ends in: {<Countdown date={endTime * 1000} />}</Typography>
                    </>
                  )}
          
                  {votingEnded && (
                    <>
                      <Typography variant="h6">📉 Voting has ended.</Typography>
                      <Typography mt={1}>Ended:  {getCountdown(endTime)}</Typography>
                    </>
                  )}
                </Box>

                {/* vote card */}
                <Typography variant="h5" gutterBottom fontWeight={600}>🗳️ Recall Vote
                </Typography>
                <Card sx={{ mb: 2, px: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      alt="Jane Doe"
                      src={getFullURL(photoUrl)}
                      sx={{ width: 80, height: 80, mb: 1 }}
                    />
                    <Typography variant="h6" component="div" align="center">
                      {member}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      Reason:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reason}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    Do you want to recall {member}?
                  </Typography>
                  <RadioGroup
                    aria-label="recall-vote"
                    name="recallVote"
                    value={vote}
                    onChange={handleVoteChange}
                    sx={{ mb: 2 }}
                  >
                    <FormControlLabel
                      value="yes"
                      control={
                        <Radio
                          icon={<AiOutlineCheckCircle size={20} />}
                          checkedIcon={<AiOutlineCheckCircle size={20} color="green" />}
                          disabled={!votingOpen || isVoted}
                        />
                      }
                      label="Yes, Recall"
                    />
                    <FormControlLabel
                      value="no"
                      control={
                        <Radio
                          icon={<AiOutlineCloseCircle size={20} />}
                          checkedIcon={<AiOutlineCloseCircle size={20} color="red" />}
                          disabled={!votingOpen || isVoted}
                        />
                      }
                      label="No, Do Not Recall"
                    />
                  </RadioGroup>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCastVote}
                    disabled={!vote || !votingOpen || isVoted}
                    sx={{ width: '100%' }}
                  >
                    Cast Recall Vote
                  </Button>
                </CardContent>
               </Card>

             {/* Vote Chart */}
             {((keepVotes + replaceVotes > 0) && (votingEnded || isVoted)) && (
                <Box mt={6}>
                  <Typography variant="h5" gutterBottom>
                    📊 Recall Vote Distribution
                  </Typography>
                  <Grid container spacing={4}>
                  <Grid item xs={12} md={12}>
                  <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="votes"
                      data={[
                        { name: 'Keep', votes: keepVotes },
                        { name: 'Replace', votes: replaceVotes }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#4caf50" />
                      <Cell fill="#f44336" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              
              {/* bar chart */}
              <Grid item xs={12} md={12}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={[
                      { name: 'Keep', votes: keepVotes },
                      { name: 'Replace', votes: replaceVotes }
                    ]}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="votes" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
         )}
      
      {/* Total Votes */}
      {
      (votingOpen || votingEnded) &&
      <Box mt={5}>
        <Typography variant="body1">
          🧮 Total Votes Counted: <strong>{keepVotes + replaceVotes}</strong>
        </Typography>
      </Box>
      }

      {snackbar.open && (
        <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
      )}

    </Box>
  );
};

export default ElectionDetails;
