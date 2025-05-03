"use client";

import React, {useState, useEffect, useContext} from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CardMedia,
  Divider,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
} from "@mui/material";
import { FiAlertTriangle } from "react-icons/fi";
import { grey, red, blue } from "@mui/material/colors";

import { AuthContext } from "@/context/AuthContext";
import { TweetProps } from "@/types/TweetProps";
import { getFullURL } from "@/utilities/misc/getFullURL";
import CircularLoading from "@/components/misc/CircularLoading";
import { SnackbarProps } from "@/types/SnackbarProps";
import CustomSnackbar from "@/components/misc/CustomSnackbar";

export default function HiddenPage() {
  const [hiddenPosts, setHiddenPosts] = useState<TweetProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAppealDialogOpen, setIsAppealDialogOpen] = useState (false);
  const [reason, setReason] = useState ("");
  const [postId, setPostId] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token?.id) return;
    const fetchHiddenPosts = async () => {
      try {
        const res = await fetch("/api/tweets/hidden/get", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            userId: token.id,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch hidden posts");

        const data = await res.json();
        setHiddenPosts(data.hiddenPosts);
      } catch (err) {
        console.error("Error fetching hidden posts:", err);
      } finally {
        setLoading(false);
      }
    };
     
    fetchHiddenPosts();
  }, [token])

  const submitAppeal = async () => {
    if (!reason) return;
    setLoading (true)
    try {
      const res = await fetch("/api/appeal/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, reason }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setIsAppealDialogOpen(false);
        setSnackbar({
          message: data.message || "Failed to submit appeal.",
          severity: "error",
          open: true,
        })
        throw new Error(data.message || "Failed to submit appeal.");
      }
  
      console.log("Appeal submitted successfully:", data);
      setIsAppealDialogOpen(false);
      setSnackbar({
        message: data.message || "Appeal submitted successfully.",
        severity: "success",
        open: true,
      })
      return data;
    } catch (error) {
      console.error("Error in submitAppeal:", error);
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <CircularLoading />

  if (hiddenPosts.length == 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, }}>
          <Typography variant="subtitle1" color="text.secondary" fontWeight="500" gutterBottom>
            No Hidden Posts Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            It seems there are currently no posts that have been hidden from public view.
          </Typography>
        </Paper>
    )
  }

  return (
    <Box sx={{ px: 3, py: 4, borderRadius: 2 }}>
      <Typography variant="h4" fontWeight={700} color={red[700]} gutterBottom>
        <Box display="flex" alignItems="center">
          <FiAlertTriangle size={28} style={{ marginRight: 12 }} />
          Hidden Posts
        </Box>
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        These posts have been temporarily hidden from public view as they may violate our community guidelines. You have the option to submit an appeal for review.
      </Typography>

      {hiddenPosts.map((post) => (
        <Paper
          key={post.id}
          elevation={3}
          sx={{
            mb: 3,
            p: 3,
            borderRadius: 2,
            borderLeft: `6px solid ${red[500]}`,
            transition: "transform 0.15s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            },
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <FiAlertTriangle size={20} color={red[500]} style={{ marginRight: 8 }} />
            <Typography fontWeight={600} color="error">
              Reported Content
            </Typography>
          </Box>

          {post.isPoll && (
            <Chip
              label="Poll"
              color="info"
              size="small"
              variant="outlined"
              sx={{ mb: 1 }}
            />
          )}

          {post.isPoll ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                Poll Question:
              </Typography>
              <Typography variant="body1" fontWeight={500} lineHeight={1.6}>
                {post.text}
              </Typography>
            </Box>
          ) : (
            <Box>
              {post.text && (
                <Typography
                  variant="body1"
                  fontWeight={500}
                  lineHeight={1.6}
                  mb={post.photoUrl ? 2 : 0}
                >
                  {post.text}
                </Typography>
              )}
              {post.photoUrl && (
                <CardMedia
                  component="img"
                  src={post.photoUrl.startsWith("http://") || post.photoUrl.startsWith("https://") ? post.photoUrl : getFullURL(post.photoUrl)} 
                  alt="Image"
                  sx={{
                    mt: 1,
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.04)",
                  }}
                />
              )}
            </Box>
          )}

          <Divider sx={{ my: 2, borderColor: grey[300] }} />

          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Tooltip title="Appeal to moderators for review">
              <Button
                variant="contained"
                sx={{
                  bgcolor: blue[600],
                  "&:hover": { bgcolor: blue[700] },
                  fontWeight: 600,
                }}
                onClick={() => {
                  setIsAppealDialogOpen(true);
                  setPostId(post.id)
                }}
              >
                Submit Appeal
              </Button>
            </Tooltip>
          </Box>
        </Paper>
      ))}

      {/* Appeal Dialog */}
      <Dialog open={isAppealDialogOpen} onClose={() => setIsAppealDialogOpen (false)} fullWidth maxWidth="sm" sx={{p: 2}}>
      <DialogTitle>Submit an Appeal for This Hidden Post</DialogTitle>
            
      <DialogContent>
      <Stack spacing={2} mt={1}>
          <TextField
          margin="dense"
          label="Why doesn't this post break the rules?"
          fullWidth
          multiline
          minRows={4} 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          />
      </Stack>
      </DialogContent>
    
      <DialogActions>
          <Button onClick={() => setIsAppealDialogOpen(false)}>Cancel</Button>
          <Button color="secondary" disabled={!reason} onClick={submitAppeal}>
          Submit
          </Button>
      </DialogActions>
      </Dialog>

      {snackbar.open && (
        <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
      )}

    </Box>
  );
}