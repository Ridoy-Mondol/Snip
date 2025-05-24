"use client"
import React, { useState, useEffect, useContext } from 'react';
import { JsonRpc } from 'eosjs';
import { Box, Typography, Button, Grid, Chip, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Divider, LinearProgress, Avatar, Modal } from '@mui/material';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#7B1FA2'];

const getProgress = (start: number, end: number) => {
  const now = Date.now();
  return ((now - start) / (end - start)) * 100;
};

const ElectionDetails = ({ params }: { params: { id: string } }) => {
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("");
  const [votedCandidate, setVotedCandidate] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });
  
  const election = decodeURIComponent(params.id);
  const { token } = useContext(AuthContext);
  const { activeSession, connectWallet } = useWallet();

  useEffect(() => {
    fetchElections();
    fetchCandidates();
  }, []);

  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;

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
      const filteredElection = result.rows.filter((e) => e.electionName === election);
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

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'candidates',
        limit: 100,
      });
      const filteredCandidates = result.rows.filter((c) => c.electionName === election);
      
      const userFetchPromises = filteredCandidates.map(async (candidate) => {
        try {
          const userData = await getCachedUser(candidate.userName);
          return { ...candidate, photoUrl: userData.photoUrl };
        } catch (error) {
          console.error(`Failed to fetch user data for ${candidate.userName}:`, error);
          return { ...candidate, photoUrl: null };
        }
      });
  
      const candidatesWithPhotos = await Promise.all(userFetchPromises);
      setCandidates(candidatesWithPhotos);

    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
  const alreadyRegistered = candidates.filter((c) => c.account === activeSession?.auth.actor.toString());
  if (alreadyRegistered.length > 0) {
    setIsRegistered(true);
  }
  }, [candidates]);

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
        table: 'voters',
        lower_bound: actorName,
        limit: 100,
      });
      const filtered = result.rows.filter(
        (row: any) =>
          row.account === actorName && row.electionName === election
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


  const handleApply = async () => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: "error",
        open: true,
      });
      connectWallet();
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: 'registercand',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          account: activeSession.auth.actor.toString(),
          userName: token?.username,
          electionName: selectedElection.electionName,
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
        message: 'Candidate registered successfully!',
        severity: "success",
        open: true,
      });
      setShowModal(false);
      setIsRegistered(true);
      fetchCandidates();
    } catch (error: any) {
      console.error('Candidate registration failed:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: "error",
        open: true,
      });
      connectWallet();
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: 'withdrawcand',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          account: activeSession.auth.actor.toString(),
          electionName: selectedElection.electionName,
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
        message: 'Withdraw registration successfully!',
        severity: "success",
        open: true,
      });
      setShowModal(false);
      setIsRegistered(false);
      fetchCandidates();
    } catch (error: any) {
      console.error('Withdraw registration failed:', error);
    }
  };

  const handleVote = async () => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: "error",
        open: true,
      });
      connectWallet();
      return;
    }

    if (!votedCandidate) {
      setSnackbar({
        message: 'Please choose a candidate to vote',
        severity: "error",
        open: true,
      });
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: 'vote',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          voter: activeSession.auth.actor.toString(),
          userName: token?.username,
          candidate: votedCandidate,
          electionName: selectedElection.electionName,
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
      
      setShowModal(false);
      setSnackbar({
        message: `You successfully voted ${votedCandidate}!`,
        severity: "success",
        open: true,
      });
      fetchCandidates();
    } catch (error: any) {
      console.error('Vote failed:', error);
    }
  }

  if (!selectedElection) return <CircularLoading />;;

  const now = Math.floor(Date.now() / 1000);
  const {
    startTime,
    endTime,
    registrationStartTime,
    registrationEndTime,
    electionName,
    totalVote,
  } = selectedElection;

  const registrationOpen = now >= registrationStartTime && now <= registrationEndTime;
  const registrationNotStarted = now < registrationStartTime;
  const registrationEnded = now > registrationEndTime;

  const votingOpen = now >= startTime && now <= endTime;
  const votingNotStarted = now < startTime;
  const votingEnded = now > endTime;

  const getCountdown = (timestamp: number) => formatDistanceToNowStrict(new Date(timestamp * 1000), { addSuffix: true });

  return (
    <Box sx={{ p: 4 }}>
      {/* HEADER */}
      <Typography variant="h3" gutterBottom fontWeight={600}>
          {electionName}
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
         Welcome to the Snipverse council member election. Participate, make your voice heard.
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Phase Tracker */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Election Phase:</strong>{" "}
                {registrationNotStarted && <Chip label="Upcoming" color="default" />}
                {registrationOpen && <Chip label="Registration Open" color="info" />}
                {registrationEnded && votingNotStarted && <Chip label="Waiting for Voting" color="warning" />}
                {votingOpen && <Chip label="Voting Open" color="success" />}
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
                  {registrationNotStarted && (
                    <>
                      <Typography variant="h6">🕒 Registration hasn't started yet.</Typography>
                      <Typography variant="body2">Opens in: {<Countdown date={registrationStartTime * 1000} />}
                      </Typography>
                    </>
                  )}
          
                  {registrationOpen && (
                    <>
                      <Typography variant="h6">🟢 Registration is open!</Typography>
                      <Typography variant="body2" mt={1}>Closes in: {<Countdown date={registrationEndTime * 1000} />}</Typography>
                      <Button variant="contained" sx={{ mt: 2, backgroundColor: "blue", color: "#FFFFFF" }} onClick={() => {
                        setShowModal(true);
                        if (isRegistered) {
                          setAction('withdraw');
                        } else {
                          setAction('register');
                        }
                      }}
                      >
                        {isRegistered ? 'Withdraw registration' : 'Register as Candidate'}
                      </Button>
                    </>
                  )}
          
                  {registrationEnded && votingNotStarted && (
                    <>
                      <Typography variant="h6">✅ Registration is closed.</Typography>
                      <Typography variant="body2">Voting starts in: {<Countdown date={startTime * 1000} />}</Typography>
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

          {candidates.length > 0 && (
            <>
              <Box mt={6}>
                <Typography variant="h5" gutterBottom fontWeight={600}>🧾 Candidate List</Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Vote</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {candidates.map((candidate, index) => (
                        <TableRow key={candidate.account}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                            <Avatar src={candidate.photoUrl && getFullURL(candidate.photoUrl)} />
                              {candidate.account}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Button variant="outlined" color="primary" 
                            disabled={!votingOpen || votingEnded || isVoted}
                            onClick={() => {
                              setShowModal(true);
                              setAction('vote');
                              setVotedCandidate(candidate.account);
                            }}
                            >Vote</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

             {/* Vote Chart */}
             {(votingEnded || isVoted) && (
                <Box mt={6}>
                  <Typography variant="h5" gutterBottom>
                    📊 Vote Distribution
                  </Typography>
                  <Grid container spacing={4}>
                  <Grid item xs={12} md={12}>
                  <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="totalVotes"
                      data={candidates}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ account, percent }) => `${account}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {candidates.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      formatter={(value, entry, index) => candidates[index]?.account || ''}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={12}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={candidates}>
                    <XAxis dataKey="account" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalVotes" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
         )}
        </>
      )}

      {/* Total Votes */}
      {
      (votingOpen || votingEnded) &&
      <Box mt={5}>
        <Typography variant="body1">
          🧮 Total Votes Counted: <strong>{totalVote}</strong>
        </Typography>
      </Box>
      }

      {/* confirmation modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 3,
              width: '250px',
              maxWidth: '90%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {action === "register" ? `Are you sure you want to register as a candidate?` : action === "vote" ? `Are you sure you want to vote ${votedCandidate}?` : `Are you sure you want to withdraw you registration?`}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <Button variant="outlined" color="primary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="success" 
              onClick={action === 'register' ?handleApply : action === 'vote' ? handleVote : handleWithdraw}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>

        {snackbar.open && (
          <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
        )}

    </Box>
  );
};

export default ElectionDetails;
