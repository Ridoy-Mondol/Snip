"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
  Avatar,
  IconButton,
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  Popover,
  Box
} from "@mui/material";
import { FiMoreVertical, FiVolume2, FiVolumeX, FiPlay, FiPause } from "react-icons/fi";
import { MdMenuBook } from "react-icons/md";
import { getFullURL } from "@/utilities/misc/getFullURL";
import CircularLoading from "@/components/misc/CircularLoading";
import ProfileCard from "@/components/user/ProfileCard";
import { speakText } from "@/utilities/textToSpeech";

interface BlogPageParams {
  id: string;
}

export default function BlogPage({ params }: { params: BlogPageParams }) {
  const [blog, setBlog] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]); 
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredProfile, setHoveredProfile] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const router = useRouter();
  const { id } = params;

  const { token, isPending } = useContext(AuthContext);

  const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

  useEffect(() => {
    if (!id) return;

    async function fetchBlogData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/blogs/${id}`, {
          method: "GET",
        });
        const data = await response.json();
        if (data.success) {
          setBlog(data.blog);
          fetchRelatedBlogs(data.blog.category);
          setLoading(false);
        } else {
          console.error("Failed to fetch blog:", data.message);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }

    async function fetchRelatedBlogs(category: string) {
      try {
        setLoading(true);
        const response = await fetch(`${HOST_URL}/api/blogs`);
        const data = await response.json();
        if (data.success) {
          const filteredBlogs = data.blogs
            .filter((relatedBlog: any) => relatedBlog.category === category && relatedBlog.id !== blog.id);
          setRelatedBlogs(filteredBlogs);
          setLoading(false);
        } else {
          console.error("Failed to fetch related blogs:", data.message);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching related blogs:", error);
        setLoading(false);
      }
    }

    fetchBlogData();
  }, [id, blog?.id]); 

  const handleDelete = async (authorId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'AuthorId': `Bearer ${authorId}`,
        },
      });
  
      const data = await response.json();
      
      if (data.success) {
        console.log("Blog deleted successfully:", id);
        setConfirmationOpen(false);
        router.push("/blog");
        setLoading(false);
      } else {
        console.error("Failed to delete blog:", data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      setLoading(false);
    }
  };
  

  const calculateReadTime = (content: string) => {
    const words = content.split(" ").length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };
  

  const handleUpdate = () => {
    router.push(`/blog/update/${id}`);
    setMenuOpen(false);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
  };

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    username: string
  ) => {
    setHoveredProfile(username);
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleSpeech = (content: string) => {
    if (isSpeaking) {
      speechSynthesis.cancel(); 
      setIsSpeaking(false);
      setIsPaused(false);
    } else {
      speakText(content, setIsSpeaking, setIsPaused);
      setIsSpeaking(true);
    }
  };

  const pauseSpeech = () => {
    if (speechSynthesis.speaking) {
        speechSynthesis.pause();
        setIsPaused(true);
    } else {
        setIsPaused(false);
      }
  };
  
  const resumeSpeech = () => {
    speechSynthesis.resume();
    setIsPaused(false);
  };
  
  const stopSpeech = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };
  

  if (loading) {
    return <CircularLoading />;
  }

  if (!blog) {
    return <Typography variant="h6">Blog not found.</Typography>;
  }

  return (
    <Container disableGutters>
      <Card
        sx={{
          maxWidth: "100%",
          boxSizing: "border-box",
          padding: 0,
          backgroundColor: "transparent",
        }}
      >
        <CardMedia
          component="img"
          height="300"
          image={blog.imageUrl ? getFullURL(blog.imageUrl) : "/assets/default-blog.jpg"}
          alt="Blog Image"
          sx={{
            width: "100%",
            objectFit: "cover",
          }}
        />

        <CardContent sx={{ padding: "20px" }}>
          {/* Title */}
          <Typography variant="h4" gutterBottom style={{ fontWeight: 600 }}>
            {blog.title}
          </Typography>
          
          {/* Category */}
          <Typography
            variant="body2"
            sx={{
              display: "inline-block",
              padding: "4px 25px",
              backgroundColor: "#1976d2",
              color: "white",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              marginBottom: "12px",
            }}
          >
            {blog.category}
          </Typography>

          {/* Metadata */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            <span>
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span style={{ fontSize: "20px", fontWeight: "bold", margin: "0 8px" }}>·</span>
            <MdMenuBook size={16} style={{ marginRight: "0px" }} />
            <span>{calculateReadTime(blog.content)}</span>
          </Typography>

          {/* Author Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
              onMouseEnter={(e) => handlePopoverOpen(e, blog.author.username)}
              onMouseLeave={handlePopoverClose}
            >
              <Avatar
                alt={blog.author.username}
                src={blog.author.photoUrl ? getFullURL(blog.author.photoUrl) : "/assets/egg.jpg"}
                sx={{ width: 40, height: 40 }}
              />
              <Typography variant="h6">{blog.author.name}</Typography>
            </div>

            {token && token.id === blog.authorId && (
              <IconButton onClick={() => setMenuOpen(true)}>
                <FiMoreVertical size={24} />
              </IconButton>
            )}
          </div>

          {/* Blog Content */}
          <Typography
            variant="body1"
            component="div"
            color="text.secondary"
            paragraph
            style={{ marginTop: "20px" }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Listen Button & Back to Blogs Button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>          

          {isSpeaking ? (
            <>
              <IconButton
                color="error"
                onClick={stopSpeech}
                sx={{
                  backgroundColor: "#d32f2f",
                  color: "white",
                  "&:hover": { backgroundColor: "#c62828" },
                  width: 45,
                  height: 45,
                  borderRadius: "50%",
                }}
              >
                <FiVolumeX size={22} />
              </IconButton>

              {isPaused ? (
                <IconButton
                  color="primary"
                  onClick={resumeSpeech}
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": { backgroundColor: "#1565c0" },
                    width: 45,
                    height: 45,
                    borderRadius: "50%",
                  }}
                >
                  <FiPlay size={22} />
                </IconButton>
              ) : (
                <IconButton
                  color="secondary"
                  onClick={pauseSpeech}
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": { backgroundColor: "#1565c0" },
                    width: 45,
                    height: 45,
                    borderRadius: "50%",
                  }}
                >
                  <FiPause size={22} />
                </IconButton>
              )}
            </>
          ) : (
            <IconButton
              color="primary"
              onClick={() => handleSpeech(stripHtml(blog.content))}
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                "&:hover": { backgroundColor: "#1565c0" },
                width: 45,
                height: 45,
                borderRadius: "50%",
              }}
            >
              <FiVolume2 size={22} />
            </IconButton>
          )}

          <Button variant="outlined" color="primary" href={`/blog`}>
           Back to Blogs
          </Button>
          </Box>

        </CardContent>

        {/* Related Blogs Section */}
        <Typography variant="h5" gutterBottom sx={{ marginTop: "40px", padding: "20px", backgroundColor: "transparent" }}>
          Related Blogs
        </Typography>
        <Grid container spacing={3} sx={{ padding: "20px" }}>
          {relatedBlogs.length > 0 &&
            relatedBlogs.map((relatedBlog) => (
              <Grid item xs={12} sm={6} key={relatedBlog.id}>
                <Card
                  sx={{
                    position: "relative",
                    height: "300px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/blog/${relatedBlog.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="100%"
                    image={relatedBlog.imageUrl ? getFullURL(relatedBlog.imageUrl) : "/assets/default-blog.jpg"}
                    alt="Blog Image"
                    sx={{
                      objectFit: "cover",
                    }}
                  />
                  {/* Category */}
                  <Typography
                    variant="body2"
                    sx={{
                      display: "inline-block",
                      padding: "4px 25px",
                      backgroundColor: "#1976d2",
                      color: "white",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 500,
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                    }}
                  >
                    {relatedBlog.category}
                  </Typography>

                  <CardContent
                    sx={{
                      position: "absolute",
                      bottom: "0",
                      left: "0",
                      right: "0",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "15px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      {relatedBlog.title}
                    </Typography>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      <Avatar
                        alt={relatedBlog.author.username}
                        src={getFullURL(relatedBlog.author.photoUrl || "/assets/egg.jpg")}
                        sx={{ width: 30, height: 30 }}
                      />
                      <Typography variant="body2">{relatedBlog.author.name}</Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Card>

      {/* Menu Dialog */}
      <Dialog open={menuOpen} onClose={handleMenuClose}>
        <DialogTitle>Blog Options</DialogTitle>
        <DialogActions>
          <Button onClick={handleUpdate}>Update</Button>
          <Button onClick={() => setConfirmationOpen(true)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationOpen} onClose={handleConfirmationClose}>
        <DialogTitle>Are you sure you want to delete this blog?</DialogTitle>
        <DialogActions>
          <Button onClick={handleConfirmationClose}>Cancel</Button>
          <Button onClick={() => handleDelete (blog.author.authorId)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Popover
              sx={{
                pointerEvents: "none",
              }}
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              onClose={handlePopoverClose}
              disableRestoreFocus
            >
              <ProfileCard username={hoveredProfile} token={token} />
            </Popover>

    </Container>
  );
}
