"use client"
import React, { useState, useEffect, useContext } from 'react';
import { JsonRpc } from 'eosjs';
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Button,
  Box,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import {
  FaUsersCog,
  FaCaretRight,
} from 'react-icons/fa';
import { MdGavel } from 'react-icons/md';

import { getUser } from "@/utilities/fetch";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { AuthContext } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";
import EmptyState from '@/components/dashboard/EmptyState';

const ModeratorPage = () => {
  const [moderators, setModerators] = useState<any>([]);
  const [members, setMembers] = useState<any>([]);
  const [showRecallForm, setShowRecallForm] = useState(false);
  const [recalledMod, setRecalledMod] = useState("");
  const [reason, setReason] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });
  
  const { activeSession, connectWallet } = useWallet();

  const { token } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    fetchModerators();
    fetchMembers();
  }, []);
  
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

  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;
  
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

      const userFetchPromises = result.rows.map(async (moderator) => {
        try {
          const userData = await getCachedUser(moderator.userName);
          return { ...moderator, photoUrl: userData.photoUrl };
        } catch (error) {
          console.error(`Failed to fetch user data for ${moderator.userName}:`, error);
          return { ...moderator, photoUrl: null };
        }
      });
        
      const modWithPhotos = await Promise.all(userFetchPromises);
      setModerators(modWithPhotos);
    } catch (error) {
      console.error('Failed to fetch moderator:', error);
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
  
  const isMember =
  !!activeSession?.auth?.actor?.toString() &&
  Array.isArray(members) &&
  members.some(
    (member: any) =>
      member?.account === activeSession.auth.actor.toString()
  );

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
        name: 'modapply',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          account: activeSession.auth.actor.toString(),
          userName: token?.username
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
        message: 'Successfully applied as moderator!',
        severity: "success",
        open: true,
      });
    } catch (error: any) {
      console.error('Failed to create recall election:', error);
    }
  };

  const handleModRecall = async () => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: "error",
        open: true,
      });
      connectWallet();
      return;
    }

    if (!recalledMod) {
      return;
    }
    if (!reason.trim()) {
      setSnackbar({
        message: 'Please choose a reason to recall moderator.',
        severity: "error",
        open: true,
      });
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: 'modrecall',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          moderator: recalledMod,
          reason: reason,
          signer: activeSession.auth.actor.toString(),
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

      setShowRecallForm(false);
      setSnackbar({
        message: 'Recall election created successfully!',
        severity: "success",
        open: true,
      });
    } catch (error: any) {
      console.error('Failed to create recall election:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
       <Typography variant="h4" gutterBottom>
        <FaUsersCog style={{ marginRight: 8 }} /> Snipverse Moderators
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Meet the Snipverse Moderators — Learn about their roles and how they contribute to shaping our decentralized community.
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        onClick={handleApply}
        sx={{
          textTransform: 'none',
          fontWeight: 'bold',
          px: 3,
          py: 1.5,
          my: 3,
          borderRadius: 2,
          boxShadow: 3,
          fontSize: '16px',
          color: "#FFFFFF",
          backgroundColor: '#673ab7',
          '&:hover': {
            backgroundColor: '#5e35b1',
          },
        }}
      >
        🧑‍⚖️ Apply as Moderator
      </Button>


      {
      moderators?.length > 0 ?
      <>
      <Typography variant="h6" gutterBottom>
        Moderator Overview
      </Typography>
      <Paper sx={{ mb: 2, p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Approval</TableCell>
                <TableCell>Profile</TableCell>
                {isMember &&
                <TableCell>Recall</TableCell>
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {moderators?.slice().sort((a: any, b: any) => a.rank - b.rank).map((moderator: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={moderator.photoUrl && getFullURL(moderator.photoUrl)} />
                      {moderator.account}
                    </Box>
                  </TableCell>
                  <TableCell>
                  {new Date(moderator.approvedAt * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" startIcon={<FaCaretRight />} onClick={() => router.push(`/dao/moderators/${moderator.account}`)}>
                      Visit
                    </Button>
                    </TableCell>
                    {
                    isMember &&
                    <TableCell>
                      <Button size="small" color="error" startIcon={<MdGavel />} 
                      onClick={() => {
                        setShowRecallForm(true);
                        setRecalledMod(moderator.account);
                      }}
                      >
                        Initiate
                      </Button>
                  </TableCell>
                  }
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
       </Paper>
       </> : (
         <EmptyState message="No Active Moderators Available." />
       )
      }

      {snackbar.open && (
        <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
      )}

      {/* Create Election Dialog */}
      <Dialog open={showRecallForm} onClose={() => setShowRecallForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Initiate recall election for {recalledMod}</DialogTitle>
              
        <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            autoFocus
            margin="dense"
            label="Member"
            fullWidth
            value={recalledMod}
            disabled
          />

          <TextField
            margin="dense"
            label="Reason for recall"
            fullWidth
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Stack>
        </DialogContent>
      
        <DialogActions>
          <Button onClick={() => setShowRecallForm(false)}>Cancel</Button>
          <Button color="secondary" onClick={handleModRecall}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>



    </Container>
  )
}

export default ModeratorPage
