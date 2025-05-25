import { useRouter } from "next/navigation";
import {
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Box,
  Button,
} from "@mui/material";
import { FaCaretRight } from "react-icons/fa";
import { MdGavel } from "react-icons/md";
import { MdGroups } from "react-icons/md";

type Member = {
  winner: string;
  photoUrl?: string;
  isFoundingMember: boolean;
  rank: number;
  electionName: string;
};

type Props = {
  members: Member[];
  permission?: boolean;
  getFullURL: (path: string) => string;
  setShowRecallForm: (show: boolean) => void;
  setRecalledMember: (member: string) => void;
  setRecalledMod: (mod: string) => void;
  setRecalledElection: (election: string) => void;
};

const Members = ({
  members,
  permission = false,
  getFullURL,
  setShowRecallForm,
  setRecalledMember,
  setRecalledMod,
  setRecalledElection,
}: Props) => {
  const router = useRouter();

  if (!members?.length) {
    return (
      <Paper sx={{ p: 4, textAlign: "center", my: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <MdGroups size={60} color="#ccc" />
          <Typography variant="h6" color="textSecondary">
            No council members found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Once elected or added, council members will appear here.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Council Overview
      </Typography>
      <Paper sx={{ mb: 2, p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Profile</TableCell>
                {permission && <TableCell>Recall</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {members
                .slice()
                .sort((a, b) => a.rank - b.rank)
                .map((member, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar src={member.photoUrl && getFullURL(member.photoUrl)} />
                        {member.winner}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {member.isFoundingMember ? "Founder" : "Elected"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FaCaretRight />}
                        onClick={() =>
                          router.push(`/dao/council_members/${member.winner}`)
                        }
                      >
                        Visit
                      </Button>
                    </TableCell>
                    {permission && (
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<MdGavel />}
                          onClick={() => {
                            setShowRecallForm(true);
                            setRecalledMember(member.winner);
                            setRecalledMod("");
                            setRecalledElection(member.electionName);
                          }}
                        >
                          Initiate
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
};

export default Members;
