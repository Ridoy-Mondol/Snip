"use client"
import { Typography, Container, useTheme } from "@mui/material";

export default function DaoHeader() {
  const theme = useTheme();

  return (
    <Container maxWidth="md" disableGutters sx={{ textAlign: "left" }}>
      <Typography
        variant="h3"
        component="h1"
        fontWeight={700}
        sx={{
          color: theme.palette.primary.main,
          mb: 1.5,
          letterSpacing: '-0.02em',
          fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
        }}
      >
        <span role="img" aria-label="governance-icon">🏛️</span> Snipverse DAO
      </Typography>
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          mb: { xs: 3, md: 4 },
          fontWeight: 400,
          lineHeight: 1.5,
          maxWidth: 700,
          mx: 'auto',
          fontSize: { xs: '1rem', sm: '1.25rem' },
        }}
      >
        Empowering the Snipverse community through transparent and decentralized governance.
        Your voice shapes the future.
      </Typography>
    </Container>
  );
}