"use client"
import React, { useState, useEffect, useContext } from 'react';
import { JsonRpc } from 'eosjs';
import {
  Container,
  Typography,
  Button,
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

const CouncilMembersPage = () => {
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [recallData, setRecallData] = useState<any>(null);
  const [members, setMembers] = useState<any>([]);
  const [showRecallForm, setShowRecallForm] = useState(false);
  const [recalledMember, setRecalledMember] = useState("");
  const [recalledMod, setRecalledMod] = useState("");
  const [recalledElection, setRecalledElection] = useState("");
  const [wallet, setWallet] = useState("");
  const [fundForm, setFundForm] = useState(false);
  const [revenueForm, setRevenueForm] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

  const { activeSession, connectWallet } = useWallet();

  const permission =
    activeSession?.auth?.actor?.toString() === "snipvote" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul5" ||
    activeSession?.auth?.actor?.toString() === "ahatashamul2";
  
  const now = Math.floor(Date.now() / 1000);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchElections();
    fetchRecallElections();
    fetchWinners();
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
       <Typography variant="h4"
        fontWeight={600} gutterBottom>
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

      {/* Council members */}
      <Members
        members={members}
        permission={permission}
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
      
      {/* snackbar */}
      {snackbar.open && (
        <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
      )}

    </Container>
  )
}

export default CouncilMembersPage
