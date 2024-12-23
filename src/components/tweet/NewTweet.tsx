import { useState } from "react";
import { TextField, Avatar, Button, Box, Typography, IconButton, Grid } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaRegImage, FaRegSmile } from "react-icons/fa";
import { BiBarChartAlt2 } from "react-icons/bi";
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { AiOutlinePlusCircle, AiOutlineDelete } from "react-icons/ai";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import CircularLoading from "../misc/CircularLoading";
import { createTweet } from "@/utilities/fetch";
import { NewTweetProps } from "@/types/TweetProps";
import Uploader from "../misc/Uploader";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { uploadFile } from "@/utilities/storage";
import ProgressCircle from "../misc/ProgressCircle";

export default function NewTweet({ token, handleSubmit }: NewTweetProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [showDropzone, setShowDropzone] = useState(false);
    const [showPoll, setShowPoll] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [count, setCount] = useState(0);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [pollLength, setPollLength] = useState({ days: 0, hours: 0, minutes: 0 });

    const queryClient = useQueryClient();

      
        const handleAddOption = () => {
          if (options.length < 4) {
            setOptions([...options, ""]);
          }
        };
      
        const handleRemoveOption = (index: number) => {
          setOptions(options.filter((_, idx) => idx !== index));
        };
      
        const handleChangeOption = (index: number, value: string) => {
          const updatedOptions = [...options];
          updatedOptions[index] = value;
          setOptions(updatedOptions);
        };
      
        const handleRemovePoll = () => {
          setQuestion("");
          setOptions(["", ""]);
          setPollLength({ days: 0, hours: 0, minutes: 0 });
        };


       const mutation = useMutation({
        mutationFn: createTweet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tweets"] });
        },
        onError: (error) => {
            console.error("Error creating tweet:", error);
            alert("Failed to post your tweet. Please try again.");
        },
    });

    const handlePhotoChange = (file: File) => {
        setPhotoFile(file);
    };

    const validationSchema = yup.object({
        text: yup
            .string()
            .max(280, "Tweet text should be of maximum 280 characters length.")
            .nullable(),
            authorId: yup.string().required("Author ID is required"),
            photoUrl: yup.string().nullable(),
    showPoll: yup.boolean().default(false),
    poll: yup.object().shape({
      question: yup.string(),
      options: yup.array().of(yup.string()),
      length: yup.object().shape({
        days: yup.number().min(0).required(),
        hours: yup.number().min(0).max(23).required(),
        minutes: yup.number().min(0).max(59).required(),
      }),
    }).nullable(),

    });

    const formik = useFormik({
        initialValues: {
            text: "",
            authorId: token.id,
            photoUrl: "",
        poll: {
            question: "",
            options: ["", ""],
            length: { days: 0, hours: 0, minutes: 0 },
          },
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { resetForm, setFieldValue }) => {
            console.log("Poll Data Before Submit:", values.poll);
          try {
              if (!showPoll) console.log("Poll not shown.");
              if (!question.trim()) console.log("Poll question is empty.");
              if (!options.every((opt) => opt.trim())) console.log("One or more poll options are empty.");

            const payload = {
                ...values,
                poll: showPoll && question.trim() && options.every((opt) => opt.trim())
                    ? {
                        question: question.trim(),
                        options: options.filter((opt) => opt.trim()),
                        length: pollLength,
                    }
                    : null,
            };
    

                  console.log("Poll Data Assigned:", {
                      question: question.trim(),
                      options: options.filter((opt) => opt.trim()),
                      length: pollLength,
                  });
              if (photoFile) {
                  const path = await uploadFile(photoFile);
                  if (!path) throw new Error("Error uploading image to Supabase.");
                  payload.photoUrl = path;
              }
      
              console.log("Final Payload:", payload);
              await mutation.mutateAsync(payload);
              console.log("Poll Data Before Reset:", payload.poll);
              resetForm();
              setCount(0);
              setShowDropzone(false);
              setQuestion("");
              setOptions(["", ""]);
              setPollLength({ days: 0, hours: 0, minutes: 0 });
              setShowPoll(false);
      
          } catch (error) {
              console.log("Error during submission:", error);
          }
        }
    });

    const customHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCount(e.target.value.length);
        formik.handleChange(e);
    };

    if (formik.isSubmitting) {
        return <CircularLoading />;
    }

  if (showPoll) {
    return (
      <form onSubmit={formik.handleSubmit}>
      <Box
          sx={{
              p: 2,
              border: "1px solid #ddd",
              borderRadius: "8px",
          }}
      >
          {/* Remove Poll Button with Cross Icon */}
          <Button
              variant="outlined"
              color="error"
              onClick={() => setShowPoll(false)} // Set showPoll to false when clicked
              sx={{
                  mb: 2,
                  color: "red",
                  display: "flex",
                  alignItems: "center",
                  minWidth: 0, 
                  padding: 0,
              }}
          >
              <AiOutlineCloseCircle size={20} style={{ marginRight: "8px" }} /> {/* Cross Icon */}
          </Button>
    
          {/* Question Input */}
          <Box display="flex" alignItems="center" mb={2}>
              <TextField
                  fullWidth
                  label="Ask a question..."
                  variant="outlined"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
              />
              <IconButton
                  onClick={() => setShowPicker(!showPicker)}
                  sx={{ ml: 1 }}
              >
                  <FaRegSmile />
              </IconButton>
          </Box>
    
          {/* Emoji Picker */}
          {showPicker && (
              <Box
                  sx={{
                      position: "absolute",
                      zIndex: 10,
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
              >
                  <Picker
                      data={data}
                      onEmojiSelect={(emoji: any) => {
                          setQuestion((prev) => prev + emoji.native);
                          setShowPicker(false);
                      }}
                      previewPosition="none"
                  />
              </Box>
          )}
    
          {/* Options */}
          {options.map((option, index) => (
              <Box key={index} display="flex" alignItems="center" mb={1}>
                  <TextField
                      fullWidth
                      placeholder={`Option ${index + 1}`}
                      variant="outlined"
                      value={option}
                      onChange={(e) => handleChangeOption(index, e.target.value)}
                  />
                  {index >= 2 && (
                      <Button
                          onClick={() => handleRemoveOption(index)}
                          sx={{
                              ml: 1,
                              minWidth: 0,
                              p: 1,
                              color: "red",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                          }}
                      >
                          <AiOutlineCloseCircle size={20} />
                      </Button>
                  )}
              </Box>
          ))}
    
          {/* Add Option Button */}
          {options.length < 4 && (
              <Button
                  variant="outlined"
                  onClick={handleAddOption}
                  sx={{
                      mb: 2,
                      color: "#1976d2",
                      borderColor: "#1976d2",
                      display: "flex",
                      alignItems: "center",
                  }}
              >
                  <AiOutlinePlusCircle size={20} style={{ marginRight: "8px" }} />
                  Add Option
              </Button>
          )}
    
          {/* Poll Length */}
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Poll Length:
          </Typography>
          <Grid container spacing={1} mb={2}>
              <Grid item xs={4}>
                  <TextField
                      label="Days"
                      type="number"
                      inputProps={{ min: 0, max: 7 }}
                      value={pollLength.days}
                      onChange={(e) =>
                          setPollLength({ ...pollLength, days: Number(e.target.value) })
                      }
                  />
              </Grid>
              <Grid item xs={4}>
                  <TextField
                      label="Hours"
                      type="number"
                      inputProps={{ min: 0, max: 23 }}
                      value={pollLength.hours}
                      onChange={(e) =>
                          setPollLength({ ...pollLength, hours: Number(e.target.value) })
                      }
                  />
              </Grid>
              <Grid item xs={4}>
                  <TextField
                      label="Minutes"
                      type="number"
                      inputProps={{ min: 0, max: 59 }}
                      value={pollLength.minutes}
                      onChange={(e) =>
                          setPollLength({ ...pollLength, minutes: Number(e.target.value) })
                      }
                  />
              </Grid>
          </Grid>
    
          {/* Buttons */}
          <Box display="flex" justifyContent="space-between">
              <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRemovePoll}
                  sx={{
                      display: "flex",
                      alignItems: "center",
                  }}
              >
                  <AiOutlineDelete size={20} style={{ marginRight: "8px" }} />
                  Remove Poll
              </Button>
              <Button
                  type="submit"  // This makes it a submit button
                  variant="contained"
                  color="primary"
                  disabled={!question || options.some((opt) => !opt.trim())}
              >
                  Post
              </Button>
          </Box>
      </Box>
    </form>
    )
  }
  
      
    

    return (
        <div className="new-tweet-form">
            <Avatar
                className="avatar div-link"
                sx={{ width: 50, height: 50 }}
                alt=""
                src={token.photoUrl ? getFullURL(token.photoUrl) : "/assets/egg.jpg"}
            />
            <form onSubmit={formik.handleSubmit}>
                <div className="input">
                    <TextField
                        placeholder="What's happening?"
                        multiline
                        hiddenLabel
                        minRows={3}
                        variant="standard"
                        fullWidth
                        name="text"
                        value={formik.values.text}
                        onChange={customHandleChange}
                        error={formik.touched.text && Boolean(formik.errors.text)}
                        helperText={formik.touched.text && formik.errors.text}
                    />
                </div>
                <div className="input-additions">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setShowDropzone(!showDropzone);
                        }}
                        className="icon-hoverable"
                    >
                        <FaRegImage />
                    </button>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setShowPoll(!showPoll);
                        }}
                        className="icon-hoverable"
                    >
                        <BiBarChartAlt2 style={{ color: "#1DA1F2", rotate: "-90deg" }} />
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

                    <ProgressCircle maxChars={280} count={count} />
                    <button className={`btn ${formik.isValid ? "" : "disabled"}`} disabled={!formik.isValid} type="submit">
                        Tweet
                    </button>
                </div>
                {showPicker && (
                    <div className="emoji-picker">
                        <Picker
                            data={data}
                            onEmojiSelect={(emoji: any) => {
                                formik.setFieldValue("text", formik.values.text + emoji.native);
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
    );
  }






