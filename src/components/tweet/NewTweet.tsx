import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
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
    Grid,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Paper,
  } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaRegImage, FaRegSmile } from "react-icons/fa";
import { BiBarChartAlt2 } from "react-icons/bi";
import { AiOutlineCloseCircle, AiOutlinePlusCircle, AiOutlineDelete, AiFillAudio, AiOutlineStop } from "react-icons/ai";
import { IoMdCloseCircle } from "react-icons/io";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useSpring, animated } from '@react-spring/web';

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
    const [detectedCoin, setDetectedCoin] = useState<string | null>(null);
    const [coins, setCoins] = useState<string[]>([]);
    const [filteredCoins, setFilteredCoins] = useState<{ name: string }[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
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

    const { listening, startListening, stopListening, isSupported } = useSpeechToText();

    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

      
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
            .max(600, "Tweet text should be of maximum 600 characters length.")
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
      
              if (actionType === "publish") {
                await mutation.mutateAsync(payload);
              } else if (actionType === "draft") {
                await draftMutation.mutateAsync(payload);
              }
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

    useEffect(() => {
      async function fetchCoins() {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=100&page=1`;
        
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const coinNames = data.map((coin: { name: string }) => coin.name);
          setCoins(coinNames);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    
      fetchCoins();
    }, []); 

    const handleCoinSelect = (coin: any) => {
      const newText = `/${coin}`;
      formik.setFieldValue("text", newText);
      setShowDropdown(false);
      setDetectedCoin(coin); 
    };

    const customHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setCount(text.length);
        formik.handleChange(e);

        // Check if the input consists of only '/' to show dropdown
        if (text === "/") {
          setFilteredCoins(coins.map((coin) => ({ name: coin })));
          setShowDropdown(true);
        } else {
          setShowDropdown(false);
        }

        // Detect /coinname in the text
        const match = text.match(/^\s*\/(\w+)$/);
        setDetectedCoin(match ? match[1] : null);
    };
  
    // React Spring animation for dropdown
    const dropdownAnimation = useSpring({
      opacity: showDropdown ? 1 : 0,
      transform: showDropdown ? "translateY(0px)" : "translateY(-10px)",
      config: { tension: 200, friction: 20 },
    });

  // Generate Post with Coin Data
  const generatePost = async () => {
    if (!detectedCoin) return;
    setLoading(true);
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${detectedCoin.toLowerCase()}`);

      if (!response.ok) {
        setLoading(false);
        setSnackbar({
          message: `${detectedCoin} is not a valid coin`,
          severity: "error",
          open: true,
       });
       return;
      }

      const data = await response.json();

      const {
        image,
        name,
        symbol,
        market_data: {
          current_price,
          market_cap,
          price_change_percentage_24h,
          total_volume,
        },
      } = data;

      // Construct the prompt for Gemini API
      const prompt = `
      Please analyze the following cryptocurrency data   and provide a short market overview:
      - Coin Name: ${name}
      - Symbol: ${symbol.toUpperCase()}
      - Current Price: $${current_price.usd.  toLocaleString()}
      - Market Cap: $${market_cap.usd.toLocaleString()}
      - 24h Price Change: ${price_change_percentage_24h}%
      - Total Volume: $${total_volume.usd.  toLocaleString()}
    
      Write a short and informative market summary based on this data without the introduction, just the summary.
    `;

      const geminiResponse = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!geminiResponse.ok) {
        setLoading(false);
        setSnackbar({
          message: `AI is unable to process this request`,
          severity: "error",
          open: true,
       });
       return;
      }
    
      const geminiData = await geminiResponse.json();
      const marketOverview = geminiData.text;
    

      // Auto-generate post
      formik.setFieldValue(
      "text",
      `🚀 Market Update: ${name} (${symbol.toUpperCase()})\n📈 Price: $${current_price.usd.toLocaleString()}\n📊 Market Cap: $${market_cap.usd.toLocaleString()}\n💸 Total Volume: $${total_volume.usd.toLocaleString()}\n🔄 24h Change: ${price_change_percentage_24h}%\n\nMarket Overview:\n${marketOverview}\n\n#Crypto #${name}`
      );
      formik.setFieldValue("photoUrl", image.large);
      setDetectedCoin(null);
    } catch (error) {
      console.error("Error fetching coin data:", error);
    }
    setLoading(false);
  };

  const removeCoinMention = () => {
    setDetectedCoin(null);
  };

  if (formik.isSubmitting || loading) {
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

                      InputProps={{
                        endAdornment: detectedCoin && (
                          <InputAdornment position="end" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={(theme) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                backgroundColor: theme.palette.mode === 'dark' ? '#1E293B' : '#F1F5F9',
                                padding: '8px 12px',
                                borderRadius: '24px',
                                boxShadow: theme.palette.mode === 'dark'
                                  ? '0px 3px 8px rgba(0,0,0,0.2)'
                                  : '0px 2px 6px rgba(0,0,0,0.1)',
                                border: `1px solid ${theme.palette.mode === 'dark' ? '#334155' : '#CBD5E1'}`,
                                transition: 'all 0.3s ease-in-out',
                              })}
                            >
                              {/* Generate Post Button */}
                              <Button
                                variant="contained"
                                onClick={generatePost}
                                sx={(theme) => ({
                                  borderRadius: '20px',
                                  fontWeight: 'bold',
                                  padding: '8px 18px',
                                  textTransform: 'none',
                                  fontSize: '0.85rem',
                                  background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, #1E88E5 30%, #42A5F5 90%)'
                                    : 'linear-gradient(135deg, #0D47A1 30%, #1976D2 90%)',
                                  color: '#fff',
                                  boxShadow: theme.palette.mode === 'dark'
                                    ? '0px 3px 10px rgba(66, 165, 245, 0.5)'
                                    : '0px 3px 10px rgba(25, 118, 210, 0.4)',
                                  transition: 'all 0.3s ease-in-out',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    background: theme.palette.mode === 'dark'
                                      ? 'linear-gradient(135deg, #1565C0 30%, #1E88E5 90%)'
                                      : 'linear-gradient(135deg, #0D47A1 30%, #1565C0 90%)',
                                    boxShadow: '0px 5px 12px rgba(25, 118, 210, 0.6)',
                                  },
                                  '&:disabled': {
                                    background: 'gray',
                                    color: '#ccc',
                                    cursor: 'not-allowed',
                                  },
                                })}
                              >
                                Generate Post
                              </Button>
                      
                              {/* Clear (Close) Button */}
                              <IconButton
                                onClick={removeCoinMention}
                                sx={(theme) => ({
                                  color: theme.palette.mode === 'dark' ? '#F87171' : '#DC2626',
                                  transition: 'transform 0.2s ease-in-out, color 0.2s ease-in-out',
                                  '&:hover': {
                                    transform: 'scale(1.2)',
                                    color: theme.palette.mode === 'dark' ? '#EF4444' : '#B91C1C',
                                  },
                                })}
                              >
                                <IoMdCloseCircle size={22} />
                              </IconButton>
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      

                    />
                </div>
                
                {/* dropdown */}
                {showDropdown && (
                <animated.div
                  style={{
                    ...dropdownAnimation,
                    position: "absolute",
                    width: "100%",
                    zIndex: 1000,
                  }}
                >
                  <Paper
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      maxHeight: 200,
                      overflowY: "auto",
                      backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                      color: isDarkMode ? "#fff" : "#000",
                      boxShadow: isDarkMode
                        ? "0px 4px 10px rgba(255,255,255,0.1)"
                        : "0px 4px 10px rgba(0,0,0,0.1)",
                      borderRadius: "8px",
                      zIndex: 1000,
                      mt: 1,
                    }}
                  >
                    { filteredCoins && (
                      <List>
                        {filteredCoins.map((coin) => (
                          <ListItem
                            key={coin.name}
                            onClick={() => handleCoinSelect(coin.name)}
                            sx={{
                              "&:hover": {
                                backgroundColor: isDarkMode ? "#333" : "#f0f0f0",
                              },
                              cursor: "pointer",
                              padding: "8px 16px",
                              color: isDarkMode ? "#fff" : "#000",
                            }}
                          >
                            <ListItemText primary={coin.name} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                </animated.div>
              )}

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


                    <ProgressCircle maxChars={600} count={count} />
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






