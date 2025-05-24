'use client';

import { Box, Typography, Grid, Paper } from '@mui/material';
import { FaUniversity, FaUsers, FaVoteYea, FaCoins, FaLandmark } from 'react-icons/fa';
import { GiMeshNetwork } from 'react-icons/gi';

const aboutItems = [
  {
    icon: <FaUniversity size={32} color="#1976d2" />,
    title: 'Decentralized',
    description: 'Snipverse DAO is governed by a council of elected and founding members, ensuring transparency and accountability.',
  },
  {
    icon: <FaUsers size={32} color="#43a047" />,
    title: 'Community Driven',
    description: 'Community members stake tokens to vote, propose changes, and recall underperforming leaders.',
  },
  {
    icon: <FaVoteYea size={32} color="#fbc02d" />,
    title: 'Secure Voting',
    description: 'All elections and proposals are executed via smart contracts on the XPR Network.',
  },
  {
    icon: <FaCoins size={32} color="#ff7043" />,
    title: 'Revenue Sharing',
    description: 'A percentage of ad revenue is distributed to council members each month.',
  },
];

const AboutSection = () => {
  return (
    <Box sx={{ py: 6 }}>
      <Typography variant="h4" align="left" fontWeight={600} gutterBottom>
        <Box component="span" sx={{ verticalAlign: 'left', mr: 1 }}>
          <GiMeshNetwork />
        </Box>
        About Snipverse DAO
      </Typography>

      <Typography variant="subtitle1" align="left" color="text.secondary" maxWidth="md" mx="auto" mb={5}>
        Snipverse DAO is a decentralized governance system that empowers community members to shape the platform's future through transparent elections, secure smart contract voting, and shared rewards.
      </Typography>

      <Grid container spacing={4} rowGap={4}>
        {aboutItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center', borderRadius: 4 }}>
              <Box mb={2}>{item.icon}</Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AboutSection;
