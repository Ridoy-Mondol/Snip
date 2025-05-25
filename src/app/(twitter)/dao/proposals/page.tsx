"use client"

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { JsonRpc } from 'eosjs';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem
} from "@mui/material";
import {
  FaPlus,
  FaCog,
  FaVoteYea,
  FaUserFriends,
  FaRegCalendarAlt,
  FaGavel
} from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { AuthContext } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";
import EmptyState from "@/components/dashboard/EmptyState";

export default function ProposalPage() {
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [isPropDialogOpen, setIsPropDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [proposalStake, setProposalStake] = useState('');
  const [voterStake, setVoterStake] = useState('');
  const [activeProposals, setActiveProposals] = useState<any>([]);
  const [pastProposals, setPastProposals] = useState<any>([]);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

  const { token } = useContext(AuthContext);
  const now = Math.floor(Date.now() / 1000);
  const router = useRouter();
  
  const { activeSession, connectWallet } = useWallet();
  const permission =
    activeSession?.auth?.actor?.toString() === "snipvote" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul5";

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
          limit: 100,
        });

        let activeProposals = result.rows.filter((p) => p.deadline > now);
        let pastProposals = result.rows.filter((p) => p.deadline < now);
        setActiveProposals(activeProposals);
        setPastProposals(pastProposals);
      } catch (error) {
        console.error('Failed to fetch moderator:', error);
      }
  };

  const submitProposal = async () => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: "error",
        open: true,
      });
      connectWallet();
      return;
    }

    if (!newTitle.trim()) {
      setSnackbar({
        message: 'Title cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }
    if (!newCategory.trim()) {
      setSnackbar({
        message: 'Category cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }
    if (!newDescription.trim()) {
      setSnackbar({
        message: 'Description cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }
    if (!newDeadline.trim()) {
      setSnackbar({
        message: 'Deadline cannot be empty.',
        severity: "error",
        open: true,
      });
      return;
    }
    
    try {
      const deadlineUTC = new Date(newDeadline);
      const deadlineSec = Math.floor(deadlineUTC.getTime() / 1000);
      const action = {
        account: contractAcc,
        name: 'submitprop',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          proposer: activeSession.auth.actor.toString(),
          userName: token?.username,
          title: newTitle,
          description: newDescription,
          category: newCategory,
          deadline: deadlineSec,
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
        message: 'Proposal created successfully!',
        severity: "success",
        open: true,
      });
      setIsPropDialogOpen(false);
      fetchProposals();    
    } catch (error: any) {
      console.error('Proposal creation failed:', error);
    }
  };

  const updateConfig = async () => {
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
      const deadlineUTC = new Date(newDeadline);
      const deadlineSec = Math.floor(deadlineUTC.getTime() / 1000);
      const action = {
        account: contractAcc,
        name: 'updateconfig',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          admin: activeSession.auth.actor.toString(),
          proposalStake: proposalStake,
          voteStake: voterStake,
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
        message: 'Proposal Configuration Updated Successfully!',
        severity: "success",
        open: true,
      });
      setIsConfigDialogOpen(false);
    } catch (error: any) {
      console.error('Config creation failed:', error);
    }
  };

  const handleCloseProposals = async () => {
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
        name: 'closeprop',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          sender: activeSession.auth.actor.toString(),
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
        message: 'Proposal Closed Successfully!',
        severity: "success",
        open: true,
      });
      setIsConfigDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to close proposals:', error);
    }
  };

  const selectedProposals = tab === "active" ? activeProposals : pastProposals;

  return (
    <Container>
    <Box sx={{ p: 0 }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Proposal Center
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Submit proposals, vote on important decisions, and track governance outcomes.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FaPlus />}
          onClick={() => setIsPropDialogOpen (true)}
        >
          Create Proposal
        </Button>
        {permission && (
          <>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<FaCog />}
              onClick={() => setIsConfigDialogOpen(true)}
            >
              Update Config
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<FaGavel />}
              onClick={handleCloseProposals}
            >
              Close Proposals
            </Button>
          </>
        )}
      </Box>

      <Tabs
        value={tab}
        onChange={(e, val) => setTab(val)}
        sx={{ mb: 3 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab value="active" label="Active Proposals" />
        <Tab value="past" label="Past Proposals" />
      </Tabs>

      <Grid container spacing={2}>

        {(selectedProposals || []).length > 0 ? (
          (selectedProposals || []).map((proposal: any) =>(
            <Grid item xs={12} sm={6} key={proposal.id}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.01)' },
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: 2,
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
                      {proposal.title.slice(0, 12)}{proposal.title.length > 12 && '...'}
                    </Typography>
                    <Chip
                      label={tab === "active" ? "open" : (proposal.deadline < now && proposal.status === "open") ? "closed" : proposal.status }
                      color={tab === "active" ? "success" : proposal.status === "passed" ? "success" : "error"}
                      size="small"
                      variant="filled"
                      sx={{ color: "white", marginLeft: 1 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ p: 1 }}>
                <Typography mt={2} variant="body2" gutterBottom>
                    {proposal.description.slice(0, 60)}{proposal.description.length > 60 && '...'}
                  </Typography>

                  <Typography mt={2} variant="body2" gutterBottom>
                    <FaUserFriends style={{ marginRight: 6, color: '#1976D2' }} />
                    <strong>Proposer:</strong> {proposal.proposer}
                  </Typography>

                  <Typography mt={2} variant="body2" gutterBottom>
                    <MdCategory style={{ marginRight: 6, color: '#1976D2' }} />
                    <strong>Category:</strong> {proposal.category}
                  </Typography>

                  {tab === "active" && (
                    <Typography mt={2} variant="body2" gutterBottom>
                      <FaRegCalendarAlt style={{ marginRight: 6, color: '#1976D2' }} />
                      <strong>Deadline:</strong> {new Date(proposal.deadline * 1000).toLocaleDateString()}
                    </Typography>
                  )}

                  <Typography mt={2} variant="body2" gutterBottom>
                    <FaVoteYea style={{ marginRight: 6, color: '#1976D2' }} />
                    <strong>Total Votes:</strong> {proposal.yesCount + proposal.noCount}
                  </Typography>

                  <Button
                    sx={{
                      mt: 2,
                      backgroundColor: '#1976D2',
                      color: 'white',
                      '&:hover': { backgroundColor: '#1565C0' },
                    }}
                    onClick={() => router.push(`/dao/proposals/${proposal.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))
        ) : (
            <EmptyState message={tab === "active" ? "No active proposals available" : "No past proposals recorded"} />
          )}
      </Grid>
    </Box>

    {snackbar.open && (
      <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
    )}
 
    {/* Create Proposal Dialog */}
    <Dialog open={isPropDialogOpen} onClose={() => setIsPropDialogOpen (false)} fullWidth maxWidth="sm" sx={{p: 2}}>
    <DialogTitle>Create New Proposal</DialogTitle>
            
    <DialogContent>
    <Stack spacing={2} mt={1}>
        <TextField
        margin="dense"
        label="Title"
        fullWidth
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel>Category</InputLabel>
          <Select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="growth">Growth</MenuItem>
            <MenuItem value="funding">Funding</MenuItem>
            <MenuItem value="operational">Operational</MenuItem>
          </Select>
        </FormControl>

        <TextField
        margin="dense"
        label="Description"
        fullWidth
        multiline
        minRows={4} 
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        />
    
        <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
            label="Deadline (UTC)"
            value={newDeadline ? new Date(newDeadline) : null}
            onChange={(value) => setNewDeadline(value?.toISOString() ?? "")}
        />
        </LocalizationProvider>
    </Stack>
    </DialogContent>
    
    <DialogActions>
        <Button onClick={() => setIsPropDialogOpen(false)}>Cancel</Button>
        <Button color="secondary" onClick={submitProposal}>
        Submit Proposal
        </Button>
    </DialogActions>
    </Dialog>

    {/* Update Config Dialog */}
    <Dialog open={isConfigDialogOpen} onClose={() => setIsConfigDialogOpen (false)} fullWidth maxWidth="sm" sx={{p: 2}}>
    <DialogTitle>Update Proposal Configuration</DialogTitle>
            
    <DialogContent>
    <Stack spacing={2} mt={1}>
        <TextField
        margin="dense"
        label="Minimum Stake to Submit a Proposal (Tokens)"
        fullWidth
        value={proposalStake}
        onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
                setProposalStake(value);
            }
          }}
        />

        <TextField
        margin="dense"
        label="Minimum Stake to Vote on a Proposal (Tokens)"
        fullWidth
        value={voterStake}
        onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
                setVoterStake(value);
            }
          }}
        />
    </Stack>
    </DialogContent>
    
    <DialogActions>
        <Button onClick={() => setIsConfigDialogOpen(false)}>Cancel</Button>
        <Button color="secondary" onClick={updateConfig}>
        Submit
        </Button>
    </DialogActions>
    </Dialog>
    
    </Container>
  );
}
