"use client"
import React, { useState, useEffect, useContext } from 'react';
import { JsonRpc } from 'eosjs';
import {
  Container,
  Typography,
  Button,
  Stack
} from '@mui/material';
import { FaUsersCog } from 'react-icons/fa';

import { getUser } from "@/utilities/fetch";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { AuthContext } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import Rewards from "@/components/council/Rewards";
import RevenueForm from "@/components/form/Revenue";
import Members from '@/components/council/Members';
import ModeratorManagement from '@/components/council/ModManagement';
import ModeratorRecallSection from '@/components/council/ModRecall';
import CouncilReviewPanel from '@/components/council/ReviewPanel';
import RecallForm from '@/components/form/Recall';
import FundProposal from '@/components/form/FundProposal';
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";
import FoundersForm from '@/components/form/FoundersForm';

const CouncilMembersPage = () => {
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [recallData, setRecallData] = useState<any>(null);
  const [members, setMembers] = useState<any>([]);
  const [isMember, setIsMember] = useState(false);
  const [founders, setFounders] = useState<any>([]);
  const [isFounder, setIsFounder] = useState(false);
  const [showRecallForm, setShowRecallForm] = useState(false);
  const [recalledMember, setRecalledMember] = useState("");
  const [recalledMod, setRecalledMod] = useState("");
  const [recalledElection, setRecalledElection] = useState("");
  const [wallet, setWallet] = useState("");
  const [fundForm, setFundForm] = useState(false);
  const [foundersForm, setFoundersForm] = useState(false);
  const [revenueForm, setRevenueForm] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

  const { activeSession, connectWallet } = useWallet();
  
  const now = Math.floor(Date.now() / 1000);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchElections();
    fetchRecallElections();
    fetchMembers();
    fetchFounders();
  }, [])

  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;
  const tokenAcc = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ACC!;
  const authorizedAccounts = process.env.NEXT_PUBLIC_AUTHORIZED_ACCOUNTS?.split(',') || [];

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
      console.error('Failed to fetch recall elections:', error);
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

      const userFetchPromises = result.rows.map(async (member) => {
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

  useEffect(() => {
    const actor = activeSession?.auth?.actor?.toString?.();
    if (actor && Array.isArray(members)) {
      const isMatch = members.some(
        (member: any) => member?.account === actor
      );
      setIsMember(isMatch);
    } else {
      setIsMember(false);
    }
  }, [members, activeSession?.auth?.actor]);

  const fetchFounders = async () => {
    try {
      const rpc = new JsonRpc(endpoint);
      const result = await rpc.get_table_rows({
        json: true,
        code: contractAcc,
        scope: contractAcc,
        table: 'founders',
        limit: 100,
      });
        
      setFounders(result.rows);

    } catch (error) {
      console.error('Failed to fetch member:', error);
    }
  };

  useEffect(() => {
    const actor = activeSession?.auth?.actor?.toString?.();
    if (actor && Array.isArray(founders)) {
      const isMatch = founders.some(
        (founder: any) => founder?.account === actor
      );
      setIsFounder(isMatch);
    } else {
      setIsFounder(false);
    }
  }, [founders, activeSession?.auth?.actor]);

  const declareMembers = async () => {
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
      setSnackbar({
        message: 'Successfully Declered Council Member!',
        severity: "success",
        open: true,
      });
    } catch (error: any) {
      console.error('Winner declaration failed:', error);
    }
  };

  const declareRecall = async () => {
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
        name: 'recallresult',
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          electionName: recallData.electionName,
          member: recallData.councilMember,
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
      setSnackbar({
        message: 'Successfully Declered Recalled Member',
        severity: "success",
        open: true,
      });
    } catch (error: any) {
      console.error('Recall declaration failed:', error);
    }
  };

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

      const balanceStr = result?.rows?.[0]?.balance;
      if (!balanceStr) return null;

      const [amountStr] = balanceStr.split(' ');
      const amount = parseFloat(amountStr);
      return amount;
        
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
       <Typography variant="h4"
        fontWeight={700} gutterBottom>
        <FaUsersCog style={{ marginRight: 8 }} /> Snipverse Council Members
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Explore the Snipverse Council Members section to learn about our elected leaders and their roles. Stay informed about their contributions to our decentralized community.
      </Typography>

      <Stack spacing={2} direction="row" flexWrap="wrap" gap={2} my={2}>
        {(isFounder && selectedElection) && (
          <Button variant="contained" color="primary" onClick={declareMembers}>
            Declare Members
          </Button>
        )}

        {(isFounder && recallData) && (
          <Button variant="contained" color="secondary" onClick={declareRecall}>
            Declare Recall
          </Button>
        )}

        {isFounder && (
          <Button variant="outlined" color="warning" onClick={() => setRevenueForm(true)}>
            Share Revenue
          </Button>
        )}
      </Stack>

      { authorizedAccounts.includes(activeSession?.auth?.actor) &&
      <Button variant="outlined" color="success" sx={{ mb: 2 }} onClick={() => setFoundersForm(true)}>
        Set Founders
      </Button>
      }

      {/* Council members */}
      <Members
        members={members}
        permission={isFounder}
        getFullURL={getFullURL}
        setShowRecallForm={setShowRecallForm}
        setRecalledMember={setRecalledMember}
        setRecalledMod={setRecalledMod}
        setRecalledElection={setRecalledElection}
      />

      {/* moderator management section */}      
      { isMember &&
      <ModeratorManagement
        getFullURL={getFullURL}
        setShowRecallForm={setShowRecallForm}
        setRecalledMember={setRecalledMember}
        setRecalledMod={setRecalledMod}
        setSnackbar={setSnackbar}
      /> 
      } 
      
      {/* Recall votes section */}
      { isMember &&
      <ModeratorRecallSection
        getFullURL={getFullURL}
        setSnackbar={setSnackbar}
      />
      }
    
      {/* Council Review Panel */}
      { isMember && 
      <CouncilReviewPanel
        token={token}
        setSnackbar={setSnackbar}
      />
      }

      {/* Rewards */}
      { isMember &&
      <Rewards 
        setFundForm={setFundForm} 
        activeSession= {activeSession}
        connectWallet={connectWallet} 
        setSnackbar={setSnackbar}
      />
      }

      {/* Member and moderator recall form */}
      <RecallForm
        open={showRecallForm}
        onClose={() => setShowRecallForm(false)}
        recalledMember={recalledMember}
        recalledMod={recalledMod}
        recalledElec={recalledElection}
        setShowRecallForm={setShowRecallForm}
        setSnackbar={setSnackbar}
      />

      {/* Fund Prposal Form */}
      <FundProposal
        open={fundForm}
        onClose={() => setFundForm(false)}
        activeSession={activeSession}
        connectWallet={connectWallet}
        fetchToken={fetchToken}
        contractAcc={contractAcc}
        setSnackbar={setSnackbar}
      />

      {/* Revenue form */}
      <RevenueForm
        open={revenueForm}
        onClose={() => setRevenueForm(false)}
        activeSession= {activeSession}
        connectWallet={connectWallet}
        fetchToken={fetchToken}
        setSnackbar={setSnackbar}
      />
      
      {/* Form for adding founding members */}
      <FoundersForm
        open={foundersForm}
        onClose={() => setFoundersForm(false)}
        activeSession={activeSession}
        connectWallet={connectWallet}
        setSnackbar={setSnackbar}
      />
      
      {/* snackbar */}
      {snackbar.open && (
        <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
      )}

    </Container>
  )
}

export default CouncilMembersPage
