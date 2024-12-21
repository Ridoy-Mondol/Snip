import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container>
      <Box my={4}>
        <Typography variant="h3" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          This is a placeholder Privacy Policy. You can update it with real information.
        </Typography>
        <Typography variant="body1" paragraph>
          Your privacy is important to us. This page explains what data we collect and how we use it.
        </Typography>
        <Typography variant="body1" paragraph>
          We collect data such as your name, email address, and any other personal information you provide us.
        </Typography>
        <Typography variant="body1" paragraph>
          For more information, feel free to contact us at{' '}
          <a href="mailto:ridoymondol140@gmail.com">example@gmail.com</a>.
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
