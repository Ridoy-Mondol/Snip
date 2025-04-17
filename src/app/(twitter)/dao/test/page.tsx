"use client"
import React from 'react';
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
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
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
import { MdGavel, MdPersonAdd, MdPersonRemove } from 'react-icons/md';

// Hardcoded Data
const councilMembersData = [
  { id: 1, name: 'Alice Founder', status: 'Founding Member', avatar: '/images/avatar1.png' },
  { id: 2, name: 'Bob Founder', status: 'Founding Member', avatar: '/images/avatar2.png' },
  { id: 3, name: 'Charlie Elected', status: 'Elected Member', termEnd: '2026-05-10', avatar: '/images/avatar3.png' },
  { id: 4, name: 'David Elected', status: 'Elected Member', termEnd: '2026-08-15', avatar: '/images/avatar4.png' },
  { id: 5, name: 'Eve Elected', status: 'Elected Member', termEnd: '2025-12-20', avatar: '/images/avatar5.png' },
  { id: 6, name: 'Frank Elected', status: 'Elected Member', termEnd: '2027-03-01', avatar: '/images/avatar6.png' },
  { id: 7, name: 'Grace Elected', status: 'Elected Member', termEnd: '2025-09-25', avatar: '/images/avatar7.png' },
];

const activeProposalsData = [
  { id: 101, title: 'Implement New Feature X', proposer: 'Charlie Elected', date: '2025-04-05', status: 'Voting Open', progress: '3/7' },
  { id: 102, title: 'Adjust Marketing Budget', proposer: 'Alice Founder', date: '2025-04-08', status: 'Voting Open', progress: '5/7' },
];

const pastProposalsData = [
  { id: 201, title: 'Community Reward Increase', proposer: 'David Elected', date: '2025-03-20', status: 'Approved', progress: '7/7' },
];

const councilRecallVotesData = [
  { id: 301, member: 'Eve Elected', initiatedBy: 'Alice Founder', reason: 'Low Engagement', status: 'Voting Open', yourVote: null },
];

const moderatorRecallVotesData = [
  { id: 401, moderator: 'ModBot', initiatedBy: 'Charlie Elected', reason: 'Inconsistent Moderation', status: 'Voting Open', yourVote: null },
];

const activeModeratorsData = [
  { id: 501, name: 'ModBot', approvalDate: '2024-11-15' },
  { id: 502, name: 'SuperMod', approvalDate: '2025-01-20' },
];

const pendingModeratorApplicationsData = [
  { id: 601, name: 'NewbieMod', applicationDate: '2025-04-10' },
];

const councilReviewData = [
  { id: 701, item: 'Post #123', reporter: 'ModBot', date: '2025-04-11', category: 'Spam', status: 'Pending' },
];

const communityWalletData = {
  balance: '1,500,000 SNIP',
  recentActivity: [
    { id: 801, type: 'Allocation', amount: '100,000 SNIP', date: '2025-04-10', recipient: 'Rewards Pool' },
  ],
};

const adRevenueData = {
  realtime: '12,500 USD',
  yourAllocation: '250 USD',
  distribution: [
    { name: 'Charlie Elected', value: 25 },
    { name: 'David Elected', value: 25 },
    { name: 'Eve Elected', value: 25 },
    { name: 'Frank Elected', value: 25 },
    { name: 'Grace Elected', value: 25 },
    { name: 'Remaining', value: 25 }, // Represents the 7% for founding members
  ],
  historical: [
    { month: 'Jan', revenue: 10000 },
    { month: 'Feb', revenue: 11000 },
    { month: 'Mar', revenue: 12000 },
    { month: 'Apr', revenue: 12500 },
  ],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function CouncilMembersPage() {
  const [proposalDialogOpen, setProposalDialogOpen] = React.useState(false);
  const [newProposalTitle, setNewProposalTitle] = React.useState('');
  const [newProposalDescription, setNewProposalDescription] = React.useState('');
  const [recallTabValue, setRecallTabValue] = React.useState(0);
  const [moderatorManagementTabValue, setModeratorManagementTabValue] = React.useState(0);

  const handleOpenProposalDialog = () => {
    setProposalDialogOpen(true);
  };

  const handleCloseProposalDialog = () => {
    setProposalDialogOpen(false);
    setNewProposalTitle('');
    setNewProposalDescription('');
  };

  const handleCreateProposal = () => {
    // In a real application, this would dispatch an action to create a proposal
    console.log('Creating proposal:', { title: newProposalTitle, description: newProposalDescription });
    handleCloseProposalDialog();
  };

  const handleRecallTabChange = (event, newValue) => {
    setRecallTabValue(newValue);
  };

  const handleModeratorManagementTabChange = (event, newValue) => {
    setModeratorManagementTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        <FaUsersCog style={{ marginRight: 8 }} /> Snipverse Council Members
      </Typography>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Council Overview
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {councilMembersData.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Avatar src={member.avatar || <FaUserCircle size={32} />} />
                  </TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.status}{member.termEnd && ` (Ends: ${member.termEnd})`}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" startIcon={<FaCaretRight />}>
                      View Profile
                    </Button>
                    {councilMembersData[0].status === 'Founding Member' && ( // Example: Recall button for the first member (Alice)
                      <Button size="small" color="error" sx={{ ml: 1 }} startIcon={<MdGavel />}>
                        Initiate Recall
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Proposal & Decision-Making
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpenProposalDialog} sx={{ mb: 2 }} startIcon={<FaFileAlt />}>
          Submit New Proposal
        </Button>
        <Tabs value={0} aria-label="proposal tabs">
          <Tab label="Active Proposals" {...a11yProps(0)} />
          <Tab label="Past Proposals" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={0} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Proposer</TableCell>
                  <TableCell>Date Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Voting Progress</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeProposalsData.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>{proposal.title}</TableCell>
                    <TableCell>{proposal.proposer}</TableCell>
                    <TableCell>{proposal.date}</TableCell>
                    <TableCell>{proposal.status}</TableCell>
                    <TableCell>{proposal.progress}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" startIcon={<FaCaretRight />}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        <TabPanel value={0} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Proposer</TableCell>
                  <TableCell>Date Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Voting Progress</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pastProposalsData.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>{proposal.title}</TableCell>
                    <TableCell>{proposal.proposer}</TableCell>
                    <TableCell>{proposal.date}</TableCell>
                    <TableCell>{proposal.status}</TableCell>
                    <TableCell>{proposal.progress}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" startIcon={<FaCaretRight />}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recall Votes
        </Typography>
        <Tabs value={recallTabValue} onChange={handleRecallTabChange} aria-label="recall vote tabs">
          <Tab label="Council Member Recall" {...a11yProps(0)} />
          <Tab label="Moderator Recall" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={recallTabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Council Member</TableCell>
                  <TableCell>Initiated By</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Your Vote</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {councilRecallVotesData.map((recall) => (
                  <TableRow key={recall.id}>
                    <TableCell>{recall.member}</TableCell>
                    <TableCell>{recall.initiatedBy}</TableCell>
                    <TableCell>{recall.reason}</TableCell>
                    <TableCell>{recall.status}</TableCell>
                    <TableCell>
                      {recall.status === 'Voting Open' ? (
                        <Box>
                          <Button size="small" variant="outlined" color="success" sx={{ mr: 1 }}>Yes</Button>
                          <Button size="small" variant="outlined" color="error">No</Button>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" startIcon={<FaCaretRight />}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {councilRecallVotesData.length === 0 && <Typography variant="body2">No active or past council recall votes.</Typography>}
        </TabPanel>
        <TabPanel value={recallTabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Moderator</TableCell>
                  <TableCell>Initiated By</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Your Vote</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {moderatorRecallVotesData.map((recall) => (
                  <TableRow key={recall.id}>
                    <TableCell>{recall.moderator}</TableCell>
                    <TableCell>{recall.initiatedBy}</TableCell>
                    <TableCell>{recall.reason}</TableCell>
                    <TableCell>{recall.status}</TableCell>
                    <TableCell>
                      {recall.status === 'Voting Open' ? (
                        <Box>
                          <Button size="small" variant="outlined" color="success" sx={{ mr: 1 }}>Yes</Button>
                          <Button size="small" variant="outlined" color="error">No</Button>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" startIcon={<FaCaretRight />}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {moderatorRecallVotesData.length === 0 && <Typography variant="body2">No active or past moderator recall votes.</Typography>}
        </TabPanel>
      </Paper>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Moderator Management
        </Typography>
        <Tabs value={moderatorManagementTabValue} onChange={handleModeratorManagementTabChange} aria-label="moderator management tabs">
          <Tab label="Active Moderators" {...a11yProps(0)} />
          <Tab label="Pending Applications" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={moderatorManagementTabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Approval Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeModeratorsData.map((moderator) => (
                  <TableRow key={moderator.id}>
                    <TableCell>{moderator.name}</TableCell>
                    <TableCell>{moderator.approvalDate}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" startIcon={<FaCaretRight />}>
                        View Profile
                      </Button>
                      <Button size="small" color="error" sx={{ ml: 1 }} startIcon={<MdPersonRemove />}>
                        Initiate Recall
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {activeModeratorsData.length === 0 && <Typography variant="body2">No active moderators. </Typography> }
        </TabPanel>
        <TabPanel value={moderatorManagementTabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant Name</TableCell>
                  <TableCell>Application Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingModeratorApplicationsData.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell>{applicant.name}</TableCell>
                    <TableCell>{applicant.applicationDate}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color="success" startIcon={<MdPersonAdd />} sx={{ mr: 1 }}>
                        Approve
                      </Button>
                      <Button size="small" variant="outlined" color="error">
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {pendingModeratorApplicationsData.length === 0 && <Typography variant="body2">No pending moderator applications.</Typography>}
        </TabPanel>
      </Paper>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Snipverse Council Review
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Reported Item</TableCell>
                <TableCell>Reporting Moderator</TableCell>
                <TableCell>Date Reported</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {councilReviewData.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.item}</TableCell>
                  <TableCell>{report.reporter}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell>{report.status}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" startIcon={<FaCaretRight />}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {councilReviewData.length === 0 && <Typography variant="body2">No content awaiting council review.</Typography>}
      </Paper>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Community Rewards Wallet Allocation
        </Typography>
        <Typography variant="body1">
          Balance: <strong>{communityWalletData.balance}</strong>
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Recent Activity:
        </Typography>
        {communityWalletData.recentActivity.map((activity) => (
          <Typography key={activity.id} variant="caption">
            {activity.date} - {activity.type}: {activity.amount} to {activity.recipient}
          </Typography>
        ))}
        <Button variant="outlined" color="primary" sx={{ mt: 2 }} startIcon={<FaWallet />}>
          Propose Allocation
        </Button>
        <Button variant="outlined" color="warning" sx={{ ml: 1, mt: 2 }}>
          Pause Distributions
        </Button>
        <Button variant="outlined" sx={{ ml: 1, mt: 2 }}>
          Adjust Schedule
        </Button>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Revenue & Compensation Transparency
        </Typography>
        <Typography variant="body1">
          Real-time Ad Revenue: <strong>{adRevenueData.realtime}</strong>
        </Typography>
        <Typography variant="body1" gutterBottom>
          Your Current Allocation: <strong>{adRevenueData.yourAllocation}</strong>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FaChartPie style={{ marginRight: 8 }} />
          <Typography variant="subtitle1">Revenue Distribution (Elected Members)</Typography>
        </Box>
        <PieChart width={300} height={200}>
          <Pie
            data={adRevenueData.distribution}
            cx={150}
            cy={100}
            outerRadius={80}
            dataKey="value"
            nameKey="name"
            label
          >
            {adRevenueData.distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Historical Revenue</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Revenue (USD)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adRevenueData.historical.map((item) => (
                  <TableRow key={item.month}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>{item.revenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      <Dialog open={proposalDialogOpen} onClose={handleCloseProposalDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Submit New Proposal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Proposal Title"
            type="text"
            fullWidth
            value={newProposalTitle}
            onChange={(e) => setNewProposalTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            id="description"
            label="Proposal Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newProposalDescription}
            onChange={(e) => setNewProposalDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProposalDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateProposal} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}