// components/ModeratorManagement.tsx
import { useEffect, useState } from "react";
import { JsonRpc } from 'eosjs';
import {
  Paper,
  Tabs,
  Tab,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Box,
  Button,
} from "@mui/material";
import { FaCaretRight, FaUserShield } from "react-icons/fa";
import { MdGavel, MdPersonAdd } from "react-icons/md";
import { useRouter } from "next/navigation";
import EmptyState from "../dashboard/EmptyState";
import { useWallet } from "@/context/WalletContext";
import { getUser } from "@/utilities/fetch";

// TabPanel helper
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mod-tabpanel-${index}`}
      aria-labelledby={`mod-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `mod-tab-${index}`,
    "aria-controls": `mod-tabpanel-${index}`,
  };
}

type Moderator = {
  account: string;
  approvedAt: number;
  photoUrl?: string;
};

type Applicant = {
  account: string;
  userName: string;
  photoUrl?: string;
};

type Props = {
  getFullURL: (path: string) => string;
  setShowRecallForm: (show: boolean) => void;
  setRecalledMember: (member: string) => void;
  setRecalledMod: (mod: string) => void;
  setSnackbar: any;
};

const ModeratorManagement = ({
  getFullURL,
  setShowRecallForm,
  setRecalledMember,
  setRecalledMod,
  setSnackbar
}: Props) => {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [applications, setApplications] = useState<Applicant[]>([]);
  const [modManagementTab, setModManagementTab] = useState(0);
  const router = useRouter();
    
  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;

  const { activeSession, connectWallet } = useWallet();

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

  useEffect (() => {
    fetchModerators();
    fetchModApplication();
  },[])

  const handleModVote = async (candidate: string, vote: string) => {
      if (!activeSession) {
       setSnackbar({
        message: 'Please connect wallet first',
        severity: 'error',
        open: true,
       });
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

      setSnackbar({
      message: `Moderator ${vote === 'approve' ? 'approved' : 'rejected'} successfully`,
      severity: 'success',
      open: true,
    });
    } catch (error: any) {
      console.error('Failed to vote moderator application:', error);
    }
  };

  return (
    <>
      <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
        <FaUserShield />
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
          {moderators.length > 0 ? (
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
                  {moderators.map((moderator, index) => (
                    <TableRow key={moderator.account}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar src={moderator.photoUrl && getFullURL(moderator.photoUrl)} />
                          {moderator.account}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(moderator.approvedAt * 1000).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FaCaretRight />}
                          onClick={() =>
                            router.push(`/dao/moderators/${moderator.account}`)
                          }
                        >
                          Visit
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<MdGavel />}
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
          ) : (
            <EmptyState message="No active moderators." />
          )}
        </TabPanel>

        <TabPanel value={modManagementTab} index={1}>
          {applications.length > 0 ? (
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
                  {applications.map((applicant, index) => (
                    <TableRow key={applicant.account}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            src={applicant.photoUrl && getFullURL(applicant.photoUrl)}
                          />
                          {applicant.account}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FaCaretRight />}
                          onClick={() => router.push(`/${applicant.userName}`)}
                        >
                          Visit
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<MdPersonAdd />}
                          onClick={() => handleModVote(applicant.account, "approve")}
                        >
                          Approve
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
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
          ) : (
            <EmptyState message="No pending moderator applications." />
          )}
        </TabPanel>
      </Paper>
    </>
  );
};

export default ModeratorManagement;
