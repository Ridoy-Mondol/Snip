"use client";
import { useState, useEffect, useContext } from "react";
import { TextField } from "@mui/material";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaRegImage, FaRegSmile } from "react-icons/fa";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import CircularLoading from "@/components/misc/CircularLoading";
import { updateBlog } from "@/utilities/fetch";
import Uploader from "@/components/misc/Uploader";
import { uploadFile } from "@/utilities/storage";
import ProgressCircle from "@/components/misc/ProgressCircle";
import { AuthContext } from "../../../layout";
import { Editor } from "@tinymce/tinymce-react";
import { ThemeContext } from "@/app/providers";

export default function UpdateBlogPage({ params }: { params: { id: string } }) {
  const [showPicker, setShowPicker] = useState(false);
  const [showDropzone, setShowDropzone] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);
  const [blog, setBlog] = useState<any>(null);
  const [isLoading, setLoading] = useState(false);

  const { token, isPending } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { theme } = useContext(ThemeContext);

  const { id: blogId } = params;

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

  const mutation = useMutation({
    mutationFn: updateBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      window.location.href = `/blog/${blogId}`;
    },
    onError: (error) => {
      console.log(error);
      setLoading(false);
    },
  });

  const handlePhotoChange = (file: File) => {
    if (file.size > 1048576) {
      alert("The image size should not exceed 1MB.");
      return;
    }
    setPhotoFile(file);
  };

  const formik = useFormik({
    initialValues: {
      title: blog?.title || "",
      category: blog?.category || "",
      content: blog?.content || "",
      photoUrl: blog?.photoUrl || "",
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
      } = {
        id: blogId,
        authorId: token?.id || "",
      };

      if (values.title) updateData.title = values.title;
      if (values.category) updateData.category = values.category;
      if (values.content) updateData.content = values.content;

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

      if (Object.keys(updateData).length === 0) {
        console.log("No fields updated.");
        return;
      }

      try {
        await mutation.mutateAsync(updateData);
        setCount(0);
        setShowDropzone(false);
      } catch (error) {
        console.error("Failed to update blog:", error);
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

  if (isPending || isLoading || !token) {
    return <CircularLoading />;
  }

  return (
    <main>
      <h1 className="page-name">Update Blog</h1>
      <div className="new-blog-form" style={{padding: "20px"}}>
        <form onSubmit={formik.handleSubmit}>
          <div className="input">
            <TextField
              label="Title"
              variant="standard"
              fullWidth
              name="title"
              value={formik.values.title}
              onChange={customHandleChange}
            />
          </div>
          <div className="input">
            <TextField
              label="Category"
              variant="standard"
              fullWidth
              name="category"
              value={formik.values.category}
              onChange={customHandleChange}
            />
          </div>
          <div className="input">
          <p style={{ margin: "10px 0",fontSize: "16px", color: theme === "dark" ? "gray" : "#1e1e1e" }}>Content</p>
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
                  "insertdatetime"
                ],
                toolbar:
                   "undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table emoticons | code fullscreen preview | insertdatetime | searchreplace"
                ,
                content_style: `
                 body {
                   background-color: ${theme === "dark" ? "black" : "white"} !important;
                   color: ${theme === "dark" ? "white" : "black"};
                   font-family: Arial, sans-serif;
                   font-size: 14px;
                 }
                 .mce-content-body {
                   background-color: ${theme === "dark" ? "black" : "white"} !important;
                   color: ${theme === "dark" ? "white" : "black"};
                 }
               `           ,
               skin: theme === "dark" ? "oxide-dark" : "oxide",
               setup: (editor) => {
                editor.on('init', () => {
                const editorElement = editor.contentDocument.body;
                editorElement.style.backgroundColor = theme === "dark" ? "black" : "white";
                editorElement.style.color = theme === "dark" ? "white" : "black";
               });
            },
            content_css: theme === "dark" ? "dark" : "",
            branding: false,
            }}
            onEditorChange={handleEditorChange}
            />
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
            <button className="btn" type="submit">
              Update Blog
            </button>
          </div>
          {showPicker && (
            <div className="emoji-picker">
              <Picker
                data={data}
                onEmojiSelect={(emoji: any) => {
                  formik.setFieldValue(
                    "content",
                    formik.values.content + emoji.native
                  );
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
