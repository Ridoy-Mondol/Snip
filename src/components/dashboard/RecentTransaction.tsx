"use client";

import React from 'react';
import { Card, CardContent, CardHeader, Typography, Button, Grid, Box, Divider, useTheme } from "@mui/material";
import NextLink from "next/link";
import { FaRegClock } from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";

interface transactionProps {
  transaction: any;
}

function formatTime(utcSeconds: number): string {
  const date = new Date(utcSeconds * 1000);
  return date.toLocaleString("en-US", {
    month: "long", 
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function RecentTransaction({ transaction }: transactionProps) {
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
              Recent Transactions
            </Typography>
          </Box>
        }
        sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 0 }}>
        {transaction.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", color: theme.palette.text.secondary }}>
            <Typography variant="body1">No Transaction Recorded.</Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem' }}>
              Check back later for new transaction!
            </Typography>
          </Box>
        ) : (
          <Grid container direction="column">
            {transaction.slice(-2).map((transaction: any, index: number) => (
              <Grid item key={ index } sx={{ width: '100%' }}>
                <NextLink href={`/dao/community_wallet`} passHref style={{ textDecoration: 'none' }}>
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
                        {transaction.memo}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <FaRegClock size={14} style={{ marginRight: theme.spacing(0.5), color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(transaction.approvedAt)}
                        </Typography>
                      </Box>
                    </Box>
                    <Button variant="contained" size="small" sx={{ textTransform: "none" }}>
                      View
                    </Button>
                  </Box>
                </NextLink>
                {index < transaction.length - 1 && <Divider component="li" sx={{ ml: 2, mr: 2 }} />}
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}