'use client';

import React, {useState, useEffect} from 'react';
import { JsonRpc } from 'eosjs';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { AiOutlineEye, AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineSend } from 'react-icons/ai';
import { FiAlertTriangle } from 'react-icons/fi';
import { MdGroups } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/dashboard/EmptyState';
import { useWallet } from "@/context/WalletContext";

interface Report {
  postId: string;
  authorUsername: string;
  reportCount: number;
  categories: string[];
  reasons: string[];
  appeal?: string;
  restorationVotes: number;
  deletionVotes: number;
}

const CouncilReviewPanel = ({token, setSnackbar}: any) => {
  const [activeReports, setActiveReports] = useState<Report[]>([]);
  const [reportVote, setReportVote] = useState<Record<string, "restore" | "delete">>({});

  const theme = useTheme();
  const router = useRouter();
  
  const { activeSession, connectWallet } = useWallet();
  
  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;
  
  const fetchAppeal = async (postId: string) => {
  try {
    const res = await fetch(`/api/appeal/get?postId=${postId}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch appeal.");
    }

    return data.data;
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

    const votingPostIds = new Map(
      reportVotes
        .filter(vote => vote.status === 'voting')
        .map(vote => [vote.postId, vote])
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

    const now = Date.now();
    const filteredReports = reports.filter(report => {
      const postAgeInMs = now - report.timestamp * 1000;
      return votingPostIds.has(report.postId) && postAgeInMs > 1 * 30 * 60 * 1000;
    });

    // Fetch hidden posts
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

    // Attach appeal, votes, author info to reports
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

    setActiveReports(reportsWithDetails);
    return reportsWithDetails;

  } catch (error) {
    console.error('Failed to fetch or filter reports:', error);
  }
  };

  useEffect(() => {
    fetchAndFilterReports();
  }, [token, token?.id]);

  const handleReportVote = async (postId: string, username: string) => {
  const selectedVote = reportVote[postId];

  if (!activeSession) {
    setSnackbar({
      message: 'Please connect wallet first',
      severity: 'error',
      open: true,
    });
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

    setSnackbar({
      message: 'Vote successfull on this report!',
      severity: 'success',
      open: true,
    });
    await fetchReportVotes(postId, username);
  } catch (error: any) {
    console.error('Vote failed:', error);
  }
  };

  const fetchReportVotes = async (postId: string, username: string) => {
  try {
    const rpc = new JsonRpc(endpoint);
    const result = await rpc.get_table_rows({
      json: true,
      code: contractAcc,
      scope: contractAcc,
      table: 'reportvotes',
      limit: 100,
    });

    const filteredVotes = await result?.rows?.filter((r) => r.postId === postId);

    if (filteredVotes[0].restorationVotes >= 4) {
      await updatePostStatus(postId, 'published', username);
    } else if (filteredVotes[0].deletionVotes >= 4) {
      await updatePostStatus(postId, 'deleted', username);
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

  } catch (error) {
    console.error('Failed to update post:', error);
  }
  };


  if (activeReports.length === 0) {
    return (
      <> 
       <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 5 }}>
        <MdGroups />
        Council Review Panel
      </Typography>
       <EmptyState message="No active reports under review." />
      </>
    );
  }

  return (
    <>
      <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 5 }}>
        <MdGroups />
        Council Review Panel
      </Typography>
      {activeReports.map((elem) => (
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
                  router.push(`${elem.authorUsername}/tweets/${elem.postId}`);
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

            {elem.categories?.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mr: 1 }}>
                  Categories:
                </Typography>
                {elem.categories.map((cat, i) => (
                  <Chip key={i} label={cat} size="small" variant="outlined" color="primary" sx={{ borderRadius: 1 }} />
                ))}
              </Box>
            )}

            {elem.reasons?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  Reasons:
                </Typography>
                {elem.reasons.map((reason, i) => (
                  <Typography variant="body2" color="text.secondary" key={i} sx={{ ml: 1, lineHeight: 1.5 }}>
                    • {reason}
                  </Typography>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 2, opacity: 0.6 }} />

            {elem.appeal && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                  User Appeal
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb: 2 }}>
                  {elem.appeal}
                </Typography>
                <Divider sx={{ my: 2, opacity: 0.6 }} />
              </>
            )}

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
                if (value === "restore" || value === "delete") {
                  setReportVote((prev) => ({ ...prev, [elem.postId]: value }));
                }
              }}
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="restore"
                control={
                  <Radio
                    icon={<AiOutlineCheckCircle size={20} />}
                    checkedIcon={<AiOutlineCheckCircle size={20} color={theme.palette.success.main} />}
                  />
                }
                label={<Typography sx={{ fontWeight: 400 }}>Restore</Typography>}
              />
              <FormControlLabel
                value="delete"
                control={
                  <Radio
                    icon={<AiOutlineCloseCircle size={20} />}
                    checkedIcon={<AiOutlineCloseCircle size={20} color={theme.palette.error.main} />}
                  />
                }
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
  );
};

export default CouncilReviewPanel;







