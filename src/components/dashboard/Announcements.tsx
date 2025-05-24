import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
} from '@mui/material';
import {
  MdHowToVote,
  MdEventAvailable,
  MdLightbulbOutline,
  MdAssignmentTurnedIn,
  MdArrowForward,
} from 'react-icons/md';
import { FaCheckCircle } from "react-icons/fa";
import { HiSpeakerphone } from "react-icons/hi";


type U64Timestamp = number;

interface ElectionsTable {
  electionName: string;
  startTime: U64Timestamp;
  endTime: U64Timestamp;
  registrationStartTime: U64Timestamp;
  registrationEndTime: U64Timestamp;
  candidateStakeAmount: U64Timestamp;
  voterStakeAmount: U64Timestamp;
  status: 'upcoming' | 'ongoing' | 'ended' | 'expired';
  totalVote: U64Timestamp;
  candidates: string[];
}

interface ProposalsTable {
  id: U64Timestamp;
  proposer: string;
  userName: string;
  title: string;
  description: string;
  deadline: U64Timestamp; 
  category: string;
  yesCount: U64Timestamp;
  noCount: U64Timestamp;
  status: 'open' | 'passed' | 'failed' | 'closed';
}

interface FundProposalTable {
  id: U64Timestamp;
  proposer: string;
  recipient: string;
  amount: U64Timestamp;
  memo: string;
  category: string;
  approvedBy: number;
  rejectedBy: number;
  status: 'open' | 'approved' | 'rejected' | 'paused';
  createdAt: U64Timestamp;
  approvedAt: U64Timestamp;
}

// --- Unified Announcement Interface ---
interface UnifiedAnnouncement {
  id: string;
  title: string;
  description: string;
  type: 'election_register' | 'election_vote' | 'proposal_vote' | 'fund_transferred';
  dateInfo: string;
  icon: React.ReactNode;
  iconColor: string;
  link: string;
  sortPriority: number; // 1=highest, 2=high, 3=medium, 4=low
  sortTimestamp: number; // For robust sorting within priority levels
}

// --- Props Interface for the Component ---
interface HighlightsAndAnnouncementsProps {
  election: ElectionsTable[];
  proposals: ProposalsTable[];
  transaction: FundProposalTable[];
}

// --- 2. Data Processing Logic ---

const u64ToDate = (timestamp: U64Timestamp): Date => new Date(Number(timestamp) * 1000);

// Helper to format date strings
const formatDate = (date: Date): string => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getAnnouncements = (
  elections: ElectionsTable[],
  proposals: ProposalsTable[],
  transactions: FundProposalTable[]
): UnifiedAnnouncement[] => {
  const announcements: UnifiedAnnouncement[] = [];
  const now = new Date(); // Use actual current time
  const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Process Elections
  elections.forEach(election => {
    const regStartTime = u64ToDate(election.registrationStartTime);
    const regEndTime = u64ToDate(election.registrationEndTime);
    const startTime = u64ToDate(election.startTime);
    const endTime = u64ToDate(election.endTime);

    // 1. Election Voting Phase (Highest Priority)
    if (now >= startTime && now <= endTime) {
      const daysLeft = Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      announcements.push({
        id: `el-vote-${election.electionName}`,
        title: `${election.electionName} - Vote Now!`,
        description: `Cast your crucial vote for the next DAO members.`,
        type: 'election_vote',
        dateInfo: daysLeft > 0 ? `Voting ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}` : 'Voting ends Today!',
        icon: <MdHowToVote />,
        iconColor: 'info.main',
        link: `/dao/elections/${election.electionName}`,
        sortPriority: 1, // Highest priority
        sortTimestamp: endTime.getTime(),
      });
    }
    // 2. Election Registration Phase (High Priority)
    else if (now >= regStartTime && now <= regEndTime) {
      const daysLeft = Math.ceil((regEndTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      announcements.push({
        id: `el-reg-${election.electionName}`,
        title: `${election.electionName} - Register Now!`,
        description: `Candidates and voters can register for this election.`,
        type: 'election_register',
        dateInfo: daysLeft > 0 ? `Registration ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}` : 'Registration ends Today!',
        icon: <MdAssignmentTurnedIn />,
        iconColor: 'primary.main',
        link: `/dao/elections/${election.electionName}`,
        sortPriority: 3, // Lower than voting, higher than upcoming
        sortTimestamp: regEndTime.getTime(),
      });
    }
    // 3. Election Registration Starting Soon (Medium Priority)
    else if (regStartTime > now && regStartTime <= fourDaysFromNow) {
      const daysUntil = Math.ceil((regStartTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      announcements.push({
        id: `el-reg-soon-${election.electionName}`,
        title: `${election.electionName} - Registration Soon!`,
        description: `Get ready to register for this important election.`,
        type: 'election_register',
        dateInfo: daysUntil > 0 ? `Registration starts in ${daysUntil} day${daysUntil > 1 ? 's' : ''}` : 'Registration starts Today!',
        icon: <MdEventAvailable />,
        iconColor: 'secondary.main',
        link: `/dao/elections/${election.electionName}`,
        sortPriority: 4, // Medium priority
        sortTimestamp: regStartTime.getTime(),
      });
    }
  });

  proposals.forEach(proposal => {
    const deadline = u64ToDate(proposal.deadline);

    if (proposal.status === 'open' && now <= deadline) {
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      announcements.push({
        id: `prop-vote-${proposal.id}`,
        title: `Vote on Proposal: ${proposal.title}`,
        description: proposal.description,
        type: 'proposal_vote',
        dateInfo: daysLeft > 0 ? `Voting ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}` : 'Voting ends Today!',
        icon: <MdLightbulbOutline />,
        iconColor: 'warning.main',
        link: `/dao/proposals/${proposal.id}`,
        sortPriority: 2,
        sortTimestamp: deadline.getTime(),
      });
    }
  });

  const recentTransactions = transactions
    .filter(fund => u64ToDate(fund.approvedAt) >= oneWeekAgo && u64ToDate(fund.approvedAt) < now)
    .sort((a, b) => u64ToDate(b.approvedAt).getTime() - u64ToDate(a.approvedAt).getTime())
    .slice(0, 2);

  recentTransactions.forEach(fund => {
    const approvedAt = u64ToDate(fund.approvedAt);
    announcements.push({
      id: `fund-${fund.id}`,
      title: `Funds Transferred: ${fund.memo || fund.category}`,
      description: `An amount of ${Number(fund.amount).toLocaleString()} tokens has been successfully transferred to ${fund.recipient}.`,
      type: 'fund_transferred',
      dateInfo: `Transferred on ${formatDate(approvedAt)}`,
      icon: <FaCheckCircle />,
      iconColor: 'success.dark',
      link: `/dao/community_wallet/`,
      sortPriority: 5, // Lowest priority ( informational, not actionable)
      sortTimestamp: approvedAt.getTime(),
    });
  });

  // Sort announcements:
  // 1. By `sortPriority` (lower number = higher priority)
  // 2. Then by `sortTimestamp` (for active/upcoming, earlier is more urgent; for passive, later is more recent)
  announcements.sort((a, b) => {
    if (a.sortPriority !== b.sortPriority) {
      return a.sortPriority - b.sortPriority;
    }
    if (a.sortPriority <= 4) { 
      return a.sortTimestamp - b.sortTimestamp;
    } else {
      return b.sortTimestamp - a.sortTimestamp;
    }
  });

  return announcements;
};

// --- 3. React Component to Display Announcements ---
const HighlightsAndAnnouncements: React.FC<HighlightsAndAnnouncementsProps> = ({
  election,
  proposals,
  transaction,
}) => {
  const allAnnouncements = getAnnouncements(
    election,
    proposals,
    transaction
  );

  if (allAnnouncements.length === 0) {
    return (
      <Box sx={{ mt: 6, textAlign: 'left' }}>
        <Typography variant="h4" align="left" fontWeight={600} gutterBottom>
        <Box component="span" sx={{ verticalAlign: 'middle', mr: 1 }}>
          <HiSpeakerphone />
        </Box>
        Highlights & Announcements
        </Typography>
        <Card elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No active announcements at the moment. Check back for new opportunities to participate!
          </Typography>
        </Card>
      </Box>
    );
  }

  const featuredAnnouncement = allAnnouncements[0];
  const otherAnnouncements = allAnnouncements.slice(1, 4);

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h4" align="left" fontWeight={600} gutterBottom>
        <Box component="span" sx={{ verticalAlign: 'middle', mr: 1 }}>
          <HiSpeakerphone />
        </Box>
        Highlights & Announcements
      </Typography>
      <Typography variant="body1" color="text.secondary" align="left" sx={{ mb: 3 }}>
        Stay up-to-date with the most important and actionable events in our DAO, including active elections,
        proposals open for voting, and recent fund distributions.
      </Typography>
      <Card elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', p: 0 }}>
        {featuredAnnouncement && (
          <Box sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' },
          }}>
            <Box sx={{ fontSize: '3rem', mr: 2 }}>
              {featuredAnnouncement.icon}
            </Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {featuredAnnouncement.title}
            </Typography>
            {featuredAnnouncement.link && (
              <Button
                variant="contained"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                  color: 'white',
                  ml: { sm: 2 }
                }}
                endIcon={<MdArrowForward />}
                href={featuredAnnouncement.link}
              >
                Go Now
              </Button>
            )}
          </Box>
        )}
        <CardContent sx={{ p: 0 }}>
          <List disablePadding>
            {otherAnnouncements.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': { backgroundColor: 'action.hover' },
                    cursor: item.link ? 'pointer' : 'default',
                  }}
                  onClick={() => item.link && window.location.assign(item.link)}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: item.iconColor }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography component="span" variant="body1" fontWeight="medium" sx={{ mr: 1 }}>
                          {item.title}
                        </Typography>
                      </Box>
                    }
                    secondary={item.dateInfo}
                  />
                  {item.link && (
                    <ListItemIcon sx={{ ml: 2, display: { xs: 'none', sm: 'flex' } }}>
                      <MdArrowForward color="action.active" />
                    </ListItemIcon>
                  )}
                </ListItem>
                {index < otherAnnouncements.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HighlightsAndAnnouncements;