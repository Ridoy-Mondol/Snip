"use client";
import { useState, useContext } from "react";
import { TextField, MenuItem } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaRegImage, FaRegSmile } from "react-icons/fa";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import CircularLoading from "@/components/misc/CircularLoading";
import { createBlog } from "@/utilities/fetch";
import Uploader from "@/components/misc/Uploader";
import { uploadFile } from "@/utilities/storage";
import ProgressCircle from "@/components/misc/ProgressCircle";
import { AuthContext } from "../layout";
import { Editor } from "@tinymce/tinymce-react";
import { ThemeContext } from "@/app/providers";

export default function CreateBlogPage() {
  const [showPicker, setShowPicker] = useState(false);
  const [showDropzone, setShowDropzone] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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
    category: yup.string().required("Category is required."),
    content: yup.string().required("Content cannot be empty."),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      category: "",
      content: "",
      photoUrl: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!token?.id) {
        console.error("Author ID is missing.");
        return;
      }

      if (!values.photoUrl && !photoFile) {
        setImageError("Please upload an image in less than 1MB.");
        return;
      }

      const blogData = { ...values, authorId: token.id };

      try {
        setLoading(true);
        if (photoFile) {
          const path = await uploadFile(photoFile);
          if (!path) {
            setImageError("Error uploading image to Supabase. Please upload an image in less than 1MB.");
            return
          }
          values.photoUrl = path;
          setPhotoFile(null);
        }

        await mutation.mutateAsync(blogData);
        resetForm();
        setCount(0);
        setShowDropzone(false);
      } catch (error) {
        console.error("Failed to upload image or create blog:", error);
        setLoading(false);
      }
    },
  });

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
              type="submit"
            >
              Create Blog
            </button>
          </div>

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
        </form>
      </div>
    </main>
  );
}
