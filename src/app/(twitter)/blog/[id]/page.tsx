"use client";
import { Popover } from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../layout";
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
} from "@mui/material";
import { FiMoreVertical, FiFileText } from "react-icons/fi";
import { MdMenuBook } from "react-icons/md";
import { getFullURL } from "@/utilities/misc/getFullURL";
import CircularLoading from "@/components/misc/CircularLoading";
import ProfileCard from "@/components/user/ProfileCard";

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
  const router = useRouter();
  const { id } = params;

  const { token, isPending } = useContext(AuthContext);

  useEffect(() => {
    if (!id) return;

    async function fetchBlogData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/blogs/${id}`);
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
        const response = await fetch(`/api/blogs`);
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
          image={getFullURL(blog.imageUrl || "/assets/default-blog.jpg")}
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
            <span style={{ fontSize: "20px", fontWeight: "bold", margin: "0 8px" }}>·</span>
            <FiFileText size={16} style={{ marginRight: "0px" }} />
            <span>{1234} views</span>
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
                src={getFullURL(blog.author.photoUrl || "../../../../../public/assets/egg.jpg")}
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

          <Button
            variant="outlined"
            color="primary"
            sx={{ marginTop: "20px" }}
            href={`/blog`}
          >
            Back to Blogs
          </Button>
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
                    image={getFullURL(relatedBlog.imageUrl)}
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
                        src={getFullURL(relatedBlog.author.photoUrl || "/assets/default-avatar.jpg")}
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
