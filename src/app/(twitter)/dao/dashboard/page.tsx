// // pages/index.js (or components/Dashboard.js)
// "use client"
// import React, { useState } from 'react';
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Container,
//   Grid,
//   Box,
//   Button,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Chip,
//   Card,
//   CardContent,
//   CardHeader,
//   LinearProgress,
//   IconButton, // For hamburger icon
//   Drawer, // For side navigation
//   Divider, // For separating nav items
// } from '@mui/material';
// import { styled, useTheme } from '@mui/system'; // useTheme for breakpoints
// import useMediaQuery from '@mui/material/useMediaQuery'; // For responsive drawer
// import Link from 'next/link'; // For client-side navigation

// // React Icons
// import {
//   MdOutlineAccountBalanceWallet,
//   MdHowToVote,
//   MdGroups,
//   MdOutlinePeopleAlt,
//   MdOutlinePaid,
//   MdOutlinePolicy,
//   MdOutlineGavel,
//   MdOutlinePieChart,
//   MdOutlineReport,
//   MdOutlineVerifiedUser,
//   MdBarChart,
//   MdOutlineArrowForwardIos,
//   MdMenu, // Hamburger icon
//   MdExitToApp, // Disconnect icon
//   MdAccountBalanceWallet, // Connected wallet icon
// } from 'react-icons/md';
// import { FaMoneyBillWave, FaVoteYea } from 'react-icons/fa';
// import { RiDashboardLine } from 'react-icons/ri';

// // --- Custom styled components ---
// const StyledAppBar = styled(AppBar)(({ theme }) => ({
//   background: 'linear-gradient(90deg, #6200EE 30%, #BB86FC 90%)',
//   boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
// }));

// const StyledCard = styled(Card)(({ theme }) => ({
//   borderRadius: theme.shape.borderRadius * 2,
//   boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
//   transition: 'transform 0.2s ease-in-out',
//   '&:hover': {
//     transform: 'translateY(-5px)',
//   },
//   height: '100%',
//   display: 'flex',
//   flexDirection: 'column',
// }));

// const StyledListItem = styled(ListItem)(({ theme }) => ({
//   '&:hover': {
//     backgroundColor: theme.palette.action.hover,
//     borderRadius: theme.shape.borderRadius,
//   },
// }));

// // --- StatCard component (as provided) ---
// const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
//   <StyledCard>
//     <CardContent>
//       <Box display="flex" alignItems="center" gap={2}>
//         <Box fontSize={32} color="primary.main">
//           {icon}
//         </Box>
//         <Box>
//           <Typography variant="body2" color="text.secondary">{label}</Typography>
//           <Typography variant="h5" fontWeight="bold">
//             {value}
//           </Typography>
//         </Box>
//       </Box>
//     </CardContent>
//   </StyledCard>
// );

// const SnipverseDashboard = () => {
//   // Hardcoded Data
//   const daoOverview = {
//     totalStakedTokens: '1,250,000,000 SNIP',
//     activeProposals: 5,
//     upcomingElections: 'June 15, 2025',
//     communityWalletBalance: '500,000,000 SNIP',
//     currentAdRevenue: '$150,000 (Last 30 days)',
//   };

//   const councilMembers = [
//     { id: 1, name: 'Alice Smith', role: 'Founder', performance: 85 },
//     { id: 2, name: 'Bob Johnson', role: 'Founder', performance: 88 },
//     { id: 3, name: 'Charlie Brown', role: 'Elected', performance: 72 },
//     { id: 4, name: 'Diana Prince', role: 'Elected', performance: 91 },
//     { id: 5, name: 'Eve Adams', role: 'Elected', performance: 68 },
//     { id: 6, name: 'Frank White', role: 'Elected', performance: 79 },
//     { id: 7, name: 'Grace Lee', role: 'Elected', performance: 83 },
//   ];

//   const recentProposals = [
//     {
//       id: 1,
//       title: 'Platform UI/UX Revamp Initiative',
//       status: 'Voting Open',
//       votesFor: 72,
//       votesAgainst: 28,
//       type: 'Growth Strategy'
//     },
//     {
//       id: 2,
//       title: 'Marketing Campaign for Q3 2025',
//       status: 'Approved',
//       date: 'May 10, 2025',
//       type: 'Funding Request'
//     },
//     {
//       id: 3,
//       title: 'Partnership with Gaming Studio X',
//       status: 'Under Review',
//       date: 'May 5, 2025',
//       type: 'Operational Change'
//     },
//   ];

//   const getStatusChipColor = (status) => {
//     switch (status) {
//       case 'Voting Open': return 'info';
//       case 'Approved': return 'success';
//       case 'Under Review': return 'warning';
//       default: return 'default';
//     }
//   };

//   // State for wallet connection
//   const [walletConnected, setWalletConnected] = useState(false); // Simulating connection
//   const [walletAddress, setWalletAddress] = useState('');

//   const handleConnectWallet = () => {
//     // In a real app, this would trigger web3 wallet connection (e.g., MetaMask)
//     console.log('Connecting wallet...');
//     setWalletConnected(true);
//     setWalletAddress('0xAbCd...EfGh'); // Mock address
//   };

//   const handleDisconnectWallet = () => {
//     console.log('Disconnecting wallet...');
//     setWalletConnected(false);
//     setWalletAddress('');
//   };

//   // State for Drawer (side navigation)
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Check if screen is medium or smaller

//   const toggleDrawer = (open) => (event) => {
//     if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
//       return;
//     }
//     setDrawerOpen(open);
//   };

//   const navItems = [
//     { text: 'Dashboard', icon: <RiDashboardLine />, href: '/dao' },
//     { text: 'Elections & Voting', icon: <MdHowToVote />, href: '/dao/elections' },
//     { text: 'Council Members', icon: <MdGroups />, href: '/dao/council_members' },
//     { text: 'Proposals', icon: <MdOutlinePolicy />, href: '/dao/proposals' },
//     { text: 'Moderators', icon: <MdOutlineGavel />, href: '/dao/moderators' },
//     { text: 'Revenue & Compensation', icon: <MdOutlinePaid />, href: '/dao/revenue' },
//     { text: 'Content Moderation', icon: <MdOutlineReport />, href: '/dao/content_moderation' },
//     { text: 'Community Rewards', icon: <MdOutlinePieChart />, href: '/dao/rewards' },
//     // Add other relevant pages as needed
//   ];

//   const drawerContent = (
//     <Box
//       sx={{ width: 250 }}
//       role="presentation"
//       onClick={toggleDrawer(false)}
//       onKeyDown={toggleDrawer(false)}
//     >
//       <Box sx={{ p: 2, display: 'flex', alignItems: 'center', backgroundColor: '#6200EE', color: 'white' }}>
//         <RiDashboardLine size={28} style={{ marginRight: '10px' }} />
//         <Typography variant="h6">Snipverse DAO</Typography>
//       </Box>
//       <Divider />
//       <List>
//         {navItems.map((item) => (
//           <Link href={item.href} passHref key={item.text}>
//             <ListItem button component="a">
//               <ListItemIcon>{item.icon}</ListItemIcon>
//               <ListItemText primary={item.text} />
//             </ListItem>
//           </Link>
//         ))}
//       </List>
//     </Box>
//   );


//   return (
//     <Box sx={{ flexGrow: 1, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
//       <StyledAppBar position="static">
//         <Toolbar>
//           {isMobile && ( // Show hamburger icon only on mobile
//             <IconButton
//               edge="start"
//               color="inherit"
//               aria-label="menu"
//               sx={{ mr: 2 }}
//               onClick={toggleDrawer(true)}
//             >
//               <MdMenu />
//             </IconButton>
//           )}

//           {!isMobile && ( // Show dashboard icon and title on desktop
//             <>
//               <RiDashboardLine size={28} style={{ marginRight: '12px', color: 'white' }} />
//               <Typography variant="h5" component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: 600 }}>
//                 Snipverse DAO Dashboard
//               </Typography>
//             </>
//           )}

//           {isMobile && ( // Show title only on mobile, flexGrow pushes it to center
//             <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: 600, textAlign: 'center' }}>
//               Snipverse DAO
//             </Typography>
//           )}


//           {walletConnected ? (
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <MdAccountBalanceWallet size={20} color="white" />
//               <Typography variant="subtitle1" color="white" sx={{ mr: 1 }}>
//                 {walletAddress}
//               </Typography>
//               <Button
//                 color="inherit"
//                 variant="outlined"
//                 startIcon={<MdExitToApp />}
//                 sx={{ borderColor: 'white', color: 'white' }}
//                 onClick={handleDisconnectWallet}
//               >
//                 Disconnect
//               </Button>
//             </Box>
//           ) : (
//             <Button
//               color="inherit"
//               variant="outlined"
//               startIcon={<MdAccountBalanceWallet />}
//               sx={{ borderColor: 'white', color: 'white' }}
//               onClick={handleConnectWallet}
//             >
//               Connect Wallet
//             </Button>
//           )}
//         </Toolbar>
//       </StyledAppBar>

//       {/* Side Navigation Drawer */}
//       <Drawer
//         anchor="left"
//         open={drawerOpen}
//         onClose={toggleDrawer(false)}
//       >
//         {drawerContent}
//       </Drawer>

//       <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
//         <Grid container spacing={4}>
//           {/* DAO Overview - Using StatCard */}
//           <Grid item xs={12}>
//             <Grid container spacing={3}>
//               <Grid item xs={12} sm={6} md={3}>
//                 <StatCard
//                   icon={<MdOutlineAccountBalanceWallet />}
//                   label="Total Staked Tokens"
//                   value={daoOverview.totalStakedTokens}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <StatCard
//                   icon={<FaVoteYea />}
//                   label="Active Proposals"
//                   value={daoOverview.activeProposals.toString()}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <StatCard
//                   icon={<MdGroups />}
//                   label="Next Elections"
//                   value={daoOverview.upcomingElections}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <StatCard
//                   icon={<FaMoneyBillWave />}
//                   label="Community Wallet"
//                   value={daoOverview.communityWalletBalance}
//                 />
//               </Grid>
//             </Grid>
//           </Grid>

//           {/* Recent Proposals */}
//           <Grid item xs={12} md={12}>
//             <StyledCard>
//               <CardHeader
//                 title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Proposals</Typography>}
//                 action={
//                   <Button size="small" endIcon={<MdOutlineArrowForwardIos />} sx={{ textTransform: 'none' }}>
//                     View All
//                   </Button>
//                 }
//                 sx={{ pb: 0 }}
//               />
//               <CardContent sx={{ pt: 0 }}>
//                 <List disablePadding>
//                   {recentProposals.map((proposal) => (
//                     <StyledListItem key={proposal.id} divider>
//                       <ListItemText
//                         primary={
//                           <Typography variant="body1" sx={{ fontWeight: 500 }}>
//                             {proposal.title}
//                           </Typography>
//                         }
//                         secondary={
//                           <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
//                             <Chip
//                               label={proposal.status}
//                               color={getStatusChipColor(proposal.status)}
//                               size="small"
//                               sx={{ mr: 1 }}
//                             />
//                             <Typography variant="caption" color="text.secondary">
//                                 {proposal.status === 'Voting Open' ? `For: ${proposal.votesFor}% Against: ${proposal.votesAgainst}%` : `Date: ${proposal.date}`}
//                             </Typography>
//                           </Box>
//                         }
//                       />
//                       {proposal.status === 'Voting Open' && (
//                         <Button variant="contained" size="small" color="primary">
//                           Vote
//                         </Button>
//                       )}
//                     </StyledListItem>
//                   ))}
//                 </List>
//               </CardContent>
//             </StyledCard>
//           </Grid>

//           {/* Governance Structure & Quick Access */}
//           <Grid item xs={12} md={12}>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <StyledCard>
//                   <CardHeader
//                     title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Governance Council</Typography>}
//                     action={
//                       <Button size="small" endIcon={<MdOutlineArrowForwardIos />} sx={{ textTransform: 'none' }}>
//                         Details
//                       </Button>
//                     }
//                     sx={{ pb: 0 }}
//                   />
//                   <CardContent sx={{ pt: 0 }}>
//                     <List dense disablePadding>
//                       {councilMembers.slice(0, 4).map((member) => (
//                         <StyledListItem key={member.id}>
//                           <ListItemIcon sx={{ minWidth: '35px' }}>
//                             <MdOutlinePeopleAlt color="#333" />
//                           </ListItemIcon>
//                           <ListItemText
//                             primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{member.name}</Typography>}
//                             secondary={
//                               <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
//                                 <Chip label={member.role} size="small" sx={{ mr: 1 }} />
//                                 <Typography variant="caption" color="text.secondary">
//                                   Performance: {member.performance}%
//                                 </Typography>
//                               </Box>
//                             }
//                           />
//                           <LinearProgress
//                             variant="determinate"
//                             value={member.performance}
//                             sx={{ width: '40px', height: 6, borderRadius: 3, ml: 2 }}
//                             color={member.performance > 70 ? 'success' : 'warning'}
//                           />
//                         </StyledListItem>
//                       ))}
//                       <ListItem>
//                         <Button fullWidth size="small" sx={{ mt: 1, textTransform: 'none' }}>View All 7 Members</Button>
//                       </ListItem>
//                     </List>
//                   </CardContent>
//                 </StyledCard>
//               </Grid>

//               {/* Quick Access section removed as it's now covered by the Drawer navigation */}
//               {/* If you prefer it stay as buttons on larger screens, you can put it back and adjust responsiveness */}

//             </Grid>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default SnipverseDashboard;


















// pages/index.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  MdHowToVote,
  MdGroup,
  MdSecurity,
  MdAttachMoney,
  MdDashboard,
  MdOutlineGavel,
  MdLightbulbOutline,
  MdWallet,
  MdAnnouncement,
  MdArrowForward,
  MdHistory,
  MdPeople,
  MdCheckCircle,
  MdHourglassEmpty,
  MdCancel,
} from 'react-icons/md'; // Using Md prefix for Material Design icons

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, color }) => (
  <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ color: color || 'primary.main', mr: 1 }}>{icon}</Box>
        <Typography variant="subtitle1" component="div" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

interface ElectionItemProps {
  title: string;
  status: 'Voting Open' | 'Completed' | 'Upcoming' | 'Approved' | 'Rejected';
  dateInfo: string;
  link: string;
}

const ElectionItem: React.FC<ElectionItemProps> = ({ title, status, dateInfo, link }) => (
  <ListItem sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
    <ListItemIcon>
      <MdHowToVote />
    </ListItemIcon>
    <ListItemText
      primary={title}
      secondary={dateInfo}
      primaryTypographyProps={{ fontWeight: 'medium' }}
    />
    <Box sx={{ ml: { xs: 0, sm: 'auto' }, mt: { xs: 1, sm: 0 }, display: 'flex', alignItems: 'center' }}>
      <Chip
        label={status}
        color={
          status === 'Voting Open'
            ? 'success'
            : status === 'Completed' || status === 'Approved'
            ? 'info'
            : status === 'Upcoming'
            ? 'warning'
            : 'error' // For Rejected
        }
        size="small"
        sx={{ mr: 1 }}
      />
      <Button variant="outlined" size="small" href={link}>
        View Details
      </Button>
    </Box>
  </ListItem>
);

interface ProposalItemProps {
  title: string;
  status: 'Voting Open' | 'Approved' | 'Rejected';
  dateInfo: string;
  link: string;
}

const ProposalItem: React.FC<ProposalItemProps> = ({ title, status, dateInfo, link }) => (
  <ListItem sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
    <ListItemIcon>
      <MdLightbulbOutline />
    </ListItemIcon>
    <ListItemText
      primary={title}
      secondary={dateInfo}
      primaryTypographyProps={{ fontWeight: 'medium' }}
    />
    <Box sx={{ ml: { xs: 0, sm: 'auto' }, mt: { xs: 1, sm: 0 }, display: 'flex', alignItems: 'center' }}>
      <Chip
        label={status}
        color={
          status === 'Voting Open'
            ? 'success'
            : status === 'Approved'
            ? 'info'
            : 'error' // For Rejected
        }
        size="small"
        sx={{ mr: 1 }}
      />
      {status === 'Voting Open' ? (
        <Button variant="contained" size="small" href={link}>
          Vote Now
        </Button>
      ) : (
        <Button variant="outlined" size="small" href={link}>
          View Details
        </Button>
      )}
    </Box>
  </ListItem>
);

const HomePage: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* AppBar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <MdDashboard size={24} style={{ marginRight: '10px' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Snipverse DAO
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Page Title & Introduction */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            🏛️ Snipverse DAO
          </Typography>
          <Typography variant="h6" color="text.secondary" maxWidth="md" sx={{ mx: 'auto' }}>
            Welcome to the Snipverse Decentralized Autonomous Organization. Here, the community
            governs the platform, making key decisions on growth, moderation, and resource
            allocation, ensuring a transparent and community-driven future for Snipverse.
          </Typography>
        </Box>

        {/* What is Snipverse DAO? */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            What is Snipverse DAO?
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" maxWidth="md" sx={{ mx: 'auto' }}>
            The Snipverse DAO is the cornerstone of our decentralized ecosystem, empowering token holders
            to actively participate in the evolution of the Snipverse platform. Through a robust governance
            framework, members can vote on proposals, elect council members, and ensure the platform's
            direction aligns with community interests and values.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Key Metrics Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Key Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                icon={<MdPeople size={32} />}
                title="Council Members"
                value="7"
                color="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                icon={<MdSecurity size={32} />}
                title="Total Moderators"
                value="3"
                color="secondary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                icon={<MdHowToVote size={32} />}
                title="Total Council Elections"
                value="2"
                color="info.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                icon={<MdOutlineGavel size={32} />}
                title="Total Proposals Submitted"
                value="5"
                color="warning.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                icon={<MdWallet size={32} />}
                title="Community Wallet Balance"
                value="4,250,000 SNIPS"
                color="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                icon={<MdAttachMoney size={32} />}
                title="Total Ad Revenue"
                value="950,000 SNIPS"
                color="error.main"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Highlights & Announcements */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Highlights & Announcements
          </Typography>
          <Card elevation={3}>
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <MdAnnouncement color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Upcoming: Council Election 2025 begins on July 1st!"
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MdAnnouncement color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="New Proposal: 'Enhance Content Discovery Algorithm' is now open for voting."
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MdCheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Success: Proposal #3 'Snipverse Marketing Campaign' successfully approved and funded."
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Get Involved Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Get Involved!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your participation is crucial to the success and decentralization of Snipverse.
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                size="large"
                startIcon={<MdHowToVote />}
                fullWidth
                href="/elections" // Assuming an elections page
              >
                Vote on Proposals & Elections
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<MdGroup />}
                fullWidth
                href="/council-members" // Assuming a council members page
              >
                Become a Council Member
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<MdSecurity />}
                fullWidth
                href="/moderators" // Assuming a moderators page
              >
                Apply to be a Moderator
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<MdLightbulbOutline />}
                fullWidth
                href="/proposals" // Assuming a proposals page
              >
                Submit a Proposal
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Recent Elections Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Recent Elections
          </Typography>
          <Card elevation={3}>
            <CardContent>
              <List>
                <ElectionItem
                  title="Council Election 2024"
                  status="Completed"
                  dateInfo="Voted On: May 15, 2024"
                  link="/elections/council-2024"
                />
                <Divider component="li" />
                <ElectionItem
                  title="Moderator Election - Wave 1"
                  status="Approved"
                  dateInfo="Ended: April 20, 2024"
                  link="/elections/moderator-wave1"
                />
                <Divider component="li" />
                 <ElectionItem
                  title="Council Election 2025"
                  status="Upcoming"
                  dateInfo="Starts: July 1, 2025"
                  link="/elections/council-2025"
                />
              </List>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Button variant="text" endIcon={<MdArrowForward />} href="/elections">
                  View All Elections
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Recent Proposals Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Recent Proposals
          </Typography>
          <Card elevation={3}>
            <CardContent>
              <List>
                <ProposalItem
                  title="Proposal: Implement User Tipping Feature"
                  status="Voting Open"
                  dateInfo="Ends in 3 days"
                  link="/proposals/tipping-feature"
                />
                <Divider component="li" />
                <ProposalItem
                  title="Proposal: Community Forum Revamp"
                  status="Approved"
                  dateInfo="Voted On: May 1, 2024"
                  link="/proposals/forum-revamp"
                />
                <Divider component="li" />
                <ProposalItem
                  title="Proposal: Snipverse Gaming Integration"
                  status="Rejected"
                  dateInfo="Voted On: April 25, 2024"
                  link="/proposals/gaming-integration"
                />
              </List>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Button variant="text" endIcon={<MdArrowForward />} href="/proposals">
                  View All Proposals
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Quick Links / Explore DAO Sections */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Explore DAO Sections
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MdHowToVote />}
                href="/elections"
              >
                Elections
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MdLightbulbOutline />}
                href="/proposals"
              >
                Proposals
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MdPeople />}
                href="/council-members"
              >
                Council Members
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MdSecurity />}
                href="/moderators"
              >
                Moderators
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MdWallet />}
                href="/community-wallet"
              >
                Community Wallet
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MdGroup />}
                href="/governance-structure"
              >
                Governance Structure
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;