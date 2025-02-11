import { useState } from "react";
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
    Avatar,
    Box,
    IconButton, 
    Grid
  } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaRegImage, FaRegSmile } from "react-icons/fa";
import { BiBarChartAlt2 } from "react-icons/bi";
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { AiOutlinePlusCircle, AiOutlineDelete, AiFillAudio, AiOutlineStop } from "react-icons/ai";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import CircularLoading from "../misc/CircularLoading";
import { createTweet, draftTweet } from "@/utilities/fetch";
import { NewTweetProps } from "@/types/TweetProps";
import Uploader from "../misc/Uploader";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { uploadFile } from "@/utilities/storage";
import ProgressCircle from "../misc/ProgressCircle";
import { SnackbarProps } from "@/types/SnackbarProps";
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import useSpeechToText from "@/hooks/useSpeechInput";

export default function NewTweet({ token, handleSubmit }: NewTweetProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [showDropzone, setShowDropzone] = useState(false);
    const [showPoll, setShowPoll] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [count, setCount] = useState(0);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [pollLength, setPollLength] = useState({ days: 0, hours: 0, minutes: 0 });
    const [actionType, setActionType] = useState<"publish" | "draft">("publish");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

    const queryClient = useQueryClient();

    const { transcript, listening, startListening, stopListening, isSupported } = useSpeechToText();

      
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

    const draftMutation = useMutation({
        mutationFn: draftTweet,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["drafts"] });
          setIsModalOpen(false);
          setSnackbar({
            message: "Post saved successfully to draft.",
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
          schedule: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { resetForm, setFieldValue }) => {
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
              if (actionType === "publish") {
                await mutation.mutateAsync(payload);
              } else if (actionType === "draft") {
                await draftMutation.mutateAsync(payload);
              }
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

    const handleDraftClick = () => {
        if (formik.isValid) {
           setIsModalOpen(true); 
        }
    }

    const handleStartListening = () => {
      if (!isSupported) {
        return (
          alert("Your browser do not support speechRecognition")
        )
      }
      startListening((newTranscript) => {
        formik.setFieldValue("text", formik.values.text ? formik.values.text + " " + newTranscript : newTranscript);
      });
    };
  
    const handleStopListening = () => {
        stopListening();
    };

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
                  type="button"
                  variant="contained"
                  color="primary"
                  disabled={!question || options.some((opt) => !opt.trim())}
                  onClick={handleDraftClick}
              >
                  Draft
              </Button>
              <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!question || options.some((opt) => !opt.trim())}
              >
                  Post
              </Button>
          </Box>

      {/* Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Schedule Post
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Choose when you&apos;d like the post to be published.
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

                    <button
                        type="button"
                        onClick={() => {
                          if (listening) {
                            handleStopListening();
                          } else {
                            handleStartListening();
                          }
                        }}
                        className="icon-hoverable"
                    >
                        {listening ? <AiOutlineStop size={20} /> : <AiFillAudio size={20} />}
                    </button>


                    <ProgressCircle maxChars={280} count={count} />
                    <button 
                    className={`btn ${(formik.values.text || photoFile) ? "" : "disabled"}`} 
                    disabled={(!formik.values.text && !photoFile)}
                    type="button"
                    onClick={handleDraftClick}
                    >
                        Draft
                    </button>
                    <button 
                    className={`btn ${(formik.values.text || photoFile) ? "" : "disabled"}`} 
                    disabled={(!formik.values.text && !photoFile)} 
                    type="submit"
                    onClick={() => {
                        setActionType("publish");
                        formik.handleSubmit()
                    }}
                    >
                        Tweet
                    </button>
                </div>

      {/* Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Schedule Post
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Choose when you&apos;d like the post to be published.
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

                {snackbar.open && (
                <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
                )}

            </form>
        </div>
    );
  }






