"use client";

import { Card, CardContent, CardHeader, Typography, Button, Grid, Box, Divider, useTheme } from "@mui/material";
import NextLink from "next/link";
import { FaRegClock } from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";


interface proposalsProps {
  proposals: any;
}

const formatTimeRemaining = (utcSeconds: number): string => {
  const now = Math.floor(Date.now() / 1000); 
  const remainingSeconds = utcSeconds - now;

  if (remainingSeconds <= 0) {
    const endedDate = new Date(utcSeconds * 1000);
    return `Ended on ${endedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  const days = Math.floor(remainingSeconds / (60 * 60 * 24));
  const hours = Math.floor((remainingSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  } else if (minutes > 0) {
    return `${minutes}m left`;
  } else {
    return `< 1m left`;
  }
};

export default function RecentProposals({ proposals }: proposalsProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        mx: "auto",
        boxShadow: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HiOutlineDocumentText size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
              Recent Proposals
            </Typography>
          </Box>
        }
        sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 0 }}>
        {proposals.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", color: theme.palette.text.secondary }}>
            <Typography variant="body1">No active elections at the moment.</Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem' }}>
              Check back later for new voting opportunities!
            </Typography>
          </Box>
        ) : (
          <Grid container direction="column">
            {proposals.slice(-2).map((proposal: any, index: number) => (
              <Grid item key={ index } sx={{ width: '100%' }}>
                <NextLink href={`/dao/proposals/${proposal.id}`} passHref style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      pr: 1.5,
                      cursor: "pointer",
                      transition: "background-color 0.2s ease-in-out",
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                        {proposal.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <FaRegClock size={14} style={{ marginRight: theme.spacing(0.5), color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatTimeRemaining(proposal.deadline)}
                        </Typography>
                      </Box>
                    </Box>
                    <Button variant="contained" size="small" sx={{ textTransform: "none" }}>
                      View
                    </Button>
                  </Box>
                </NextLink>
                {index < proposal.length - 1 && <Divider component="li" sx={{ ml: 2, mr: 2 }} />}
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}