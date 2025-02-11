"use client";

import { useState, useEffect, useContext } from "react";
import { 
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  Typography, 
} from "@mui/material";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaRegImage, FaRegSmile } from "react-icons/fa";
import { AiFillAudio, AiOutlineStop } from "react-icons/ai";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import CircularLoading from "@/components/misc/CircularLoading";
import { updateBlog, publishBlog } from "@/utilities/fetch";
import Uploader from "@/components/misc/Uploader";
import { uploadFile } from "@/utilities/storage";
import ProgressCircle from "@/components/misc/ProgressCircle";
import { AuthContext } from "@/context/AuthContext";
import { Editor } from "@tinymce/tinymce-react";
import { ThemeContext } from "@/app/providers";
import useSpeechToText from "@/hooks/useSpeechInput";

export default function UpdateBlogPage({ params }: { params: { id: string } }) {
  const [showPicker, setShowPicker] = useState(false);
  const [showDropzone, setShowDropzone] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);
  const [blog, setBlog] = useState<any>(null);
  const [isLoading, setLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"publish" | "update">("update");
  const [isSchedule, setIsSchedule] = useState<"false" | "true">("false");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listeningField, setListeningField] = useState<"title" | "content" | null>(null);

  const { token, isPending } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { theme } = useContext(ThemeContext);

  const { transcript, listening, startListening, stopListening, isSupported } = useSpeechToText();

  const { id: blogId } = params;

  // Fetch blog data
  useEffect(() => {
    async function fetchBlogData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/blogs/${blogId}`);
        const data = await response.json();
        if (data.success) {
          setBlog(data.blog);
        } else {
          console.error("Failed to fetch blog:", data.message);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogData();
  }, [blogId]);

  // Mutation to update the blog
  const mutation = useMutation({
    mutationFn: updateBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      if (blog?.status === "draft") {
        window.location.href = `${token?.username}/drafts/blogs`;
      }
      window.location.href = `/blog/${blogId}`;
    },
    onError: (error) => {
      console.error("Failed to update blog:", error);
      setLoading(false);
    },
  });

  // Mutation to publish the blog
  const publishMutation = useMutation({
    mutationFn: publishBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publish"] });
      window.location.href = `/blog/${blogId}`;
    },
    onError: (error) => {
      console.error("Failed to publish blog:", error);
      setLoading(false);
    },
  });

  // Handle photo upload
  const handlePhotoChange = (file: File) => {
    if (file.size > 1048576) {
      alert("The image size should not exceed 1MB.");
      return;
    }
    setPhotoFile(file);
    setImageError(null);
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      title: blog?.title || "",
      category: blog?.category || "",
      content: blog?.content || "",
      photoUrl: blog?.photoUrl || "",
      schedule: blog?.scheduledAt || "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const updateData: {
        id: string;
        title?: string;
        category?: string;
        content?: string;
        authorId: string;
        photoUrl?: string;
        schedule?: string;
      } = {
        id: blogId,
        authorId: token?.id || "",
      };

      if (values.title) updateData.title = values.title;
      if (values.category) updateData.category = values.category;
      if (values.content) updateData.content = values.content;
      if (values.schedule) updateData.schedule = values.schedule;

      if (photoFile) {
        setLoading(true);
        const path = await uploadFile(photoFile);
        if (!path) {
          console.error("Error uploading image to Supabase.");
          setLoading(false);
          return;
        }
        updateData.photoUrl = path;
        setPhotoFile(null);
      }

      try {
        setLoading(true);
        if (actionType === "publish") {
          publishMutation.mutateAsync(updateData);
        } else {
          await mutation.mutateAsync(updateData);
        }
        setCount(0);
        setShowDropzone(false);
      } catch (error) {
        console.error("Failed to update blog:", error);
        setLoading(false);
      }
    },
  });

  const handleUpdate = () => {
     if (blog.status === "draft") {
       setIsModalOpen(true);
     } else {
       setActionType("update");
       formik.handleSubmit();
     }
  }

  const handleStartListening = (fieldName: "title" | "content") => {
    if (!isSupported) {
      return (
        alert("Your browser do not support speechRecognition")
      )
    }
    setListeningField(fieldName);
    startListening((newTranscript) => {
      if (fieldName === "title") {
        formik.setFieldValue(fieldName, formik.values.title ? formik.values.title + " " + newTranscript : newTranscript);
      } else if (fieldName === "content") {
        formik.setFieldValue(fieldName, formik.values.content ? formik.values.content + " " + newTranscript : newTranscript);
      }
    });
  };

  const handleStopListening = () => {
      stopListening();
      setListeningField(null);
  };

  // Handle text change
  const customHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const plainText = inputValue.replace(/<[^>]*>?/gm, "").replace(/\s+/g, "");
    setCount(plainText.length);
    formik.handleChange(e);
  };

  // Handle editor change
  const handleEditorChange = (content: string) => {
    const plainText = content.replace(/<[^>]*>?/gm, "").replace(/\s+/g, "");
    setCount(plainText.length);
    formik.setFieldValue("content", content);
  };

  // Loading state
  if (isPending || isLoading || !token) {
    return <CircularLoading />;
  }

  return (
    <main>
      <h1 className="page-name">Update Blog</h1>
      <div className="new-blog-form" style={{ padding: "20px" }}>
        <form onSubmit={formik.handleSubmit}>
          <div className="input">
            <TextField
              label="Title"
              variant="standard"
              fullWidth
              name="title"
              value={formik.values.title}
              onChange={customHandleChange}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() =>
                      (listeningField === "title" && listening) ? handleStopListening() : handleStartListening("title")
                    }
                    color={(listeningField === "title" && listening) ? "secondary" : "primary"}
                  >
                    {(listeningField === "title" && listening) ? <AiOutlineStop size={20} /> : <AiFillAudio size={20} />}
                  </Button>
                ),
              }}
            />
          </div>

          <div className="input">
            <TextField
              select
              label="Category"
              variant="standard"
              fullWidth
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              error={formik.touched.category && Boolean(formik.errors.category)}
              helperText={
                formik.touched.category &&
                typeof formik.errors.category === "string"
                  ? formik.errors.category
                  : ""
              }
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                    },
                  },
                },
              }}
            >
              {["Sports", "Technology", "Health", "Education", "Entertainment"].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="input">
            <p
              style={{
                margin: "10px 0",
                fontSize: "16px",
                color: theme === "dark" ? "gray" : "#1e1e1e",
              }}
            >
              Content
            </p>
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              value={formik.values.content}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  "link",
                  "image",
                  "lists",
                  "code",
                  "emoticons",
                  "table",
                  "media",
                  "fullscreen",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "wordcount",
                  "insertdatetime",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table emoticons | code fullscreen preview | insertdatetime | searchreplace",
                content_style: `
                  body {
                    background-color: ${theme === "dark" ? "black" : "white"} !important;
                    color: ${theme === "dark" ? "white" : "black"};
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                  }
                `,
                skin: theme === "dark" ? "oxide-dark" : "oxide",
                content_css: theme === "dark" ? "dark" : "",
                branding: false,
              }}
              onEditorChange={handleEditorChange}
            />

            <Button
            onClick={() => {
              if (listeningField === "content" && listening) {
                handleStopListening();
              } else {
                handleStartListening("content");
              }
            }}
            color={(listeningField === "content" && listening) ? "secondary" : "primary"}
           >
             {(listeningField === "content" && listening) ? <AiOutlineStop size={20} /> : <AiFillAudio size={20} />}
            </Button>

          </div>

          <div className="input-additions">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowDropzone(true);
              }}
              className="icon-hoverable"
            >
              <FaRegImage />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowPicker(!showPicker);
              }}
              className="icon-hoverable"
            >
              <FaRegSmile />
            </button>
            <ProgressCircle maxChars={5000} count={count} />
            
            {
            (blog?.status === "draft" && (blog.title || formik.values.title) && (blog.category || formik.values.category) && (blog.content || formik.values.content) && (blog.imageUrl || photoFile)) &&
            <button
              className={`btn ${formik.isValid ? "" : "disabled"}`}
              disabled={!formik.isValid}
              type="submit"
              onClick={() => {
                setActionType("publish");
                setIsSchedule("false");
                formik.handleSubmit()
              }}
            >
              Publish
            </button>
            }
            <button className="btn" type="button" onClick={handleUpdate}>
              Update
            </button>
          </div>

          {/* Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Schedule Draft
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Choose when you&apos;d like the blog to be published.
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="schedule-select-label">Publish Time</InputLabel>
            <Select
              labelId="schedule-select-label"
              name="schedule"
              value={formik.values.schedule}
              onChange={formik.handleChange}
            > 
              <MenuItem value="1h">1 Hour later</MenuItem>
              <MenuItem value="2h">2 Hours later</MenuItem>
              <MenuItem value="5h">5 Hours later</MenuItem>
              <MenuItem value="10h">10 Hours later</MenuItem>
              <MenuItem value="1D">1 Day later</MenuItem>
              <MenuItem value="7D">7 Days later</MenuItem>
              <MenuItem value="Never">Never</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            disabled={!formik.values.schedule}
            type="submit"
            onClick={() => {
              setActionType("update");
              setIsSchedule("true");
              formik.handleSubmit();
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      )}

          {showPicker && (
            <div className="emoji-picker">
              <Picker
                data={data}
                onEmojiSelect={(emoji: any) => {
                  formik.setFieldValue("content", formik.values.content + emoji.native);
                  setShowPicker(false);
                  setCount(count + emoji.native.length);
                }}
                previewPosition="none"
              />
            </div>
          )}

          {showDropzone && <Uploader handlePhotoChange={handlePhotoChange} />}
        </form>
      </div>
    </main>
  );
}
