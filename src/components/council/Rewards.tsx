import React, { useEffect, useState } from 'react';
import { JsonRpc } from 'eosjs';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  Grid,
  Modal,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from '@mui/material';
import { FaFileAlt, FaPauseCircle, FaPlayCircle, FaWallet, FaChartPie, FaKey, FaCog } from 'react-icons/fa';
import { IoCloseSharp } from 'react-icons/io5';

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

type ChildProps = {
  setFundForm: (value: boolean) => void;
  activeSession: any;
  connectWallet: () => void;
  setSnackbar: any;
};

const CouncilActions = ({ setFundForm, activeSession, connectWallet, setSnackbar }: ChildProps) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [value, setValue] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [configModal, setConfigModal] = useState(false);
  const [proposalId, setProposalId] = useState<number>();
  const [wallet, setWallet] = useState("");
  const [share, setShare] = useState<number>();
  const [tokenContract, setTokenContract] = useState("");

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const fetchProposals = async () => {
      try {
      const rpc = new JsonRpc('https://tn1.protonnz.com');
      const result = await rpc.get_table_rows({
          json: true,
          code: 'snipvote',
          scope: 'snipvote',
          table: 'fundprops',
          limit: 100,
      });
        setProposals(result.rows);
      } catch (error) {
      console.error('Failed to fetch election:', error);
      }
  };

  useEffect(() => {
     fetchProposals();
  }, []);

  const openProposals = proposals.filter((proposal) => (proposal.status === 'open' || proposal.status === 'paused'));
  const pastProposals = proposals.filter((proposal) => proposal.status !== 'open');
  const fundAllocation = proposals.filter((proposal) => proposal.status === 'approved');

  const submitConfig = async () => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: 'error',
        open: true,
      });
      connectWallet();
      return;
    }

    try {
      const action = {
        account: 'snipvote',
        name: 'updtfundcfg',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          admin: activeSession.auth.actor.toString(),
          communityWallet: wallet,
          maxSharePercent: share,
          tokenContract: tokenContract
        },
      };

      await activeSession.transact(
        {
          actions: [action],
        },
        {
          broadcast: true,
        }
      );
      setConfigModal(false);
      setSnackbar({
        message: 'Successfully updated the configuration!',
        severity: 'success',
        open: true,
      });
    } catch (error) {
      console.error('Error updating configuration:', error);
    }
  }

  const grantPermission = async () => {
  if (!activeSession) {
    setSnackbar({
      message: 'Please connect wallet first',
      severity: 'error',
      open: true,
    });
    connectWallet();
    return;
  }

  const actor = activeSession.auth.actor.toString();
  const permission = activeSession.auth.permission.toString();

  let pubKey: string | undefined;

  try {
    const response = await fetch("https://testnet.protonchain.com/v1/chain/get_account", {
      method: "POST",
      body: JSON.stringify({ account_name: actor }),
    });
    const accountData = await response.json();

    const activePermission = accountData.permissions.find((p: any) => p.perm_name === "active");
    pubKey = activePermission?.required_auth?.keys?.[0]?.key;

    if (!pubKey) {
      setSnackbar({
        message: "❌ Could not find active public key.",
        severity: 'error',
        open: true,
      });
      return;
    }

  } catch (error) {
    console.error("Error fetching public key:", error);
    setSnackbar({
      message: "❌ Failed to fetch public key.",
      severity: 'error',
      open: true,
    });
    return;
  }

  try {
    await activeSession.transact(
      {
        actions: [
          {
            account: 'eosio',
            name: 'updateauth',
            authorization: [
              {
                actor: actor,
                permission: permission,
              },
            ],
            data: {
              account: actor,
              permission: 'fund',
              parent: 'active',
              auth: {
                threshold: 1,
                keys: [
                  {
                    key: pubKey,
                    weight: 1,
                  }
                ],
                accounts: [
                  {
                    permission: {
                      actor: 'snipvote',
                      permission: 'eosio.code',
                    },
                    weight: 1,
                  },
                ],
                waits: [],
              },
            },
          },
          {
            account: 'eosio',
            name: 'linkauth',
            authorization: [
              {
                actor: actor,
                permission: permission,
              },
            ],
            data: {
              account: actor,
              code: 'snipx',
              type: 'transfer', 
              requirement: 'fund',
            },
          },
        ],
      },
      { broadcast: true }
    );

    setSnackbar({
      message: '✅ Permission granted and linked to transfer!',
      severity: 'success',
      open: true,
    });
  } catch (error) {
    console.error('Failed to grant permission:', error);
    setSnackbar({
      message: 'Failed to grant permission.',
      severity: 'error',
      open: true,
    });
  }
  };

  const voteProposal = async (vote: string) => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: 'error',
        open: true,
      });
      connectWallet();
      return;
    }

    try {
      const action = {
        account: 'snipvote',
        name: 'votefprop',
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
      setOpenModal(false);
      setSnackbar({
        message: 'Successfully voted on this proposal!',
        severity: 'success',
        open: true,
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const handleStatus = async (proposalId: number, status: string) => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: 'error',
        open: true,
      });
      connectWallet();
      return;
    }

    try {
      const action = {
        account: 'snipvote',
        name: 'setfstatus',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          actor: activeSession.auth.actor.toString(),
          proposalId: proposalId,
          newStatus: status,
        },
      };

      await activeSession.transact(
        {
          actions: [action],
        },
        {
          broadcast: true,
        }
      );
      setOpenModal(false);
      setSnackbar({
        message: `Successfully ${status ==='open' ? "resumed" : "paused"} fund distribution!`,
        severity: 'success',
        open: true,
      });
    } catch (error) {
      console.error(`Error ${status ==='open' ? "resuming" : "pausing"} fund distribution:`, error);
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        <FaWallet style={{ marginRight: 8 }} /> Community Rewards Wallet Allocation
      </Typography>

      {/* Council Member Actions */}
      <Box sx={{ my: 2, display: 'flex', gap: 2 }}>
        <Button  onClick={() => setFundForm(true)} variant="outlined" startIcon={<FaFileAlt />}>
          Propose
        </Button>
        <Button variant="outlined" color="warning" startIcon={<FaCog />} onClick={() => setConfigModal(true)}>
          Update Config
        </Button>
        <Button onClick={grantPermission} variant="outlined" color="success" startIcon={<FaKey />}>
          Grant Permission
        </Button>
      </Box>

      {/* Tabs for Proposals */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={value} onChange={handleChange} aria-label="proposal tabs">
          <Tab label="Open Proposals" />
          <Tab label="Past Proposals" />
        </Tabs>
      </Box>

      {/* Open Proposals Tab Content */}
      {value === 0 && (
        <Card>
          <CardContent>
            { openProposals.length === 0 ? (
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
                  No active proposals.
                </Typography>
                </Box>
              </Grid>
            ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="open proposals table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Proposer</TableCell>
                    <TableCell>Recipient</TableCell>
                    <TableCell>Amount(SNIPX)</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Approved</TableCell>
                    <TableCell>Rejected</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Control</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {openProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell component="th" scope="row">
                        {proposal.id}
                      </TableCell>
                      <TableCell>{proposal.proposer}</TableCell>
                      <TableCell>{proposal.recipient}</TableCell>
                      <TableCell>{(parseFloat(proposal.amount) / 10000).toFixed(4)}
                      </TableCell>
                      <TableCell>{proposal.category}</TableCell>
                      <TableCell>
                        {proposal.approvedBy}
                      </TableCell>
                      <TableCell>
                        {proposal.rejectedBy}
                      </TableCell>
                      <TableCell>
                        <Button variant="contained" disabled={proposal.status === "paused"} color="primary" size="small" onClick={() => {
                            setOpenModal(true);
                            setProposalId(proposal.id);
                          }
                        }>
                          Vote
                        </Button>
                      </TableCell>
                      <TableCell>
                        {
                         proposal.status === "open" &&
                        <Button variant="outlined" startIcon={<FaPauseCircle />}onClick={() => handleStatus(proposal.id, "paused")}>
                          Pause
                        </Button>
                        }
                        {
                         proposal.status === "paused" &&
                        <Button variant="outlined" color="success" startIcon={<FaPlayCircle />} onClick={() => handleStatus(proposal.id, "open")}>
                          Resume
                        </Button>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Past Proposals Tab Content */}
      {value === 1 && (
        <Card>
          <CardContent>
            {pastProposals.length === 0 ? (
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
                  No past proposals recorded.
                </Typography>
                </Box>
              </Grid>
            ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="past proposals table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Proposer</TableCell>
                    <TableCell>Recipient</TableCell>
                    <TableCell>Amount(SNIPX)</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Approved</TableCell>
                    <TableCell>Rejected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pastProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell component="th" scope="row">
                        {proposal.id}
                      </TableCell>
                      <TableCell>{proposal.proposer}</TableCell>
                      <TableCell>{proposal.recipient}</TableCell>
                      <TableCell>{(parseFloat(proposal.amount) / 10000).toFixed(4)}
                      </TableCell>
                      <TableCell>{proposal.category}</TableCell>
                      <TableCell>
                        {proposal.status === 'approved' && (
                          <Chip label={proposal.status} color="success" size="small" />
                        )}
                        {proposal.status === 'rejected' && (
                          <Chip label={proposal.status} color="error" size="small" />
                        )}
                        {proposal.status === 'executed' && (
                          <Chip label={proposal.status} color="info" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {proposal.approvedBy}
                      </TableCell>
                      <TableCell>{proposal.rejectedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fund Distribution History */}
      {
      fundAllocation.length > 0 &&
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FaChartPie style={{ marginRight: 8 }} /> Fund Distribution History
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="allocation history table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount(SNIPX)</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fundAllocation.map((allocation, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {allocation.id}
                    </TableCell>
                    <TableCell>
                      {allocation.category}
                    </TableCell>
                    <TableCell>{(parseFloat(allocation.amount) / 10000).toFixed(4)}
                    </TableCell>
                    <TableCell>{new Date(allocation.approvedAt * 1000).toISOString().split('T')[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      }

      {/* Vote modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="vote-modal-title"
        aria-describedby="vote-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
           <Typography id="vote-modal-title" variant="h6" component="h2">
             Cast Your Vote
           </Typography>
           <IconButton aria-label="close" onClick={() => setOpenModal(false)} size="small">
              <IoCloseSharp />
            </IconButton>
          </Box>
          <Typography id="vote-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to approve or reject this proposal?
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'end', gap: 2 }}>
            <Button variant="contained" color="success" onClick={() => voteProposal('approve')}>
              Approve
            </Button>
            <Button variant="contained" color="error" onClick={() => voteProposal('reject')}>
              Reject
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Config modal */}
      <Dialog open={configModal} onClose={() => setConfigModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Update Fund Configuration</DialogTitle>
                    
        <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            autoFocus
            margin="dense"
            label="Community Wallet Account"
            fullWidth
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
      
          <TextField
            margin="dense"
            label="Token Allocation Limit (%)"
            fullWidth
            value={share}
            type='number'
            onChange={(e) => setShare(Number(e.target.value))}
          />
      
          <TextField
            margin="dense"
            label="Token Contract Account"
            fullWidth
            value={tokenContract}
            onChange={(e) => setTokenContract(e.target.value)}
          /> 
        </Stack>
        </DialogContent>
            
        <DialogActions>
          <Button onClick={() => setConfigModal(false)}>Cancel</Button>
          <Button color="secondary" onClick={submitConfig}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default CouncilActions;