import { Box, Card, CardContent, Typography } from '@mui/material';
export const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Box fontSize={32} color="primary.main">
          {icon}
        </Box>
        <Box>
          <Typography variant="h6">{label}</Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);
