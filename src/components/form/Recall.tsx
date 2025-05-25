'use client';

import React, {useState} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useWallet } from "@/context/WalletContext";

interface RecallFormDialogProps {
  open: boolean;
  onClose: () => void;
  recalledMember: string;
  recalledMod: string;
  recalledElec: string;
  setShowRecallForm: (value: boolean) => void;
  setSnackbar: any
}

const RecallForm: React.FC<RecallFormDialogProps> = ({
  open,
  onClose,
  recalledMember,
  recalledMod,
  recalledElec,
  setShowRecallForm,
  setSnackbar
}) => {
  const [reason, setReason] = useState("");
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');


  const { activeSession, connectWallet } = useWallet();
    
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;

  const handleRecall = async () => {
    if (!activeSession) {
      setSnackbar({
        message: 'Please connect wallet first',
        severity: "error",
        open: true,
      });
      connectWallet();
      return;
    }

    if (!recalledMember || !recalledElec) {
      return;
    }
    if (!reason.trim()) {
      setSnackbar({
        message: 'Please choose a reason to recall member.',
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
          electionName: recalledElec,
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

      setSnackbar({
        message: 'Recall election created successfully!',
        severity: "success",
        open: true,
      });
      setShowRecallForm(false);
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

      setSnackbar({
        message: 'Recall election created successfully!',
        severity: "success",
        open: true,
      });
      setShowRecallForm(false);
    } catch (error: any) {
      console.error('Failed to create recall election:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Initiate recall election for {recalledMember || recalledMod}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            autoFocus
            margin="dense"
            label={recalledMember ? 'Member' : 'Moderator'}
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

          {recalledMember && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Voting Start Time (UTC)"
                value={newStartTime ? new Date(newStartTime) : null}
                onChange={(value) =>
                  setNewStartTime(value?.toISOString() ?? '')
                }
              />

              <DateTimePicker
                label="Voting End Time (UTC)"
                value={newEndTime ? new Date(newEndTime) : null}
                onChange={(value) => setNewEndTime(value?.toISOString() ?? '')}
              />
            </LocalizationProvider>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="secondary"
          onClick={recalledMember ? handleRecall : handleModRecall}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecallForm;
