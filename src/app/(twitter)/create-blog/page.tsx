"use client";
import { useState, useContext, useEffect } from "react";
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
  Modal,
  Box,
  CircularProgress,
  IconButton,

} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaRegImage, FaRegSmile } from "react-icons/fa";
import { AiFillAudio, AiOutlineStop, AiOutlineRobot } from "react-icons/ai";
import { MdAutoAwesome, MdClose } from "react-icons/md";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import CircularLoading from "@/components/misc/CircularLoading";
import { createBlog, draftBlog } from "@/utilities/fetch";
import Uploader from "@/components/misc/Uploader";
import { uploadFile } from "@/utilities/storage";
import ProgressCircle from "@/components/misc/ProgressCircle";
import { AuthContext } from "@/context/AuthContext";
import { Editor } from "@tinymce/tinymce-react";
import { ThemeContext } from "@/app/providers";
import { SnackbarProps } from "@/types/SnackbarProps";
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import useSpeechToText from "@/hooks/useSpeechInput";

export default function CreateBlogPage() {
  const [showPicker, setShowPicker] = useState(false);
  const [showDropzone, setShowDropzone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"publish" | "draft">("publish");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });
  const [listeningField, setListeningField] = useState<"title" | "content" | null>(null);


  const { token, isPending } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const queryClient = useQueryClient();
  const { listening, startListening, stopListening, isSupported } = useSpeechToText();

  const mutation = useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      window.location.href = "/blog";
    },
    onError: (error) => {
      console.error(error);
      setLoading(false);
    },
  });
  
  const draftMutation = useMutation({
    mutationFn: draftBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      setSnackbar({
        message: "Blog saved successfully to draft.",
        severity: "success",
        open: true,
    });
    },
    onError: (error) => {
      console.error(error);
      setSnackbar({
        message: "Failed to save draft.",
        severity: "error",
        open: true,
      });
      setLoading(false);
    },
  });
  
  const handlePhotoChange = (file: File) => {
    if (file.size > 1048576) {
      setImageError("The image size should not exceed 1MB.");
      return;
    }
    setPhotoFile(file);
    setImageError(null);
  };
  
  const validationSchema = yup.object({
    title: yup
      .string()
      .required("Title is required.")
      .max(255, "Title should be of maximum 255 characters length."),
    category: yup.string().when("actionType", {
      is: "publish",
      then: (schema) => schema.required("Category is required"),
      otherwise: (schema) => schema.optional(),
    }),
    content: yup.string().when("actionType", {
      is: "publish",
      then: (schema) => schema.required("Content cannot be empty"),
      otherwise: (schema) => schema.optional(),
    }),
    photoUrl: yup.string().when("actionType", {
      is: "publish",
      then: (schema) =>
        schema.required("Image is required").url("Invalid image URL."),
      otherwise: (schema) => schema.optional(),
    }),
  });
  
  const formik = useFormik({
    initialValues: {
      title: "",
      category: "",
      content: "",
      photoUrl: "",
      schedule: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!token?.id) {
        console.error("Author ID is missing.");
        return;
      }
  
      // Handle image upload if a file is selected
      if (photoFile) {
        try {
          const path = await uploadFile(photoFile);
          if (!path) {
            setImageError("Error uploading image. Please try again.");
            return;
          }
          values.photoUrl = path; 
          setPhotoFile(null);
          setImageError(null);
        } catch (error) {
          setImageError("Error uploading image. Please try again.");
          return;
        }
      } else if (actionType === "publish" && !values.photoUrl) {
        setImageError("Please upload an image.");
        return;
      }
  
      if (actionType === "draft") {
        values.photoUrl = values.photoUrl || "";
      }
  
      const blogData = { ...values, authorId: token.id };
  
      try {
        setLoading(true);
        if (actionType === "publish") {
          await mutation.mutateAsync(blogData);
        } else if (actionType === "draft") {
          await draftMutation.mutateAsync(blogData);
        }
  
        resetForm();
        setCount(0);
        setShowDropzone(false);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to submit blog:", error);
      } finally {
        setLoading(false);
        setIsModalOpen(false);
      }
    },
  });  

  const handleDraftClick = () => {
      if (formik.values.title && formik.values.category && formik.values.content && photoFile) {
        setIsModalOpen(true); 
      } else {
        setActionType("draft");
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

  const customHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const plainText = inputValue
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, "");
    setCount(plainText.length);
    formik.handleChange(e);
  };

  const handleEditorChange = (content: string) => {
    const plainText = content
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, "");
    setCount(plainText.length);
    formik.setFieldValue("content", content);
  };

  useEffect(() => {
    setPrompt(formik.values.title);
  }, [formik.values.title]);
  
  const handleClose = () => {
    setShowPrompt(false); 
  };

  const handleGenerateContent = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate_blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
         setLoading(false);
         setSnackbar({
          message: `AI is unable to process this request`,
          severity: "error",
          open: true,
         })
         return
      }
      const data = await res.json();
      const generatedBlog = data.text?.trim();
      
      if (generatedBlog == 'no') {
        setLoading(false);
        setSnackbar({
          message: "This is not a valid prompt to generate blog",
          severity: 'error',
          open: true,
        })
        return;
      } else {
        formik.setFieldValue(
          'content', generatedBlog,
        )
        setLoading(false);
        setShowPrompt(false);
        setPrompt("");
        return;
      } 
      
    } catch (error) {
      console.error("Error generating content:", error);
    }
    setLoading(false);
  };

  if (isPending || !token || loading) {
    return <CircularLoading />;
  }

  if (imageError) {
    return (
      <h1>{imageError}</h1>
    )
  }

  return (
    <main>
      <h1 className="page-name">Create Blog</h1>
      <div className="new-blog-form" style={{ padding: "20px" }}>
        <form onSubmit={formik.handleSubmit}>
          {/* Title Input */}
          <div className="input">
            <TextField
              label="Title"
              variant="standard"
              fullWidth
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
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

          {/* Category Selector */}
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
              helperText={formik.touched.category && formik.errors.category}
              SelectProps={{
                MenuProps: {
                  PaperProps: { style: { maxHeight: 200 } },
                },
              }}
            >
              {["Sports", "Technology", "Health", "Education", "Entertainment"].map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                )
              )}
            </TextField>
          </div>

          {/* Content Editor */}
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
            {formik.touched.content && formik.errors.content && (
              <div className="error">{formik.errors.content}</div>
            )}

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

          {/* Input Additions */}
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
                setShowPrompt(!showPrompt);
              }}
              className="icon-hoverable"
            >
              <MdAutoAwesome />
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
            <button
              className={`btn ${formik.isValid ? "" : "disabled"}`}
              disabled={!formik.isValid}
              type="button"
              onClick={handleDraftClick}
            >
              Draft
            </button>
            <button
              className={`btn ${formik.isValid ? "" : "disabled"}`}
              disabled={!formik.isValid}
              type="submit"
              onClick={() => {
                setActionType("publish");
                formik.handleSubmit()
              }}
            >
              Publish
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
              setActionType("draft");
              formik.handleSubmit();
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      )}

      {/* Modal for AI Content Generation */}
      <Modal open={showPrompt} onClose={handleClose}>
        <Box
          sx={{
            width: 450,
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
            mx: "auto",
            mt: "15%",
            outline: "none",
            bgcolor: theme === "dark" ? "rgba(30, 30, 30, 0.9)" : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
            transition: "all 0.3s ease-in-out",
          }}
        >
        {/* Modal Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: theme === "dark" ? "rgba(50, 50, 50, 0.6)" : "rgba(240, 240, 240, 0.6)",
            boxShadow: theme === "dark" ? "0 4px 8px rgba(0,0,0,0.2)" : "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          <AiOutlineRobot size={24} style={{ marginRight: "8px", color: theme === "dark" ? "#4FC3F7" : "#007BFF" }} />
            AI Blog Generator
        </Typography>
        <IconButton onClick={handleClose}
        sx={{ color: theme === "dark" ? "#ddd" : "#333" }}>
          <MdClose size={24} />
          </IconButton>
        </Box>

        {/* Input Field */}
        <TextField
          fullWidth
          variant="outlined"
          label="Enter a prompt for AI"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          sx={{
            mb: 3,
            bgcolor: theme === "dark" ? "#2c2c2c" : "white",
            borderRadius: 2,
            boxShadow: theme === "dark" ? "0 2px 5px rgba(255,255,255,0.1)" : "0 2px 5px rgba(0,0,0,0.1)",
            input: {
              color: theme === "dark" ? "#fff" : "#000",
          },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: theme === "dark" ? "#555" : "#ddd",
                },
                "&:hover fieldset": {
                  borderColor: theme === "dark" ? "#555" : "#ddd",
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme === "dark" ? "#4FC3F7" : "#007BFF",
                },
              },
            }}
              multiline
              rows={3}
              placeholder="e.g., Write a creative blog about AI..."
          />

          {/* Generate Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleGenerateContent}
            disabled={loading || !prompt}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: "bold",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: theme === "dark"
                  ? "linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)"
                  : "linear-gradient(135deg, #007BFF 0%, #0056B3 100%)",
              color: "white",
              boxShadow: theme === "dark"
                  ? "0 4px 12px rgba(255,255,255,0.1)"
                  : "0 4px 8px rgba(0,0,0,0.2)",
              "&:hover": {
                background: theme === "dark"
                    ? "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)"
                    : "linear-gradient(135deg, #0056B3 0%, #004085 100%)",
              },
              "&:disabled": {
                background: theme === "dark" ? "#555" : "#ccc",
                  color: "#888",
                  cursor: "not-allowed",
                  },
              }}
              startIcon={
                loading ? (
                  <CircularProgress size={20}        sx={{ color: "white" }} />
                ) : (
                  <AiOutlineRobot style={{ color: "white" }} />
                )
              }
            >
              {loading ? "Generating..." : "Generate Blog"}
            </Button>
          </Box>
      </Modal>

          {/* Emoji Picker */}
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

          {/* Dropzone */}
          {showDropzone && <Uploader handlePhotoChange={handlePhotoChange} />}
          
          {/* snackbar */}
          {snackbar.open && ( <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} /> )}

        </form>
      </div>
    </main>
  );
}
