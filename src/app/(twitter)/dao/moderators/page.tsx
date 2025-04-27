"use client"
import React, { useState, useEffect, useContext } from 'react';
import { JsonRpc } from 'eosjs';
import ProtonWebSDK, { Link, ProtonWebLink } from '@proton/web-sdk';
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
  Tabs,
  Tab,
  Box,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  FaUserCircle,
  FaChartPie,
  FaFileAlt,
  FaUsersCog,
  FaFlag,
  FaWallet,
  FaRegBell,
  FaCaretRight,
} from 'react-icons/fa';
import { MdGavel, MdPersonAdd, MdPersonRemove } from 'react-icons/md';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { getUser } from "@/utilities/fetch";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { AuthContext } from "@/context/AuthContext";

const ModeratorPage = () => {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [activeLink, setActiveLink] = useState<Link | ProtonWebLink>();
  const [moderators, setModerators] = useState<any>([]);
  const [showRecallForm, setShowRecallForm] = useState(false);
  const [recalledMod, setRecalledMod] = useState("");
  const [reason, setReason] = useState("");

  const permission =
    activeSession?.auth?.actor?.toString() === "snipvote" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul1";

  const { token } = useContext(AuthContext);
  const now = Math.floor(Date.now() / 1000);

  useEffect(() => {
    const restore = async () => {
      try {
        const { link, session } = await ProtonWebSDK({
          linkOptions: {
            chainId: '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd',
            endpoints: ['https://tn1.protonnz.com'],
            restoreSession: true,
          },
          transportOptions: {
            requestAccount: 'snipvote',
          },
          selectorOptions: {
            appName: 'Snipverse',
          },
        });
      
        if (session && link) {
          setActiveSession(session);
          setActiveLink(link);
        } else {
          console.log('ℹ️ No session found or session invalid.');
        }
      } catch (error) {
        console.error('❌ Error during session restoration:', error);
      }
    };
      
    restore();
    // fetchElections();
    // fetchRecallElections();
    fetchModerators();
  }, []);
    
  const connectWallet = async () => {
    try {
      const { link, session } = await ProtonWebSDK({
        linkOptions: {
          endpoints: ["https://tn1.protonnz.com"],
          chainId: "71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd",
          restoreSession: false,
        },
        transportOptions: {
          requestAccount: "snipvote",
        },
        selectorOptions: {
          appName: "Snipverse",
        },
      });
    
      if (session) {
        setActiveSession(session);
        setActiveLink(link);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

//   const fetchElections = async () => {
//     try {
//       const rpc = new JsonRpc('https://tn1.protonnz.com');
//       const result = await rpc.get_table_rows({
//         json: true,
//         code: 'snipvote',
//         scope: 'snipvote',
//         table: 'elections',
//         limit: 100,
//       });
//       const filteredElection = result.rows.filter((e) => (e.endTime < epochSeconds && e.status === "ongoing"));
//       setSelectedElection(filteredElection[0]);
//     } catch (error) {
//       console.error('Failed to fetch election:', error);
//     }
//   };

//   const fetchRecallElections = async () => {
//     try {
//       const rpc = new JsonRpc('https://tn1.protonnz.com');
//       const result = await rpc.get_table_rows({
//         json: true,
//         code: 'snipvote',
//         scope: 'snipvote',
//         table: 'recallvotes',
//         limit: 100,
//       });
//       console.log('Recall elections data:', result.rows);
//       const filteredRecall = result.rows.filter((e) => (e.endTime < epochSeconds && e.status === "ongoing"));
//       setRecallData(filteredRecall[0]);
//     } catch (error) {
//       console.error('Failed to fetch elections:', error);
//     }
//   };
  
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
  
  const fetchModerators = async () => {
    try {
      const rpc = new JsonRpc('https://tn1.protonnz.com');
      const result = await rpc.get_table_rows({
        json: true,
        code: 'snipvote',
        scope: 'snipvote',
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

  const handleApply = async () => {
    if (!activeSession) {
      alert('Please connect wallet first');
      connectWallet();
      return;
    }

    try {
      const action = {
        account: 'snipvote',
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

      console.log('Successfully applied as moderator:', result);
      alert('Successfully applied as moderator!');
    } catch (error: any) {
      console.error('Failed to create recall election:', error);
    }
  };

  const handleModRecall = async () => {
    if (!activeSession) {
      alert('Please connect wallet first');
      connectWallet();
      return;
    }

    if (!recalledMod) {
      return;
    }
    if (!reason.trim()) {
      alert('Please choose a reason to recall moderator.');
      return;
    }

    try {
      const action = {
        account: 'snipvote',
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

      console.log('Recall election created successfully:', result);
      alert('Recall election created successfully!');
      setShowRecallForm(false);
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
        {/* Explore the Snipverse Moderators section to learn about our elected moderators and their roles. Stay informed about their contributions to our decentralized community. */}
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
      moderators?.length > 0 &&
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
                {permission &&
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
                    <Button size="small" variant="outlined" startIcon={<FaCaretRight />}>
                      Visit
                    </Button>
                    </TableCell>
                    {
                    permission &&
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
       </>
      }



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
