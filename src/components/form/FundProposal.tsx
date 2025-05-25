'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

interface FundProposalDialogProps {
  open: boolean;
  onClose: () => void;
  activeSession: any;
  connectWallet: () => void;
  fetchToken: () => Promise<number | undefined | null>;
  contractAcc: string;
  setSnackbar: any;
}

const FundProposalDialog: React.FC<FundProposalDialogProps> = ({
  open,
  onClose,
  activeSession,
  connectWallet,
  fetchToken,
  contractAcc,
  setSnackbar
}) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<number>();
  const [memo, setMemo] = useState('');
  const [category, setCategory] = useState('');

  const submitProposal = async () => {
    const availablebalance = await fetchToken();
    if (!availablebalance) {
      setSnackbar({
        message: 'The community wallet has no balance.',
        severity: 'error',
        open: true,
      });
      return;
    }

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
          category: category,
        },
      };

      const result = await activeSession.transact(
        { actions: [action] },
        { broadcast: true }
      );

      onClose();
      setSnackbar({
        message: 'Proposal submitted successfully!',
        severity: 'success',
        open: true,
      });
    } catch (error) {
      console.error('Error submitting proposal:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
            type="number"
            value={amount || ''}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="secondary"
          disabled={!recipient || !amount || !memo || !category}
          onClick={submitProposal}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FundProposalDialog;
