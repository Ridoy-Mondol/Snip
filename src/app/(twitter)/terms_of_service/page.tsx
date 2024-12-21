import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const TermsOfService = () => {
  return (
    <Container>
      <Box my={4}>
        <Typography variant="h3" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="body1" paragraph>
          This is a placeholder Terms of Service page. You can update it with real information.
        </Typography>
        <Typography variant="body1" paragraph>
          By using our services, you agree to the following terms:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1" paragraph>
              You must be at least 13 years old to use this service.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              You are responsible for the accuracy of the information you provide.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              We reserve the right to modify the terms at any time.
            </Typography>
          </li>
        </ul>
        <Typography variant="body1" paragraph>
          If you have questions, contact us at{' '}
          <a href="mailto:ridoymondol140@gmail.com">ridoymondol140@gmail.com</a>.
        </Typography>
      </Box>
    </Container>
  );
};

export default TermsOfService;
