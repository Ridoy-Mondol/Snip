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
  connectWallet: () => void;
  setSnackbar: (args: { message: string; severity: "success" | "error"; open: boolean }) => void;
};

const FoundersForm: React.FC<Props> = ({ open, onClose, activeSession, connectWallet, setSnackbar }) => {
  const [account1, setAccount1] = useState("");
  const [username1, setUsername1] = useState("");
  const [account2, setAccount2] = useState("");
  const [username2, setUsername2] = useState("");

  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;

  const handleSubmit = async () => {
    if (!account1 || !username1 || !account2 || !username2) {
      setSnackbar({
        message: "All fields must be filled.",
        severity: "error",
        open: true,
      });
      return;
    }

    if (account1.trim() === account2.trim()) {
      setSnackbar({
        message: "Founder wallet accounts must be different.",
        severity: "error",
        open: true,
      });
      return;
    }

    if (!activeSession) {
      setSnackbar({
        message: "Please connect wallet first.",
        severity: "error",
        open: true,
      });
      connectWallet();
      return;
    }

    try {
      const action = {
        account: contractAcc,
        name: "setfounders",
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          accounts: [account1.trim(), account2.trim()],
          userNames: [username1.trim(), username2.trim()],
          signer: activeSession.auth.actor.toString(),
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

      onClose();
      setSnackbar({
        message: "Founders set successfully!",
        severity: "success",
        open: true,
      });
    } catch (error) {
      console.error("Error setting founders:", error);
      setSnackbar({
        message: "Failed to set founders.",
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Set Founders</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Founder 1 - XPR Network Wallet Account (e.g., snipcoins)"
            fullWidth
            value={account1}
            onChange={(e) => setAccount1(e.target.value)}
          />
          <TextField
            label="Founder 1 - Snipverse Username (e.g., Jervis)"
            fullWidth
            value={username1}
            onChange={(e) => setUsername1(e.target.value)}
          />
          <TextField
            label="Founder 2 - XPR Network Wallet Account (e.g., snipstk)"
            fullWidth
            value={account2}
            onChange={(e) => setAccount2(e.target.value)}
          />
          <TextField
            label="Founder 2 - Snipverse Username (e.g., Starbound)"
            fullWidth
            value={username2}
            onChange={(e) => setUsername2(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          disabled={!account1 || !username1 || !account2 || !username2}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FoundersForm;
