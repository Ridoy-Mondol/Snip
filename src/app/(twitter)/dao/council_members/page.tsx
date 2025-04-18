"use client"
import React, { useState, useEffect } from 'react';
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

const CouncilMembersPage = () => {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [activeLink, setActiveLink] = useState<Link | ProtonWebLink>();
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [members, setMembers] = useState<any>([]);
  const [epochSeconds, setEpochSeconds] = useState(0);
  const [showRecallForm, setShowRecallForm] = useState(false);
  const [recalledMember, setRecalledMember] = useState("");
  const [recalledElection, setRecalledElection] = useState("");
  const [reason, setReason] = useState("");
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  const permission =
    activeSession?.auth?.actor?.toString() === "snipvote" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul1";

  useEffect(() => {
    const now = new Date();
    const epochMilliseconds = now.getTime();
    const epochInSeconds = Math.floor(epochMilliseconds / 1000);
    setEpochSeconds(epochInSeconds);
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
    fetchElections();
    fetchWinners();
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

  const fetchElections = async () => {
    try {
      const rpc = new JsonRpc('https://tn1.protonnz.com');
      const result = await rpc.get_table_rows({
        json: true,
        code: 'snipvote',
        scope: 'snipvote',
        table: 'elections',
        limit: 100,
      });
      const filteredElection = result.rows.filter((e) => (e.endTime >= epochSeconds && e.status === "ongoing"));
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
  
  const fetchWinners = async () => {
    try {
      const rpc = new JsonRpc('https://tn1.protonnz.com');
      const result = await rpc.get_table_rows({
        json: true,
        code: 'snipvote',
        scope: 'snipvote',
        table: 'winners',
        limit: 100,
      });
      const currentMember = result.rows.filter((m) => (m.status === "active"));

      const userFetchPromises = currentMember.map(async (member) => {
        try {
          const userData = await getCachedUser(member.userName);
          return { ...member, photoUrl: userData.photoUrl };
        } catch (error) {
          console.error(`Failed to fetch user data for ${member.userName}:`, error);
          return { ...member, photoUrl: null };
        }
      });
        
      const membersWithPhotos = await Promise.all(userFetchPromises);
      setMembers(membersWithPhotos);

    } catch (error) {
      console.error('Failed to fetch election:', error);
    }
  };

  console.log(members);

  const declareMembers = async () => {
    if (!activeSession) {
      connectWallet();
      return;
    }

    try {
      const action = {
        account: 'snipvote',
        name: 'winner',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          electionName: selectedElection.electionName,
          signer: activeSession.auth.actor.toString()
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
    } catch (error: any) {
      console.error('Winner declaration failed:', error);
    }
  };



  const handleRecall = async () => {
    if (!activeSession) {
      alert('Please connect wallet first');
      connectWallet();
      return;
    }

    if (!recalledMember || !recalledElection) {
      return;
    }
    if (!reason.trim()) {
      alert('Please choose a reason to recall member.');
      return;
    }
    if (!newStartTime.trim()) {
      alert('Voting Start Time cannot be empty.');
      return;
    }
    if (!newEndTime.trim()) {
      alert('Voting End Time cannot be empty.');
      return;
    }

    try {
      const startUTC = new Date(newStartTime);
      const endUTC = new Date(newEndTime);

      const startTimeSec = Math.floor(startUTC.getTime() / 1000);
      const endTimeSec = Math.floor(endUTC.getTime() / 1000);

      const action = {
        account: 'snipvote',
        name: 'createrecall',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          councilMember: recalledMember,
          electionName: recalledElection,
          reason: reason,
          startTime: startTimeSec,
          endTime: endTimeSec,
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

      console.log('Election created successfully:', result);
      alert('Recall election created successfully!');
      setShowRecallForm(false);
    } catch (error: any) {
      console.error('Failed to create recall election:', error);
    }
  };



  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
       <Typography variant="h4" gutterBottom>
        <FaUsersCog style={{ marginRight: 8 }} /> Snipverse Council Members
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Explore the Snipverse Council Members section to learn about our elected leaders and their roles. Stay informed about their contributions to our decentralized community.
      </Typography>

      {
        (permission && selectedElection) && <Button onClick={declareMembers}>Declare Members</Button>
      }

      {
      members?.length > 0 &&
      <>
      <Typography variant="h6" gutterBottom>
        Council Overview
      </Typography>
      <Paper sx={{ mb: 2, p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Profile</TableCell>
                {permission &&
                <TableCell>Recall</TableCell>
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {members?.slice().sort((a: any, b: any) => a.rank - b.rank).map((member: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={member.photoUrl && getFullURL(member.photoUrl)} />
                      {member.winner}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {member.isFoundingMember ? "Founder" : "Elected"}
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
                        setRecalledMember(member.winner);
                        setRecalledElection(member.electionName)
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
        <DialogTitle>Initiate recall election for {recalledMember}</DialogTitle>
              
        <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            autoFocus
            margin="dense"
            label="Member"
            fullWidth
            value={recalledMember}
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
      
          <LocalizationProvider dateAdapter={AdapterDateFns}>
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
        </Stack>
        </DialogContent>
      
        <DialogActions>
          <Button onClick={() => setShowRecallForm(false)}>Cancel</Button>
          <Button color="secondary" onClick={handleRecall}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>



    </Container>
  )
}

export default CouncilMembersPage
