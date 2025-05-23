"use client"
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from "next/navigation";
import { JsonRpc } from 'eosjs';
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
  Divider,
  useTheme,
  RadioGroup, FormControlLabel, Radio, Chip, FormControl, InputLabel, MenuItem, Select
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
import { FiAlertTriangle } from 'react-icons/fi';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineWarning, AiOutlineEye, AiOutlineSend } from 'react-icons/ai';
import { MdGavel, MdPersonAdd, MdPersonRemove } from 'react-icons/md';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { getUser } from "@/utilities/fetch";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { AuthContext } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import Rewards from "@/components/council/Rewards";
import RevenueForm from "@/components/form/Revenue";


function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CouncilMembersPage = () => {
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [recallData, setRecallData] = useState<any>(null);
  const [members, setMembers] = useState<any>([]);
  const [moderators, setModerators] = useState<any>([]);
  const [applications, setApplications] = useState<any>([]);
  const [showRecallForm, setShowRecallForm] = useState(false);
  const [recalledMember, setRecalledMember] = useState("");
  const [recalledMod, setRecalledMod] = useState("");
  const [recalledElection, setRecalledElection] = useState("");
  const [activeModRecall, setActiveModRecall] = useState<any>([]);
  const [pastModRecall, setPastModRecall] = useState<any>([]);
  const [vote, setVote] = useState<{ [recallId: number]: string }>({});
  const [reason, setReason] = useState("");
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [modManagementTab, setModManagementTab] = useState(0);
  const [recallTab, setRecallTab] = useState(0);
  const [activeReports, setActiveReports] = useState<any>([]);
  const [reportVote, setReportVote] = useState<Record<string, "restore" | "delete">>({});
  const [wallet, setWallet] = useState("");
  const [fundForm, setFundForm] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState<number>();
  const [memo, setMemo] = useState("");
  const [category, setCategory] = useState("");
  const [revenueForm, setRevenueForm] = useState(false);

  const { activeSession, connectWallet } = useWallet();

  const permission =
    activeSession?.auth?.actor?.toString() === "snipvote" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul5" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul2";
  
  const router = useRouter();
  const now = Math.floor(Date.now() / 1000);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchElections();
    fetchRecallElections();
    fetchWinners();
    fetchModerators();
    fetchModApplication();
    fetchModRecalls();
  }, [])

  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;
  const tokenAcc = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ACC!;

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
      const filteredElection = result.rows.filter((e) => (e.endTime < now && e.status === "ongoing"));
      setSelectedElection(filteredElection[0]);
    } catch (error) {
      console.error('Failed to fetch election:', error);
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
      const filteredRecall = result.rows.filter((e) => (e.endTime < now && e.status === "ongoing"));
      setRecallData(filteredRecall[0]);
    } catch (error) {
      console.error('Failed to fetch elections:', error);
    }
  };

  const fetchModRecalls = async () => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'modrecall',
        limit: 100,
      });  

      const userFetchPromises = result.rows.map(async (m) => {
        try {
          const userData = await getCachedUser(m.userId
          );
          return { ...m, photoUrl: userData.photoUrl };
        } catch (error) {
          console.error(`Failed to fetch user data for ${m.userName}:`, error);
          return { ...m, photoUrl: null };
        }
      });
        
      const membersWithPhotos = await Promise.all(userFetchPromises);
      const activeRecall = membersWithPhotos.filter((e) => (e.status === "pending"));
      const pastRecall = membersWithPhotos.filter((e) => (e.status !== "pending"));
      setActiveModRecall(activeRecall);
      setPastModRecall(pastRecall);
    } catch (error) {
      console.error('Failed to fetch elections:', error);
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
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
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
      console.error('Failed to fetch member:', error);
    }
  };

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
        
      const moderatorsWithPhotos = await Promise.all(userFetchPromises);
      setModerators(moderatorsWithPhotos);
    } catch (error) {
      console.error('Failed to fetch moderators:', error);
    }
  };

  const fetchModApplication = async () => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'modcandidate',
        limit: 100,
      });  

      const filteredApplication = result.rows.filter((m) => (m.status === "pending"));

      const userFetchPromises = filteredApplication.map(async (applicant) => {
        try {
          const userData = await getCachedUser(applicant.userName);
          return { ...applicant, photoUrl: userData.photoUrl };
        } catch (error) {
          console.error(`Failed to fetch user data for ${applicant.userName}:`, error);
          return { ...applicant, photoUrl: null };
        }
      });
        
      const applicantsWithPhotos = await Promise.all(userFetchPromises);
      setApplications(applicantsWithPhotos);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const fetchAppeal = async (postId: string) => {
    try {
      const res = await fetch(`/api/appeal/get?postId=${postId}`);
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch appeal.");
      }
  
      return data.data; // { tweetId, reason }
    } catch (error) {
      console.error("Error fetching appeal:", error);
      return null;
    }
  };
  
  const fetchAndFilterReports = async () => {
    if (!token || !token.id) {
      return;
    }
    try {
      const rpc = new JsonRpc(endpoint);
  
      // Fetch report votes
      const reportVotesRes = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'reportvotes',
        limit: 100,
      });
  
      const reportVotes = reportVotesRes.rows;
  
      // Create a Set of postIds where status is 'voting'
      const votingPostIds = new Map(
        reportVotes.filter(vote => vote.status === 'voting').map(vote => [vote.postId, vote])
      );
  
      // Fetch reports
      const reportsRes = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'modreports',
        limit: 100,
      });
  
      const reports = reportsRes.rows;
  
      // Filter reports where postId is in votingPostIds
      const filteredReports = reports.filter(report => votingPostIds.has(report.postId));

      // Ensure hiddenPosts is already fetched
      const res = await fetch("/api/tweets/status/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          userId: token.id,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch hidden posts");
      const { hiddenPosts } = await res.json();

      const hiddenPostsMap = new Map(hiddenPosts.map((post: any) => [post.id, post]));

      // For each filtered report, fetch appeal and add reason if available
      const reportsWithDetails = await Promise.all(
      filteredReports.map(async (report) => {
          const appeal = await fetchAppeal(report.postId);
          const voteData = votingPostIds.get(report.postId);
          const matchedPost = hiddenPostsMap.get(report.postId) as any;
          return {
            ...report,
           appeal: appeal?.reason || null,
           deletionVotes: voteData?.deletionVotes ?? 0,
           restorationVotes: voteData?.restorationVotes ?? 0,
           authorUsername: matchedPost?.author?.username || null,
          };
        })
      );

      console.log('Reports with Appeal Reasons:', reportsWithDetails);
      setActiveReports(reportsWithDetails);
      return reportsWithDetails;
  
    } catch (error) {
      console.error('Failed to fetch or filter reports:', error);
    }
  };

  useEffect(() => {
    fetchAndFilterReports();
  }, [token, token?.id])


  const isMember =
  !!activeSession?.auth?.actor?.toString() &&
  Array.isArray(members) &&
  members.some(
    (member: any) =>
      member?.winner === activeSession.auth.actor.toString() &&
      member?.status === "active"
  );

  const declareMembers = async () => {
    if (!activeSession) {
      connectWallet();
      return;
    }

    try {
      const action = {
        account: contractAcc,
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

  const declareRecall = async () => {
    if (!activeSession) {
      connectWallet();
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: 'recallresult',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          electionName: recallData.electionName,
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
      console.error('Recall declaration failed:', error);
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
        account: contractAcc,
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

      console.log('Recall election created successfully:', result);
      alert('Recall election created successfully!');
      setShowRecallForm(false);
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

      console.log('Recall election created successfully:', result);
      alert('Recall election created successfully!');
      setShowRecallForm(false);
    } catch (error: any) {
      console.error('Failed to create recall election:', error);
    }
  };

  const handleModVote = async (candidate: string, vote: string) => {
    if (!activeSession) {
      alert('Please connect wallet first');
      connectWallet();
      return;
    }

    if (!candidate || !vote) {
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: 'modvote',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          voter: activeSession.auth.actor.toString(),
          candidate: candidate,
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

      console.log('Moderator voted successfully:', result);
      alert('Moderator voted successfully!');
    } catch (error: any) {
      console.error('Failed to vote moderator application:', error);
    }
  };


  const handleCastVote = async (recallId: number) => {
    const selectedVote = vote[recallId];
    if (!activeSession) {
      // setSnackbar({
      //   message: 'Please connect wallet first',
      //   severity: "error",
      //   open: true,
      // });
      connectWallet();
      return;
    }

    if (!vote) {
      // setSnackbar({
      //   message: 'Please choose a option',
      //   severity: "error",
      //   open: true,
      // });
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: 'modrecalvote',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          voter: activeSession.auth.actor.toString(),
          recallId: recallId,
          vote: selectedVote,
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
      alert('Recall vote successfull for this moderator!');
    } catch (error: any) {
      console.error('Vote failed:', error);
    }
  }

  const handleReportVote = async (postId: string, username: string) => {
    const selectedVote = reportVote[postId];
    if (!activeSession) {
      connectWallet();
      return;
    }

    if (!reportVote) {
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: 'reportvote',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          voter: activeSession.auth.actor.toString(),
          postId: postId,
          decision: selectedVote,
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
      alert('Vote successfull on this report!');
      await fetchReportVotes(postId, username);
    } catch (error: any) {
      console.error('Vote failed:', error);
    }
  }

  const fetchReportVotes = async (postId: string, username: string) => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: 'snipvote',
        scope: 'snipvote',
        table: 'reportvotes',
        limit: 100,
      });
  
      const filteredVotes = await result?.rows?.filter((r) => r.postId === postId);
          
      if (filteredVotes[0].restorationVotes >= 4) {
        await updatePostStatus (postId, 'published', username);
      } else if ( filteredVotes[0].deletionVotes >= 4 ) {
        await updatePostStatus (postId, 'deleted', username);
      }
        
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const updatePostStatus = async (postId: string, status: string, username: string) => {
    try {
      const res = await fetch('/api/tweets/status/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, status, username }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update post');
      }
  
      console.log('Post successfully updated');
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  }

  const fetchWallet = async () => {
    try {
    const rpc = new JsonRpc(endpoint);
    const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'fundconfig',
    });
    
    const account = result?.rows?.[0]?.communityWallet;
    if (!account) return null;
    setWallet(account);
  
    } catch (error) {
    console.error('Failed to fetch community wallet:', error);
    }
  };
  
  useEffect (() => {
    fetchWallet();
  }, []);

  const fetchToken = async () => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: tokenAcc,
        scope: wallet,
        table: 'accounts',
      });
  
      console.log('token from table', result.rows);

      const balanceStr = result?.rows?.[0]?.balance;
      if (!balanceStr) return null;

      const [amountStr] = balanceStr.split(' ');
      const amount = parseFloat(amountStr);
      return amount;
        
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const submitProposal = async () => {
    const availablebalance = await fetchToken();
    if (!availablebalance) {
      alert('The community wallet has no balance.');
      return;
    }

    if (!activeSession) {
      connectWallet();
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: 'createfprop',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          proposer: activeSession.auth.actor.toString(),
          recipient: recipient,
          amount: Math.round(amount! * 10000),
          available: Math.round(availablebalance * 10000),
          memo: memo,
          category: category
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
      setFundForm(false);
      alert('Proposal submitted successfully!');
    } catch (error) {
      console.error('Error submitting proposal:', error);
    }
  };

  const theme = useTheme();

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
        (permission && recallData) && <Button onClick={declareRecall}>Declare Recall</Button>
      }

      {
        permission && <Button onClick={() => setRevenueForm(true)}>Share Revenue</Button>
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
                    <Button size="small" variant="outlined" startIcon={<FaCaretRight />} onClick={() => router.push(`/dao/council_members/${member.winner}`)}>
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
                        setRecalledMod("");
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

      {/* moderator management section */}
      {isMember &&
      <>
      <Typography variant="h6" gutterBottom>
        Moderator Management
      </Typography>
      <Paper sx={{ mb: 2, p: 2 }}>
              <Tabs 
              value={modManagementTab}
              onChange={(e, newVal) => setModManagementTab(newVal)} 
              aria-label="moderator management tabs"
              >
                <Tab label="Active Moderators" {...a11yProps(0)} />
                <Tab label="Pending Applications" {...a11yProps(1)} />
              </Tabs>
              <TabPanel value={modManagementTab} index={0}>
                { moderators.length > 0 &&
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Approval</TableCell>
                        <TableCell>Profile</TableCell>
                        <TableCell>Recall</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {moderators.map((moderator: any, index: number) => (
                        <TableRow key={moderator.account}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box display="flex"         alignItems="center" gap={1}>
                            <Avatar src={moderator.photoUrl && getFullURL(moderator.photoUrl)} />
                              {moderator.account}
                            </Box>
                          </TableCell>
                          <TableCell>{new Date(moderator.approvedAt * 1000).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" startIcon={<FaCaretRight />} onClick={() => router.push(`/dao/moderators/${moderator.account}`)}>
                              VISIT
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button size="small" color="error" startIcon={<MdGavel />}
                            onClick={() => {
                              setShowRecallForm(true);
                              setRecalledMod(moderator.account);
                              setRecalledMember("");
                            }} 
                            >
                              Initiate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                }
                {moderators.length === 0 && <Typography variant="body2">No active moderators. </Typography> }
              </TabPanel>
              <TabPanel value={modManagementTab} index={1}>
                {applications.length > 0 &&
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Profile</TableCell>
                        <TableCell>Approve</TableCell>
                        <TableCell>Reject</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.map((applicant: any, index: number) => (
                        <TableRow key={applicant.account}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box display="flex"         alignItems="center" gap={1}>
                            <Avatar src={applicant.photoUrl && getFullURL(applicant.photoUrl)} />
                              {applicant.account}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" startIcon={<FaCaretRight />}
                            onClick={() => router.push(`/${applicant.userName}`)}
                            >
                              Visit
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" color="success" startIcon={<MdPersonAdd />} sx={{ mr: 1 }}
                            onClick={() => handleModVote(applicant.account, "approve")}
                            >
                              Approve
                            </Button>
                            </TableCell>
                            <TableCell>
                            <Button size="small" variant="outlined" color="error"
                            onClick={() => handleModVote(applicant.account, "reject")}
                            >
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                }
                {applications.length === 0 && <Typography variant="body2">No pending moderator applications.</Typography>}
              </TabPanel>
            </Paper>
            </>
          }
      
      
    {/* Recall votes section */}
    {isMember &&
    <Box>
    <Typography variant="h6" gutterBottom>
      Moderator Recall Votes
    </Typography>
    {/* Tabs */}
    <Tabs value={recallTab} onChange={(e, newVal) => setRecallTab(newVal)} sx={{ mb: 3 }}>
      <Tab label="Active Recalls" />
      <Tab label="Past Recalls" />
    </Tabs>
    
    {/* Active Recalls */}
    {recallTab === 0 && (
      <Box>
        {activeModRecall?.map((elem: any, index: number) => (
          <Card key={index} sx={{ mb: 2, px: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  alt={elem.moderator}
                  src={getFullURL(elem.photoUrl)}
                  sx={{ width: 80, height: 80, mb: 1 }}
                />
                <Typography variant="h6" component="div" align="center">
                  {elem.moderator}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Reason:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {elem.reason}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, my: 1 }}>
                <Typography variant="body2" color="green">
                  ✅ Recall: {elem.yesVotes}
                </Typography>
                <Typography variant="body2" color="red">
                  ❌ Retained: {elem.noVotes}
                </Typography>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Do you want to recall {elem.moderator}?
              </Typography>

              <RadioGroup
                aria-label="recall-vote"
                name={`recallVote-${index}`}
                value={vote[elem.recallId] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setVote((prev) => ({ ...prev, [elem.recallId]: value }));
                }}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="yes"
                  control={
                    <Radio
                      icon={<AiOutlineCheckCircle size={20} />}
                      checkedIcon={<AiOutlineCheckCircle size={20} color="green" />}
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
                    />
                  }
                  label="No, Do Not Recall"
                />
              </RadioGroup>

              <Button variant="contained" color="primary" disabled={!vote[elem.recallId]} sx={{ width: '100%' }} onClick={() => handleCastVote(elem.recallId)}>
                Cast Recall Vote
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    )}

    {/* Past Recalls */}
    {recallTab === 1 && (
      <Paper sx={{ mb: 2, p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pastModRecall?.map((elem: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                <Box display="flex"         alignItems="center" gap={1}>
                  <Avatar
                    alt={elem.moderator}
                    src={getFullURL(elem.photoUrl)}
                    sx={{ width: 40, height: 40 }}
                  />
                  {elem.moderator}
                </Box>
                </TableCell>
                <TableCell>
                  {elem.status === "removed" ? 'Recalled' : 'Retained'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    )}
    </Box>
   }
    
    {/* Council Review Panel */}
    {isMember &&
    <>
    <Typography variant="h6" gutterBottom>
      Council Review Panel
    </Typography>
    {activeReports.map((elem: any) => (
    <Card
      key={elem.postId}
      sx={{
        mb: 3,
        boxShadow: '0px 5px 20px rgba(0,0,0,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent sx={{ padding: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2} justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.dark }}>
              <FiAlertTriangle size={22} />
            </Avatar>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
               Report Details
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<AiOutlineEye />}
            sx={{ fontWeight: 500, borderRadius: 1 }}
            onClick={() => {
              router.push(`${elem.authorUsername}/tweets/${elem.postId}`)
            }}
          >
            View Post
          </Button>
        </Stack>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          gutterBottom
          sx={{ fontWeight: 400, fontStyle: 'italic' }}
        >
          Reported by {elem.reportCount} moderator(s)
        </Typography>

        {elem.categories && elem.categories.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mr: 1 }}>
              Categories:
            </Typography>
            {elem.categories.map((cat: string, i: number) => (
              <Chip
                key={i}
                label={cat}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
        )}

        {elem.reasons && elem.reasons.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Reasons:
            </Typography>
            {elem.reasons.map((reason: string, i: number) => (
              <Typography variant="body2" color="text.secondary" key={i} sx={{ ml: 1, lineHeight: 1.5 }}>
                • {reason}
              </Typography>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2, opacity: 0.6 }} />
        
        {
        elem.appeal &&
        <>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
          User Appeal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb: 2 }}>
        {elem.appeal}
        </Typography>

        <Divider sx={{ my: 2, opacity: 0.6 }} />
        </>
        }

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.success.main }}>
            <AiOutlineCheckCircle size={20} style={{ marginRight: 6 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              Restore:
            </Typography>
            <Typography variant="body2" sx={{ ml: 0.5, color: theme.palette.text.secondary }}>
              ({elem.restorationVotes})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.error.main }}>
            <AiOutlineCloseCircle size={20} style={{ marginRight: 6 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              Delete:
            </Typography>
            <Typography variant="body2" sx={{ ml: 0.5, color: theme.palette.text.secondary }}>
              ({elem.deletionVotes})
            </Typography>
          </Box>
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 2, color: theme.palette.text.secondary }}>
          Your Action
        </Typography>

        <RadioGroup
          aria-label="post-vote"
          name={`postVote-${elem.postId}`}
          value={reportVote[elem.postId] || ''}
          onChange={(e) => {
            const value = e.target.value;
            setReportVote((prev) => ({ ...prev, [elem.postId]: value }));
          }}
          sx={{ mb: 2 }}
        >
          <FormControlLabel
            value="restore"
            control={<Radio icon={<AiOutlineCheckCircle size={20} />} checkedIcon={<AiOutlineCheckCircle size={20} color={theme.palette.success.main} />} />}
            label={<Typography sx={{ fontWeight: 400 }}>Restore</Typography>}
          />
          <FormControlLabel
            value="delete"
            control={<Radio icon={<AiOutlineCloseCircle size={20} />} checkedIcon={<AiOutlineCloseCircle size={20} color={theme.palette.error.main} />} />}
            label={<Typography sx={{ fontWeight: 400 }}>Delete</Typography>}
          />
        </RadioGroup>

        <Button
          variant="outlined"
          color="primary"
          disabled={!reportVote[elem.postId]}
          fullWidth
          onClick={() => handleReportVote(elem.postId, elem.authorUsername)}
          startIcon={<AiOutlineSend />}
          sx={{ fontWeight: 500, py: 1.2, borderRadius: 1 }}
        >
          Submit Vote
        </Button>
      </CardContent>
    </Card>
    ))}
    </>
   }


   {/* Rewards */}
   {
   isMember &&
   <Rewards 
     setFundForm={setFundForm} 
     activeSession= {activeSession}
     connectWallet={connectWallet} 
   />
   }



      {/* Create Election Dialog */}
      <Dialog open={showRecallForm} onClose={() => setShowRecallForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Initiate recall election for {recalledMember || recalledMod}</DialogTitle>
              
        <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            autoFocus
            margin="dense"
            label={recalledMember ? "Member" : "Moderator"}
            fullWidth
            value={recalledMember || recalledMod}
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
          
          {
          recalledMember &&
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
         }
        </Stack>
        </DialogContent>
      
        <DialogActions>
          <Button onClick={() => setShowRecallForm(false)}>Cancel</Button>
          <Button color="secondary" onClick={recalledMember ? handleRecall : handleModRecall}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>


      {/* Fund Prposal Dialog */}
      <Dialog open={fundForm} onClose={() => setFundForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Propose Fund Allocation</DialogTitle>
              
        <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            autoFocus
            margin="dense"
            label="Recipient Account"
            fullWidth
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          <TextField
            margin="dense"
            label="Amount"
            fullWidth
            value={amount}
            type='number'
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          <TextField
            margin="dense"
            label="Memo"
            fullWidth
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />

          <FormControl fullWidth margin="dense">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
              <MenuItem value="rewards">Rewards</MenuItem>
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="operations">Operations</MenuItem>
              </Select>
          </FormControl>
          
          
        </Stack>
        </DialogContent>
      
        <DialogActions>
          <Button onClick={() => setFundForm(false)}>Cancel</Button>
          <Button color="secondary" disabled={!recipient || !amount || !memo || !category} onClick={submitProposal}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revenue form */}
      <RevenueForm
        open={revenueForm}
        onClose={() => setRevenueForm(false)}
        activeSession= {activeSession}
        connectWallet={connectWallet}
        fetchToken={fetchToken}
      />





    </Container>
  )
}

export default CouncilMembersPage
