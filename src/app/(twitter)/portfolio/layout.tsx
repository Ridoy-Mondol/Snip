"use client"
import { Box, Typography, Container, Divider } from "@mui/material";
import { MdShowChart } from "react-icons/md";

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      {/* Header Section */}
      <Container sx={{ py: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <MdShowChart size={32} color="#1976d2" /> {/* Main Portfolio Icon */}
          <Typography variant="h5" fontWeight="bold">
            Portfolio
          </Typography>
        </Box>
      </Container>

      {/* Divider for clean separation */}
      <Divider />

      {/* Content Section */}
      <Container sx={{ mt: 3 }}>{children}</Container>
    </Box>
  );
}
