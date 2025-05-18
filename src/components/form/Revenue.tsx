import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  activeSession: any;
  connectWallet: any;
  fetchToken: any;
};

const RevenueForm: React.FC<Props> = ({ open, onClose, activeSession, connectWallet, fetchToken }) => {
  const [totalRevenue, setTotalRevenue] = useState<number>();
  const [percent, setPercent] = useState<number>();

  const handleSubmit = async () => {
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
        account: 'snipvote',
        name: 'sendrevenue',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          founder: activeSession.auth.actor.toString(),
          totalRevenue: Math.round(totalRevenue! * 10000),
          percent: percent,
          available: Math.round(availablebalance * 10000),
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
      onClose();
      alert('Revenue shared successfully!');
    } catch (error) {
      console.error('Error sharing revenue:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Distribute Revenue Among Elected Members</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Total Revenue"
            type="number"
            fullWidth
            value={totalRevenue}
            onChange={(e) => setTotalRevenue(Number(e.target.value))}
          />

          <TextField
            label="Percent"
            type="number"
            fullWidth
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          disabled={!totalRevenue || !percent}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RevenueForm;
