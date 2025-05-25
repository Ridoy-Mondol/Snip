import { Box, Grid, Typography } from '@mui/material';

interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <Grid item xs={12}>
      <Box
        sx={{
          textAlign: 'center',
          mt: 4,
          p: 3,
          border: '1px dashed #ccc',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Grid>
  );
};

export default EmptyState;
