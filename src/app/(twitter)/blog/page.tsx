"use client";
import { useEffect, useState, useContext } from "react";
import { Popover } from "@mui/material";
import Link from "next/link";
import { motion } from "framer-motion";
import { getFullURL } from "@/utilities/misc/getFullURL";
import ProfileCard from "@/components/user/ProfileCard";
import { Card, CardMedia, Typography, Container } from "@mui/material";
import { MdArrowForward } from "react-icons/md";
import { AuthContext } from "../layout";
import CircularLoading from "@/components/misc/CircularLoading";

interface BlogProps {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    username: string;
    name: string;
    photoUrl: string | null;
    isPremium: boolean;
  };
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogProps[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredProfile, setHoveredProfile] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      const response = await fetch("/api/blogs");
      const data = await response.json();
      if (data.success) {
        setBlogs(data.blogs);
        setLoading(false);
      }
      setLoading(false);
    }

    fetchBlogs();
  }, []);

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

  const removeHTMLTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  if (loading) {
    return <CircularLoading />;
  }

  return (
    <div className="blog-page" style={{ width: "100%" }}>
      <h1 className="page-name">Blog</h1>
      <Container>
        {blogs.map((blog) => (
          <motion.div
            key={blog.id}
            className="blog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ marginTop: "20px" }}
          >
            <Card
              sx={{
                width: "100%",
                padding: 2,
                boxSizing: "border-box",
                backgroundColor: "transparent",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Link href={`/blog/${blog.id}`} style={{ textDecoration: "none" }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={getFullURL(blog.imageUrl || "../../../../public/assets/egg.jpg")}
                  alt="Blog Image"
                  sx={{ borderRadius: 2 }}
                />
              </Link>
              <button
                className="btn btn-tweet"
                style={{
                  margin: "15px 0",
                  borderRadius: "6px",
                  padding: "10px 35px",
                  textTransform: "uppercase",
                }}
              >
                {blog.category}
              </button>
              <Typography variant="h5" gutterBottom>
                {blog.title}
              </Typography>

              <div
                className="d-flex"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "start",
                  gap: "40px",
                  margin: "15px 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => handlePopoverOpen(e, blog.author.username)}
                  onMouseLeave={handlePopoverClose}
                >
                  <img
                    src={getFullURL(blog.author.photoUrl || "/assets/egg.jpg")}
                    alt={blog.author.username}
                    width={30}
                    height={30}
                    style={{ borderRadius: "50%" }}
                  />
                  <Typography variant="subtitle2">{blog.author.username}</Typography>
                </div>
                <Typography variant="caption" color="text.secondary">
                  {new Date(blog.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  4 min read
                </Typography>
              </div>

              <Typography
                variant="body1"
                component="p"
                color="text.secondary"
                dangerouslySetInnerHTML={{
                  __html: removeHTMLTags(blog.content).substring(0, 100) + "..."
                }}
                style={{ margin: "20px 0" }}
              />

              <Link href={`/blog/${blog.id}`} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Typography variant="body1" component="p">
                  View Post
                </Typography>
                <MdArrowForward
                  size={16}
                  style={{
                    transform: "rotate(-45deg) scale(1.25, 1.25)",
                    marginBottom: "2px",
                  }}
                />
              </Link>
            </Card>

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
          </motion.div>
        ))}
      </Container>
    </div>
  );
}
