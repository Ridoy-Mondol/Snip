"use client";
import { useState, useContext } from "react";
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
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaRegImage, FaRegSmile } from "react-icons/fa";
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

export default function CreateBlogPage() {
  const [showPicker, setShowPicker] = useState(false);
  const [showDropzone, setShowDropzone] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"publish" | "draft">("publish");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

  const { token, isPending } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const queryClient = useQueryClient();

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
        // setIsSchedule("false");
        formik.handleSubmit();
      }
  }


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
                // setIsSchedule("false");
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
              // setIsSchedule("true");
              formik.handleSubmit();
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      )}

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
