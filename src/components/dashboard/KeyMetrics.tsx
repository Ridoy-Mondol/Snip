"use client"
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { FaUsers, FaUserCheck, FaUserShield } from "react-icons/fa";
import { AiOutlineClockCircle } from "react-icons/ai";

const metrics = [
  { title: "Council Members", value: "7", icon: <FaUsers /> },
  { title: "Elected Members", value: "5", icon: <FaUserCheck /> },
  { title: "Founding Members", value: "2", icon: <FaUserShield /> },
  { title: "Active Elections", value: "2", icon: <AiOutlineClockCircle /> },
];

export default function KeyMetrics() {
  return (
    <Grid container spacing={2}>
      {metrics.map((item, index) => (
        <Grid item xs={12} md={3} key={index}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5">{item.icon}</Typography>
              <Typography variant="h6">{item.value}</Typography>
              <Typography variant="body2" color="textSecondary">{item.title}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
