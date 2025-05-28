import React, { useState, useEffect } from 'react';
import { JsonRpc } from 'eosjs';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { MdHowToVote } from 'react-icons/md';
import { useWallet } from "@/context/WalletContext";
import { getUser } from "@/utilities/fetch";
import EmptyState from '../dashboard/EmptyState';

interface Recall {
  recallId: string;
  moderator: string;
  photoUrl: string | null;
  reason: string;
  yesVotes: number;
  noVotes: number;
  status?: string;
}

interface User {
  photoUrl: string;
}

interface ModeratorRecallSectionProps {
  getFullURL: (url: string) => string;
  setSnackbar: any;
}

const ModeratorRecallSection = ({ getFullURL, setSnackbar }: ModeratorRecallSectionProps) => {
  const [recallTab, setRecallTab] = useState(0);
  const [activeModRecall, setActiveModRecall] = useState<Recall[]>([]);
  const [pastModRecall, setPastModRecall] = useState<Recall[]>([]);
  const [vote, setVote] = useState<{ [recallId: string]: string }>({});

  const { activeSession, connectWallet } = useWallet();

  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;

  const getCachedUser = async (username: string): Promise<User> => {
    const key = `user_${username}`;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const userData = await getUser(username);
    sessionStorage.setItem(key, JSON.stringify(userData.user));
    return userData.user;
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

      const recallList = await Promise.all(
        result.rows.map(async (row) => {
          try {
            const userData = await getCachedUser(row.userId);
            return {
              ...row,
              photoUrl: userData.photoUrl || null,
            };
          } catch (error) {
            console.error(`Failed to fetch user data for ${row.userName}:`, error);
            return {
              ...row,
              photoUrl: null,
            };
          }
        })
      );

      const active = recallList.filter((e) => e.status === 'pending');
      const past = recallList.filter((e) => e.status !== 'pending');
      setActiveModRecall(active);
      setPastModRecall(past);
    } catch (error) {
      console.error('Failed to fetch mod recall data:', error);
    }
  };

  useEffect(() => {
    fetchModRecalls();
  }, []);

  const handleCastVote = async (recallId: string) => {
    const selectedVote = vote[recallId];
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: 'error',
        open: true,
      });
      connectWallet();
      return;
    }

    if (!selectedVote) {
      setSnackbar({
        message: 'Please choose an option before voting.',
        severity: 'error',
        open: true,
      });
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
          recallId: parseInt(recallId),
          vote: selectedVote,
        },
      };

      await activeSession.transact({ actions: [action] }, { broadcast: true });

      setSnackbar({
        message: 'Recall vote successful for this moderator!',
        severity: 'success',
        open: true,
      });
    } catch (error) {
      console.error('Vote failed:', error);
      setSnackbar({
        message: 'Voting failed.',
        severity: 'error',
        open: true,
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 5 }}>
        <MdHowToVote />
        Moderator Recall Votes
      </Typography>

      <Tabs value={recallTab} onChange={(_, val) => setRecallTab(val)} sx={{ mb: 3 }}>
        <Tab label="Active Recalls" />
        <Tab label="Past Recalls" />
      </Tabs>

      {recallTab === 0 && (
        <Box>
          {activeModRecall.length === 0 ? (
            <EmptyState message="No active recall votes." />
          ) : (
            activeModRecall.map((elem, index) => (
              <Card key={elem.recallId} sx={{ mb: 2, px: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar
                      alt={elem.moderator}
                      src={getFullURL(elem.photoUrl || '')}
                      sx={{ width: 80, height: 80, mb: 1 }}
                    />
                    <Typography variant="h6" align="center">
                      {elem.moderator}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      Reason:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {elem.reason}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, my: 1 }}>
                    <Typography variant="body2" sx={{ color: 'green' }}>
                      ✅ Recall: {elem.yesVotes}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'red' }}>
                      ❌ Retained: {elem.noVotes}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    Do you want to recall {elem.moderator}?
                  </Typography>

                  <RadioGroup
                    name={`recallVote-${index}`}
                    value={vote[elem.recallId] || ''}
                    onChange={(e) =>
                      setVote((prev) => ({ ...prev, [elem.recallId]: e.target.value }))
                    }
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

                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!vote[elem.recallId]}
                    fullWidth
                    onClick={() => handleCastVote(elem.recallId)}
                  >
                    Cast Recall Vote
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

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
              {pastModRecall.map((elem, index) => (
                <TableRow key={elem.recallId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        alt={elem.moderator}
                        src={getFullURL(elem.photoUrl || '')}
                        sx={{ width: 40, height: 40 }}
                      />
                      {elem.moderator}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {elem.status === 'removed' ? 'Recalled' : 'Retained'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default ModeratorRecallSection;
