import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { RxDotsHorizontal } from "react-icons/rx";
import { Avatar, Menu, MenuItem, TextField, Dialog,DialogActions, DialogTitle, DialogContent, FormControl, InputLabel, Select, Typography,  } from "@mui/material";
import { AiFillTwitterCircle, AiFillAudio, AiOutlineStop } from "react-icons/ai";

import { TweetProps } from "@/types/TweetProps";
import { formatDateExtended } from "@/utilities/date";
import Reply from "./Reply";
import Retweet from "./Retweet";
import Like from "./Like";
import Share from "./Share";
import Counters from "./Counters";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { VerifiedToken } from "@/types/TokenProps";
import { deleteTweet, updateTweet } from "@/utilities/fetch";
import PreviewDialog from "../dialog/PreviewDialog";
import { shimmer } from "@/utilities/misc/shimmer";
import NewReply from "./NewReply";
import Replies from "./Replies";
import CustomSnackbar from "../misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";
import CircularLoading from "../misc/CircularLoading";
import { sleepFunction } from "@/utilities/misc/sleep";

import { useFormik } from "formik";
import * as yup from "yup";
import ProgressCircle from "../misc/ProgressCircle";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { FaRegSmile } from "react-icons/fa";
import { LinearProgress, Button } from "@mui/material";
import useSpeechToText from "@/hooks/useSpeechInput";

export default function SingleTweet({ tweet, token }: { tweet: TweetProps; token: VerifiedToken }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [updatedPollOptions, setUpdatedPollOptions] = useState(tweet.pollOptions);
    const [totalVotes, setTotalVotes] = useState(tweet.totalVotes);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userVoted, setUserVoted] = useState(false);
    const [count, setCount] = useState(0);
    const [showPicker, setShowPicker] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const queryClient = useQueryClient();
    const router = useRouter();

    const { transcript, listening, startListening, stopListening, isSupported } = useSpeechToText();

    const mutation = useMutation({
        mutationFn: (jsonId: string) => deleteTweet(tweet.id, tweet.authorId, jsonId),
        onSuccess: async () => {
            setIsConfirmationOpen(false);
            setIsDeleting(false);
            setSnackbar({
                message: "Tweet deleted successfully. Redirecting to the profile page...",
                severity: "success",
                open: true,
            });
            await sleepFunction();
            queryClient.invalidateQueries(["tweets", tweet.author.username]);
            router.replace(`/${tweet.author.username}`);
        },
        onError: (error) => console.log(error),
    });

    const updateMutation = useMutation({
        mutationFn: (updatedTweetData: { text: string; authorId: string; schedule: string; }) => updateTweet(tweet.id, JSON.stringify(token?.id), updatedTweetData),
        onSuccess: () => {
            queryClient.invalidateQueries(["tweets", tweet.author.username]);
            setSnackbar({
                message: "Post updated successfully.",
                severity: "success",
                open: true,
            });
        },
        onError: (error) => console.error(error),
    });

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

    const handleAnchorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget);
    };
    const handleAnchorClose = () => {
        setAnchorEl(null);
    };
    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handlePreviewClick();
    };
    const handlePreviewClick = () => {
        setIsPreviewOpen(true);
    };
    const handlePreviewClose = () => {
        setIsPreviewOpen(false);
    };
    const handleConfirmationClick = () => {
        handleAnchorClose();
        setIsConfirmationOpen(true);
    };

    const handleDelete = async () => {
        if (!token) {
            return setSnackbar({
                message: "You must be logged in to delete tweets...",
                severity: "info",
                open: true,
            });
        }
        handleAnchorClose();
        setIsDeleting(true);
        const jsonId = JSON.stringify(token.id);
        mutation.mutate(jsonId);
    };

    const validationSchema = yup.object({
        text: yup
            .string()
            .max(280, "Tweet text should be of maximum 280 characters length.")
            .required("Tweet text can't be empty."),
    });

    const formik = useFormik({
        initialValues: {
            text: tweet.text,
            authorId: tweet.authorId,
            schedule: "",
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                setIsUpdating(true);
                console.log('val',values);
                await updateMutation.mutateAsync(values);
                resetForm();
                setIsUpdateOpen(false);
            } catch (error) {
                console.error("Failed to update tweet:", error);
            } finally {
                setIsUpdating(false);
            }
        },
    });
    
    const customHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCount(e.target.value.length);
        formik.handleChange(e);
    };

    const fetchVoteCounts = async () => {
        try {
            const res = await fetch(`/api/tweets/voteOnPoll?tweetId=${tweet.id}&optionId=${updatedPollOptions[0]?.id}`);
            const data = await res.json();
            if (data.success) {
                setUpdatedPollOptions((prevOptions) => 
                    prevOptions.map((option) =>
                        option.id === data.pollOption.id
                            ? { ...option, votes: data.pollOption.votes }
                            : option
                    )
                );
                setTotalVotes(data.pollOption.votes);              
            }
        } catch (err) {
            console.error("Error fetching vote counts:", err);
        }
    };

    useEffect(() => {
        fetchVoteCounts();
    })

    const handleVote = async (optionId: string) => {
        if (!token) {
            console.error("User must be logged in to vote.");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("/api/tweets/voteOnPoll", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tweetId: tweet.id,
                    optionId,
                    userId: token.id,
                }),
            });

            if (!res.ok) {
                console.error("Failed to vote on poll:", await res.text());
                setLoading(false);
                return;
            }

            const updatedOptions = updatedPollOptions.map((option) =>
                option.id === optionId ? { ...option, votes: option.votes + 1 } : option
            );

            setUpdatedPollOptions(updatedOptions);
            setUserVoted(true);
            setTotalVotes(totalVotes + 1);
            setLoading(false);
            window.location.reload();
        } catch (err) {
            console.error("Error voting on poll:", err);
            setLoading(false);
        }
    };


    const handleConfirmAction = () => {
        setOpenModal(false);
        handlePublish();
      };

    const handlePublish = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/tweets/draft/publish", {
                method: "PATCH",
                headers: {
                  'Content-Type': 'application/json',
                  'authorId': tweet.authorId || "",
                  'postId': tweet.id || "",
                }
            });
    
            const data = await response.json();
    
            if (data.success) {
                setLoading(false);
                setSnackbar({
                    message: "Post published successfully.",
                    severity: "success",
                    open: true,
                });
            } else {
              console.error("Failed to delete post:", data.message)
              setLoading(false);
            }
          } catch(error) {
            console.error("Error publishing post:", error);
            setLoading(false);
          }
    }

    const handleUpdate = () => {
        if (tweet.status === "draft") {
          setIsModalOpen(true);
        } else {
          formik.handleSubmit();
          setIsModalOpen(false);
        }
     }

    const calculateVotePercentage = (votes: number) => {
        if (totalVotes === 0) return '0';
        return ((votes / totalVotes) * 100).toFixed(0);
    };

    const isPollTweet = !tweet.text && tweet.pollOptions?.length > 0;


    if (formik.isSubmitting || loading) {
        return <CircularLoading />;
    }

    return (
        <div>
            <div className={`single-tweet tweet ${tweet.isReply && "reply"}`}>
                <div className="single-tweet-author-section">
                    <div>
                        <Link className="tweet-avatar" href={`/${tweet.author.username}`}>
                            <Avatar
                                className="avatar"
                                sx={{ width: 50, height: 50 }}
                                alt=""
                                src={tweet.author.photoUrl ? getFullURL(tweet.author.photoUrl) : "/assets/egg.jpg"}
                            />
                        </Link>
                    </div>
                    <div className="tweet-author-section">
                        <Link className="tweet-author-link" href={`/${tweet.author.username}`}>
                            <span className="tweet-author">
                                {tweet.author.name !== "" ? tweet.author.name : tweet.author.username}
                                {tweet.author.isPremium && (
                                    <span className="blue-tick" data-blue="Verified Blue">
                                        <AiFillTwitterCircle />
                                    </span>
                                )}
                            </span>
                            <span className="text-muted">@{tweet.author.username}</span>
                        </Link>
                        {token && token.username === tweet.author.username && (
                            <>
                                <button className="three-dots icon-hoverable" onClick={handleAnchorClick}>
                                    <RxDotsHorizontal />
                                </button>
                                <Menu anchorEl={anchorEl} onClose={handleAnchorClose} open={Boolean(anchorEl)}>
                                    <MenuItem onClick={handleConfirmationClick} className="delete">
                                        Delete
                                    </MenuItem>
                                    {
                                    !tweet.isPoll &&
                                    <MenuItem className="delete" onClick={()=> setIsUpdateOpen(true)}>
                                        Update
                                    </MenuItem>       
                                }
                                {
                                tweet.status === "draft" &&
                                <MenuItem className="delete"  onClick={()=> setOpenModal(true)}>
                                    Publish
                                </MenuItem>
                                }
                                </Menu>
                            </>
                        )}
                    </div>
                </div>
                <div className="tweet-main">
                    <div className="tweet-text">
                        {tweet.isReply && (
                            <Link href={`/${tweet?.repliedTo?.author.username}`} className="reply-to">
                                <span className="mention">@{tweet?.repliedTo?.author.username}</span>
                            </Link>
                        )}{" "}


                      {/* {tweet.text} */}
                      {isPollTweet ? (
    <div className="poll" style={{ padding: "1rem", borderRadius: "10px", border: "1px solid #e1e8ed" }}>
        <h4 className="poll-title" style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "1rem" }}>
            Poll
        </h4>
        <div className="poll-options" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {updatedPollOptions.map((option) => {
                const percentage = calculateVotePercentage(option.votes);
                return (
                    <div key={option.id} className="poll-option" style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <div className="option-text" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", color: "#0f1419" }}>{option.text}</span>
                            <span className="poll-percentage" style={{ fontSize: "14px", fontWeight: "bold", color: "#657786" }}>
                                {percentage}%
                            </span>
                        </div>
                        <LinearProgress
                            variant="determinate"
                            value={parseFloat(percentage)}
                            style={{
                                height: "8px",
                                borderRadius: "4px",
                                backgroundColor: "#e1e8ed",
                            }}
                            sx={{
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: "#1da1f2",
                                },
                            }}
                        />
                    </div>
                );
            })}
        </div>
        {token && !userVoted && (
            <div className="vote-options" style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {updatedPollOptions.map((option) => (
                    <Button
                        key={option.id}
                        variant="contained"
                        color="primary"
                        onClick={() => handleVote(option.id)}
                        style={{
                            textTransform: "none",
                            borderRadius: "20px",
                            fontSize: "14px",
                            padding: "0.5rem 1rem",
                            backgroundColor: "#1976D2",
                            color: "#fff",
                        }}
                        sx={{
                            "&:hover": {
                                backgroundColor: "#0d95e8",
                            },
                        }}
                    >
                        <p>Vote for &quot;{option.text}&quot;</p>
                    </Button>
                ))}
            </div>
        )}
    </div>
) : (
    <div className="tweet-text">
               {tweet.text &&
                  (() => {
                  const changeRegex = /🔄 24h Change: ([-+]?\d+(\.\d+)?)%/;
                  const hashtagRegex = /#(\w+)/g;

                  const changeMatch = tweet.text.match(changeRegex);
                  const hashtagMatches = [...tweet.text.matchAll(hashtagRegex)];

                  let updatedText = tweet.text;

                  if (changeMatch) {
                  const changeValue = parseFloat(changeMatch[1]);
                  const changeColor = changeValue < 0 ? "red" : "green";

                  updatedText = updatedText.replace(
                  changeRegex,
                  `🔄 24h Change: <span style="color:${changeColor}; font-weight: bold;">${changeMatch[1]}%</span>`
                  );
                  }

                  updatedText = updatedText.replace(hashtagRegex,                     (match) => {
                  return `<span style="color: blue; font-weight: bold;">${match}</span>`;
                  });

                  return <span dangerouslySetInnerHTML={{ __html: updatedText }} />;
                  })()}

    </div>
)}



                    </div>
                    {tweet.photoUrl && (
                        <>
                            <div className="tweet-image">
                                <Image
                                    onClick={handleImageClick}
                                    src={tweet.photoUrl.startsWith("http://") || tweet.photoUrl.startsWith("https://")
                                        ? tweet.photoUrl 
                                        : getFullURL(tweet.photoUrl)}
                                    alt="tweet image"
                                    placeholder="blur"
                                    blurDataURL={shimmer(500, 500)}
                                    height={500}
                                    width={500}
                                />
                            </div>
                            <PreviewDialog
                                open={isPreviewOpen}
                                handlePreviewClose={handlePreviewClose}
                                url={tweet.photoUrl}
                            />
                        </>
                    )}
                    <span className="text-muted date">{formatDateExtended(tweet.createdAt)}</span>
                    <Counters tweet={tweet} />
                    <div className="tweet-bottom">
                        <Reply tweet={tweet} />
                        <Retweet tweetId={tweet.id} tweetAuthor={tweet.author.username} />
                        <Like tweetId={tweet.id} tweetAuthor={tweet.author.username} />
                        <Share
                            tweetUrl={`https://${window.location.hostname}/${tweet.author.username}/tweets/${tweet.id}`}
                        />
                    </div>
                </div>
            </div>
            {token && <NewReply token={token} tweet={tweet} />}
            {tweet.replies.length > 0 && <Replies tweetId={tweet.id} tweetAuthor={tweet.author.username} />}
            {snackbar.open && (
                <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
            )}

            {/* Delete Tweet */}
            {isConfirmationOpen && (
                <div className="html-modal-wrapper">
                    <dialog open className="confirm">
                        <h1>Delete Tweet?</h1>
                        <p>
                            This can’t be undone and it will be removed from your profile, the timeline of any accounts that
                            follow you, and from Twitter search results.
                        </p>
                        {isDeleting ? (
                            <CircularLoading />
                        ) : (
                            <>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    Delete
                                </button>
                                <button className="btn btn-white" onClick={() => setIsConfirmationOpen(false)}>
                                    Cancel
                                </button>
                            </>
                        )}
                    </dialog>
                </div>
            )}
            

        {/* Update Tweet */}
       {isUpdateOpen && (
        <div className="html-modal-wrapper">
        <dialog open className="new-tweet-form" onClick={(e) => e.stopPropagation()}>
            <Avatar
                className="avatar div-link"
                sx={{ width: 50, height: 50 }}
                alt=""
                src={token?.photoUrl ? getFullURL(token?.photoUrl) : "/assets/egg.jpg"}
            />
            <form onSubmit={formik.handleSubmit}>
                <div className="input">
                    <TextField
                        placeholder="Update your tweet..."
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

                    <ProgressCircle maxChars={280} count={formik.values.text.length} />
                    <button
                        className={`btn ${formik.isValid ? "" : "disabled"}`}
                        disabled={!formik.isValid || isUpdating}
                        type="button"
                        onClick={handleUpdate}
                    >
                        {isUpdating ? "Updating..." : "Save"}
                    </button>
                    <button
                        className="btn btn-white"
                        type="button"
                        onClick={() => setIsUpdateOpen(false)}
                    >
                        Close
                    </button>
                </div>
                {/* Emoji Picker Component */}
                {showPicker && (
                    <div className="emoji-picker">
                        <Picker
                            data={data}
                            onEmojiSelect={(emoji: any) => {
                                formik.setFieldValue("text", formik.values.text + emoji.native);
                                setShowPicker(false);
                                setCount(formik.values.text.length + emoji.native.length);
                            }}
                            previewPosition="none"
                        />
                    </div>
                )}
             </form>
           </dialog>
         </div>
        )}

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
              formik.handleSubmit();
              setIsModalOpen(false);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      )}

        {/* Confirmation Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>
          Are you sure you want to publish this post?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

        </div>
    );
}


