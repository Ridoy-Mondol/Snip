// "use client"
// import { Card, CardContent, Grid, Typography, Avatar } from "@mui/material";
// import { FaUserTie, FaUserShield } from "react-icons/fa";

// const members = [
//   { name: "Alice Johnson", role: "Founding Member", icon: <FaUserShield />, performance: "Excellent" },
//   { name: "Bob Smith", role: "Elected Member", icon: <FaUserTie />, performance: "Good" },
//   { name: "Charlie Lee", role: "Elected Member", icon: <FaUserTie />, performance: "Moderate" },
// ];

// export default function CouncilMembers() {
//   return (
//     <Card>
//       <CardContent>
//         <Typography variant="h6">👥 Council Members</Typography>
//         <Grid container spacing={2}>
//           {members.map((member, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <Card variant="outlined">
//                 <CardContent style={{ textAlign: "center" }}>
//                   <Avatar sx={{ bgcolor: "#2196F3", margin: "auto" }}>{member.icon}</Avatar>
//                   <Typography variant="h6">{member.name}</Typography>
//                   <Typography variant="body2" color="textSecondary">{member.role}</Typography>
//                   <Typography variant="body2" color="green">Performance: {member.performance}</Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </CardContent>
//     </Card>
//   );
// }







"use client";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Box,
  Chip,
} from "@mui/material";
import { FaUserTie, FaUserShield } from "react-icons/fa";

const members = [
  { name: "Alice Johnson", role: "Founding Member", icon: <FaUserShield />, performance: "Excellent" },
  { name: "Bob Smith", role: "Elected Member", icon: <FaUserTie />, performance: "Good" },
  { name: "Charlie Lee", role: "Elected Member", icon: <FaUserTie />, performance: "Moderate" },
];

// Performance Colors
const performanceColors: Record<string, string> = {
  Excellent: "#4CAF50", // Green
  Good: "#FF9800", // Orange
  Moderate: "#F44336", // Red
};

export default function CouncilMembers() {
  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}>
          👥 Council Members
        </Typography>

        <Grid container spacing={2}>
          {members.map((member, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                variant="outlined"
                sx={{
                  textAlign: "center",
                  p: 2,
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)", boxShadow: 4 },
                }}
              >
                {/* Avatar with Gradient Background */}
                <Avatar
                  sx={{
                    bgcolor: "linear-gradient(135deg, #4C7CF3 30%, #45A5F7 90%)",
                    width: 56,
                    height: 56,
                    fontSize: 28,
                    margin: "auto",
                    mb: 1,
                  }}
                >
                  {member.icon}
                </Avatar>

                {/* Member Name & Role */}
                <Typography variant="h6" fontWeight="bold">
                  {member.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {member.role}
                </Typography>

                {/* Performance Indicator */}
                <Box mt={1}>
                  <Chip
                    label={`Performance: ${member.performance}`}
                    sx={{
                      backgroundColor: performanceColors[member.performance],
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
