"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Chip,
  Stack,
  Tabs, 
  Tab,
} from '@mui/material';
import { FaRegCalendarAlt, FaUserFriends, FaVoteYea, FaUserTie, FaRegClock, FaBalanceScaleLeft } from 'react-icons/fa';
import { MdHowToVote } from 'react-icons/md';
import { JsonRpc } from 'eosjs';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { useWallet } from "@/context/WalletContext";
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";

const Election = () => {
  const [elections, setElections] = useState<any[]>([]);
  const [recallData, setRecallData] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newElectionName, setNewElectionName] = useState('');
  const [newRegistrationStartTime, setNewRegistrationStartTime] = useState('');
  const [newRegistrationEndTime, setNewRegistrationEndTime] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newCandidateStake, setNewCandidateStake] = useState('');
  const [newVoterStake, setNewVoterStake] = useState('');
  const [tab, setTab] = useState<number>(0);
  const [recallTab, setRecallTab] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

  const router = useRouter();
  const { activeSession, connectWallet } = useWallet();

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
      console.log('Elections data:', result.rows);
      setElections(result.rows);
    } catch (error) {
      console.error('Failed to fetch elections:', error);
    }
  };

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
      console.log('Recall elections data:', result.rows);
      setRecallData(result.rows);
    } catch (error) {
      console.error('Failed to fetch elections:', error);
    }
  };

  useEffect(() => {
    fetchElections();
    fetchRecallElections();
  }, []);

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    resetCreateForm();
  };

  const resetCreateForm = () => {
    setNewElectionName('');
    setNewRegistrationStartTime('');
    setNewRegistrationEndTime('');
    setNewStartTime('');
    setNewEndTime('');
    setNewCandidateStake('');
    setNewVoterStake('');
  };

  const handleCreateElection = async () => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: "error",
        open: true,
      });
      connectWallet();
      return;
    }

    if (!newElectionName.trim()) {
      setSnackbar({
        message: 'Election Name cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }
    if (!newRegistrationStartTime.trim()) {
      setSnackbar({
        message: 'Registration Start Time cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }
    if (!newRegistrationEndTime.trim()) {
      setSnackbar({
        message: 'Registration End Time cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }
    if (!newStartTime.trim()) {
      setSnackbar({
        message: 'Voting Start Time cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }
    if (!newEndTime.trim()) {
      setSnackbar({
        message: 'Voting End Time cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }
    if (!newCandidateStake.trim()) {
      setSnackbar({
        message: 'Candidate Stake Amount cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }
    if (!newVoterStake.trim()) {
      setSnackbar({
        message: 'Voter Stake Amount cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }

    try {
      // Convert UTC date strings to JavaScript Date objects
      const regStartUTC = new Date(newRegistrationStartTime);
      const regEndUTC = new Date(newRegistrationEndTime);
      const startUTC = new Date(newStartTime);
      const endUTC = new Date(newEndTime);

      // Get Unix timestamps in seconds (UTC)
      const regStartTimeSec = Math.floor(regStartUTC.getTime() / 1000);
      const regEndTimeSec = Math.floor(regEndUTC.getTime() / 1000);
      const startTimeSec = Math.floor(startUTC.getTime() / 1000);
      const endTimeSec = Math.floor(endUTC.getTime() / 1000);

      const action = {
        account: contractAcc,
        name: 'createelect',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          electionName: newElectionName,
          startTime: startTimeSec,
          endTime: endTimeSec,
          registrationStartTime: regStartTimeSec,
          registrationEndTime: regEndTimeSec,
          candidateStakeAmount: parseInt(newCandidateStake, 10),
          voterStakeAmount: parseInt(newVoterStake, 10),
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
        message: 'Election created successfully!',
        severity: "success",
        open: true,
      });
      closeCreateDialog();
      fetchElections();
    } catch (error: any) {
      console.error('Failed to create election:', error);
    }
  };
  
  const now = Math.floor(Date.now() / 1000);
  const isPastElection = (election: any) => {
    return now > election.endTime;
  };

  const isElectionOngoing = (election: any) => {
    return (now <= election.endTime && now >= election.startTime);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
  
    return `${month}/${day}/${year}`;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleRecallTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setRecallTab(newValue);
  };

  const activeElections = elections.filter((e) => !isPastElection(e));
  const pastElections = elections.filter((e) => isPastElection(e));
  
  const activeRecalls = recallData.filter((e) => !isPastElection(e));
  const pastRecalls = recallData.filter((e) => isPastElection(e));
  const recallEnded = (endTime: number) => {
    return endTime < now;
  }

  const renderElectionCard = (election: any, isPast = false) => (
    <Grid item xs={12} sm={6} key={election.electionName}>
      <Box
        sx={{
          border: '1px solid #ccc',
          borderRadius: 2,
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.01)' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: '#1976D2',
            color: 'white',
            borderRadius: 1,
            mb: 1,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {election.electionName}
            </Typography>
            <Chip
              label={isPast ? "ended" : isElectionOngoing(election) ? "ongoing" : "upcoming"}
              color={isPast ? "warning" : "success"}
              size="small"
              variant="filled"
              sx={{ color: "white" }}
            />
          </Box>
        </Box>

        <Box sx={{ p: 1 }}>
          <Typography mt={2} variant="body2" gutterBottom>
            <FaRegCalendarAlt style={{ marginRight: 6, color: '#1976D2' }} />
            <strong>Reg:</strong> {formatDate(election.registrationStartTime)} - {formatDate(election.registrationEndTime)}
          </Typography>
          <Typography mt={2} variant="body2" gutterBottom>
            <MdHowToVote style={{ marginRight: 6, color: '#1976D2' }} />
            <strong>Voting:</strong> {formatDate(election.startTime)} - {formatDate(election.endTime)}
          </Typography>
          <Typography mt={2} variant="body2" gutterBottom>
            <FaUserFriends style={{ marginRight: 6, color: '#1976D2' }} />
            <strong>Applied Candidates:</strong> {election.candidates?.length || 0}
          </Typography>
          <Typography mt={2} variant="body2" gutterBottom>
            <FaVoteYea style={{ marginRight: 6, color: '#1976D2' }} />
            <strong>Total Votes:</strong> {election.totalVote || 0}
          </Typography>

          <Button
            sx={{
              mt: 2,
              backgroundColor: '#1976D2',
              color: 'white',
              '&:hover': { backgroundColor: '#1565C0' },
            }}
            onClick={(e) => {
              router.push(`/dao/elections/${election.electionName}`);
              e.stopPropagation();
            }}
          >
            View Details
          </Button>
        </Box>
      </Box>
    </Grid>
  );

  const renderRecallCards = (data: any[], emptyMessage: string) => {

    if (data.length === 0) {
      return (
        <Grid item xs={12}>
          <Box
            sx={{
              textAlign: 'center',
              mt: 4,
              p: 3,
              border: '1px dashed #ccc',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        </Grid>
      );
    }

    return ( 
     <Grid container spacing={2}>
      {data.map((e) => (
        <Grid item xs={12} sm={6} key={e.electionName}>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: 2,
              p: 2,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.01)' },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{e.electionName}</Typography>
              <Chip
              label={recallEnded(e.endTime) ? "ended" : isElectionOngoing(e) ? "ongoing" : "upcoming"}
              color="error"
              size="small"
              variant="filled"
              sx={{ color: "white" }}
            />

            </Box>

            <Typography mt={2}>
              <FaUserTie style={{ marginRight: 6 }} />
              <strong>Member:</strong> {e.councilMember}
            </Typography>

            <Typography mt={1}>
              <FaRegClock style={{ marginRight: 6 }} />
              <strong>Time:</strong> {formatDate(e.startTime)} - {formatDate(e.endTime)}
            </Typography>

            <Typography mt={1}>
              <FaBalanceScaleLeft style={{ marginRight: 6 }} />
              <strong>Votes:</strong> {e.keepVotes + e.replaceVotes}
            </Typography>

            <Typography mt={1}>
              <strong>Reason:</strong> {e.reason.length > 15 ? `${e.reason.slice(0, 15)}...` : e.reason}
            </Typography>

            <Button
              sx={{ mt: 2 }}
              variant="contained"
              color="error"
              onClick={() => {
                router.push(
                  `/dao/elections/recall?member=${encodeURIComponent(e.councilMember)}&election=${encodeURIComponent(e.electionName)}`
                );
              }}              
            >
              View Details
            </Button>
          </Box>
        </Grid>
      ))}
    </Grid>
  )};


  return (
    <Container maxWidth="md" style={{ marginTop: '20px' }}>
      <Typography variant="h4" align="left" fontWeight={600} gutterBottom>
        <Box component="span" sx={{ verticalAlign: "middle", mr: 1 }}>
          <MdHowToVote />
        </Box>
         DAO Council Elections
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mt: 1, mb: 3 }}>
        Participate in shaping the future of our decentralized community by voting in the latest DAO Council elections.
        Elect leaders who represent your interests and help guide the protocol's strategic direction.
      </Typography>

      {activeSession && (
        <Button variant="contained" color="secondary" onClick={openCreateDialog} style={{ marginBottom: '10px' }}>
          Create New Election
        </Button>
       )} 
      
    {/* council member elections */}
    <Box sx={{ width: '100%', my: '2rem' }}>
      <Typography variant="h5" gutterBottom>
      🗳️ Council Member Elections
      </Typography>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }} textColor="primary" indicatorColor="primary">
        <Tab label="🟢 Active Elections" />
        <Tab label="🕒 Past Elections" />
      </Tabs>

      {/* Active Elections Tab */}
      {tab === 0 && (
        <Grid container spacing={2}>
          {activeElections.length === 0 ? (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: 'center',
                  mt: 4,
                  p: 3,
                  border: '1px dashed #ccc',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No active elections at the moment.
                </Typography>
              </Box>
            </Grid>
          ) : (
            activeElections.map((e) => renderElectionCard(e))
          )}
        </Grid>
      )}

      {/* Past Elections Tab */}
      {tab === 1 && (
        <Grid container spacing={2}>
          {pastElections.length === 0 ? (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: 'center',
                  mt: 4,
                  p: 3,
                  border: '1px dashed #ccc',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No past elections recorded.
                </Typography>
              </Box>
            </Grid>
          ) : (
            pastElections.map((e) => renderElectionCard(e, true))
          )}
        </Grid>
      )}
    </Box>
    
    {/* Recall elections */}
    <Box mt={6} mb={4}>
      <Typography variant="h5" gutterBottom>
        🔁 Recall Elections
      </Typography>

      <Tabs value={recallTab} onChange={handleRecallTabChange} sx={{ mb: 3 }}>
        <Tab label="🔴 Active Recalls" />
        <Tab label="🕓 Past Recalls" />
      </Tabs>

      {recallTab === 0 ? renderRecallCards(activeRecalls, 'No active recall elections at the moment.') : renderRecallCards(pastRecalls, 'No past recall elections recorded.')}
    </Box>

    {snackbar.open && (
      <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
    )}

    {/* Create Election Dialog */}
    <Dialog open={isCreateDialogOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
      <DialogTitle>Create New Election</DialogTitle>
        
      <DialogContent>
      <Stack spacing={2} mt={1}>
        <TextField
          autoFocus
          margin="dense"
          label="Election Name"
          fullWidth
          value={newElectionName}
          onChange={(e) => setNewElectionName(e.target.value)}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Registration Start Time (UTC)"
            value={newRegistrationStartTime ? new Date(newRegistrationStartTime) : null}
            onChange={(value) => setNewRegistrationStartTime(value?.toISOString() ?? "")}
          />
          <DateTimePicker
            label="Registration End Time (UTC)"
            value={newRegistrationEndTime ? new Date(newRegistrationEndTime) : null}
            onChange={(value) => setNewRegistrationEndTime(value?.toISOString() ?? "")}
          />

          <DateTimePicker
            label="Voting Start Time (UTC)"
            value={newStartTime ? new Date(newStartTime) : null}
            onChange={(value) => setNewStartTime(value?.toISOString() ?? "")}
          />

          <DateTimePicker
            label="Voting End Time (UTC)"
            value={newEndTime ? new Date(newEndTime) : null}
            onChange={(value) => setNewEndTime(value?.toISOString() ?? "")}
          />
        </LocalizationProvider>

        <TextField
          margin="dense"
          label="Candidate Stake Amount"
          fullWidth
          type="number"
          value={newCandidateStake}
          onChange={(e) => setNewCandidateStake(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Voter Stake Amount"
          fullWidth
          type="number"
          value={newVoterStake}
          onChange={(e) => setNewVoterStake(e.target.value)}
        />
      </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={closeCreateDialog}>Cancel</Button>
        <Button onClick={handleCreateElection} color="secondary">
          Create Election
        </Button>
      </DialogActions>
    </Dialog>
    </Container>
  );
};

export default Election;