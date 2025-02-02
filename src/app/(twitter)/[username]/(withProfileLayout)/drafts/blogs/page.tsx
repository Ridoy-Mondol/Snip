"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { getDraftBlogs } from "@/utilities/fetch";
import { AuthContext } from "@/context/AuthContext";
import { getFullURL } from "@/utilities/misc/getFullURL";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Box,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
} from "@mui/material";
import { FiMoreVertical } from "react-icons/fi";
import { format } from "date-fns";
import { PATCH } from "@/app/api/users/playerId/create/route";

interface Blog {
  id: string;
  title: string;
  content?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  scheduledAt?: Date | null;
  authorId: string;
}

const DraftsBlog = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { token } = useContext(AuthContext);
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<string>("");

  useEffect(() => {
    async function fetchBlogs() {
      if (!token?.id) {
        setError("You are not authorized to visit it.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await getDraftBlogs(token.id);
        if (response.success) {
          setBlogs(response.blogs);
        } else {
          setError(response.message || "Failed to fetch blogs.");
        }
      } catch (error) {
        setError("Error fetching blogs.");
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, [token]);

  const removeHTMLTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // Handle menu open
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, blog: Blog) => {
    setAnchorEl(event.currentTarget);
    setSelectedBlog(blog);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Open confirmation modal
  const handleActionClick = (action: string) => {
    if (action === "update" && selectedBlog) {
      router.push(`/blog/update/${selectedBlog?.id}`);
    } else {
    setModalAction(action);
    setOpenModal(true);
    }
    handleMenuClose();
  };

  // Handle action (Update, Delete, Publish)
  const handleConfirmAction = () => {
    if (modalAction === "delete" && selectedBlog) {
        handleDelete();
    } else if (modalAction === "publish" && selectedBlog) {
        handlePublish(selectedBlog.authorId);
    } 
    setOpenModal(false);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/delete/${selectedBlog?.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      
      if (data.success) {
        window.location.reload();
      } else {
        console.error("Failed to delete blog:", data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      setLoading(false);
    }
  };

  const handlePublish = async (authorId: string) => {
      try {
        setLoading(true);
        const response = await fetch("/api/blogs/draft/publish", {
            method: "PATCH",
            headers: {
              'Content-Type': 'application/json',
              'authorId': authorId || "",
              'blogId': selectedBlog?.id || "",
            }
        });

        const data = await response.json();

        if (data.success) {
          router.push(`/blog/${selectedBlog?.id}`);
        } else {
          console.error("Failed to delete blog:", data.message)
          setLoading(false);
        }
      } catch(error) {
        console.error("Error publishing blog:", error);
        setLoading(false);
      }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          {[...Array(6)].map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={6}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" height={30} />
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="100%" height={60} />
                  <Skeleton variant="text" width="50%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {blogs.length === 0 ? (
        <Typography variant="body1" align="center">
          No draft blogs found.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {blogs.map((blog) => (
            <Grid item key={blog.id} xs={12} sm={6} md={6}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                
                {/* Three dots menu */}
                <IconButton
                  aria-label="settings"
                  onClick={(event) => handleMenuClick(event, blog)}
                  sx={{ position: "absolute", top: 8, right: 8 }}
                >
                  <FiMoreVertical />
                </IconButton>

                {/* Dropdown menu */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} sx={{ 
                "& .MuiPaper-root": { width: 150 } 
                }}>
                  <MenuItem onClick={() => handleActionClick("update")}>Update</MenuItem>
                  <MenuItem onClick={() => handleActionClick("delete")}>Delete</MenuItem>
                  {selectedBlog &&
                   selectedBlog.title &&
                   selectedBlog.content &&
                   selectedBlog.category &&
                   selectedBlog.imageUrl && (
                     <MenuItem onClick={() => handleActionClick               ("publish")}>Publish</MenuItem>
                 )}
                </Menu>

                {blog.imageUrl ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={getFullURL(blog.imageUrl)}
                    alt={blog.title}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      backgroundColor: "action.hover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No Image
                    </Typography>
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {blog.title}
                  </Typography>

                  {blog.category ? (
                    <Chip label={blog.category} size="medium" sx={{ mb: 1, color: "#4CAF50", fontWeight: 600 }} />
                  ) : (
                    <Chip label="Not Selected" size="medium" sx={{ mb: 1, color: "#FF5722", fontWeight: 500 }} />
                  )}
                  
                  {blog.content ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    paragraph
                    dangerouslySetInnerHTML={{
                      __html: removeHTMLTags(blog.content || "").substring(0, 100) + "...",
                    }}
                  ></Typography>
                  ) : (
                    <Typography
                    variant="body2"
                    color="text.secondary"
                    paragraph
                    >
                      No Content Available...
                    </Typography>
                  )}

                  {blog.scheduledAt ? (
                    <Typography variant="caption" color="text.secondary">
                      Scheduled for: {format(new Date(blog.scheduledAt), "PPp")}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Not scheduled.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Confirmation Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>
          Are you sure you want to {modalAction} this blog?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DraftsBlog;
