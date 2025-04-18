import { Avatar, Popover, Tooltip, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AiFillTwitterCircle } from "react-icons/ai";
import { FiVolume2, FiVolumeX, FiPlay, FiPause } from "react-icons/fi";

import { TweetProps } from "@/types/TweetProps";
import { formatDate, formatDateExtended } from "@/utilities/date";
import { shimmer } from "@/utilities/misc/shimmer";
import Reply from "./Reply";
import Retweet from "./Retweet";
import Like from "./Like";
import Share from "./Share";
import PreviewDialog from "../dialog/PreviewDialog";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { AuthContext } from "@/context/AuthContext";
import ProfileCard from "../user/ProfileCard";
import CircularLoading from "../misc/CircularLoading";
import { LinearProgress, Button, IconButton } from "@mui/material";
import { speakText } from "@/utilities/textToSpeech";

export default function Tweet({ tweet }: { tweet: TweetProps }) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [hoveredProfile, setHoveredProfile] = useState("");
    const [userVoted, setUserVoted] = useState(false);
    
    const [updatedPollOptions, setUpdatedPollOptions] = useState(tweet.pollOptions);
    const [totalVotes, setTotalVotes] = useState(tweet.totalVotes);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(false);

    const { token } = useContext(AuthContext);
    const router = useRouter();

    const handleTweetClick = () => {
        router.push(`/${tweet.author.username}/tweets/${tweet.id}`);
    };
    const handlePropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };
    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handlePreviewClick();
    };
    // const handlePreviewClick = (image: string) => {
    //     setPreviewImage(image);
    //     setIsPreviewOpen(true);
    // };
    
    // const handlePreviewClose = () => {
    //     setIsPreviewOpen(false);
    //     setPreviewImage(null);
    // };
    const handlePreviewClick = () => {
        setIsPreviewOpen(true);
    };
    const handlePreviewClose = () => {
        setIsPreviewOpen(false);
    };
    
    const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>, type: "default" | "mention" | "retweet" = "default") => {
        if (type === "mention") {
            {tweet.repliedTo && setHoveredProfile(tweet.repliedTo?.author.username)};
        }
        if (type === "retweet") {
            setHoveredProfile(tweet.author.username);
        }
        if (type === "default") {
            setHoveredProfile(tweet.author.username);
        }
        setAnchorEl(e.currentTarget);
    };
    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const fetchUserVotedStatus = async () => {
        if (!token || !tweet.id) return;

        try {
            const res = await fetch(`/api/tweets/getUserVoted`, {
                method: "GET",
                headers: {
                    userId: token.id,
                    pollId: tweet.id,
                },
            });

            const data = await res.json();
            if (data.success) {
                setUserVoted(data.hasVoted);
            } else {
                console.error("Error checking vote status:", data.error);
            }
        } catch (err) {
            console.error("Error fetching vote status:", err);
        }
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

    const handleVote = async (optionId: string, e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
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

    const calculateVotePercentage = (votes: number) => {
        if (totalVotes === 0) return '0';
        return ((votes / totalVotes) * 100).toFixed(0);
    };

    const isPollTweet = tweet.isPoll;
    const isPollExpired = tweet.pollExpiresAt && new Date(tweet.pollExpiresAt) <= new Date();

    useEffect(() => {
        fetchVoteCounts();
        fetchUserVotedStatus();
    }, []);

    const handleSpeech = (content: string) => {
        if (isSpeaking) {
          speechSynthesis.cancel(); 
          setIsSpeaking(false);
          setIsPaused(false);
        } else {
          speakText(content, setIsSpeaking, setIsPaused);
          setIsSpeaking(true);
        }
      };
      
      const pauseSpeech = () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.pause();
            setIsPaused(true);
        } else {
            setIsPaused(false);
          }
      };
      
      const resumeSpeech = () => {
            speechSynthesis.resume();
            setIsPaused(false);
      };
      
      const stopSpeech = () => {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
      };

    if (loading) {
        return <CircularLoading />
    }

    return (
        <motion.div
            onClick={handleTweetClick}
            className={`tweet ${tweet.isRetweet && "retweet"} ${tweet.isReply && "reply"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Link
                onClick={handlePropagation}
                className="tweet-avatar"
                href={`/${tweet.author.username}`}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
            >
                <Avatar
                    className="avatar"
                    sx={{ width: 50, height: 50 }}
                    alt=""
                    src={tweet.author.photoUrl ? getFullURL(tweet.author.photoUrl) : "/assets/egg.jpg"}
                />
            </Link>
            <div className="tweet-main">
                <section className="tweet-author-section">
                    <Link
                        onClick={(e) => e.stopPropagation()}
                        className="tweet-author-link"
                        href={`/${tweet.author.username}`}
                        onMouseEnter={handlePopoverOpen}
                        onMouseLeave={handlePopoverClose}
                    >
                        <span className="tweet-author">
                            {tweet.author.name || tweet.author.username}
                            {tweet.author.isPremium && (
                                <span className="blue-tick" data-blue="Verified Blue">
                                    <AiFillTwitterCircle />
                                </span>
                            )}
                        </span>
                        <span className="text-muted">@{tweet.author.username}</span>
                    </Link>
                    <Tooltip title= {tweet.scheduledAt ? formatDateExtended(tweet.scheduledAt) : formatDateExtended(tweet.createdAt)} placement="top">
                        <span className="text-muted date">
                            <span className="middle-dot">·</span>
                            {tweet.scheduledAt ? formatDate(tweet.scheduledAt) : formatDate(tweet.createdAt)}
                        </span>
                    </Tooltip>
                </section>

  {isPollTweet ?  (
    <div className="poll" style={{ padding: "1rem", borderRadius: "10px", border: "1px solid #e1e8ed" }}>
        <h4 className="poll-title" style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "1rem" }}>
            {tweet.text}
        </h4>
        {
         (userVoted || isPollExpired ) &&
        <div className="poll-options" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {updatedPollOptions?.map((option) => {
                const percentage = userVoted
                ? calculateVotePercentage(option.votes) 
                : '0';
                return (
                    <div key={option.id} className="poll-option" style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <div className="option-text" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                            <span style={{ fontSize: "14px" }}>{option.text}</span>
                            {userVoted && <span className="poll-percentage" style={{ fontSize: "14px", fontWeight: "bold", color: "#657786" }}>
                                {percentage}%
                            </span>
                          }
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
        }
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div className="total-votes" style={{ marginTop: "1rem", fontSize: "14px", color: "#657786" }}>
            {totalVotes === 0
                ? (isPollExpired ? 'No votes' : 'No votes yet')
                : `${totalVotes} ${totalVotes === 1 ? 'person' : 'people'} voted`}
        </div>
        <div style={{fontSize: "28px", color: "#657786"}}>.</div>
        <div className="total-votes" style={{ marginTop: "1rem", fontSize: "14px", color: "#657786" }}>
                {tweet.pollExpiresAt && (
                    isPollExpired
                        ? "Poll has ended"
                        : `Poll expires on ${formatDate(tweet.pollExpiresAt)}`
                )}
        </div>
        </div>

        {token && !userVoted && !isPollExpired && (
            <div className="vote-options" style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {updatedPollOptions?.map((option) => (
                    <Button
                        key={option.id}
                        variant="contained"
                        color="primary"
                        onClick={(e) => handleVote(option.id, e)}
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
    <>

         <div className="tweet-text">
                    {tweet.isReply && (
                        <Link
                            onClick={handlePropagation}
                            href={`/${tweet.repliedTo?.author.username}`}
                            className="reply-to"
                        >
                            <span
                                className="mention"
                                onMouseEnter={(e) => handlePopoverOpen(e, "mention")}
                                onMouseLeave={handlePopoverClose}
                            >
                                @{tweet.repliedTo?.author.username}
                            </span>
                        </Link>
                    )}{" "}

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
                {tweet.photoUrl && (
                    <div onClick={handlePropagation}>
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
                    </div>
                )}
            </>
           )}

                <div onClick={(e) => e.stopPropagation()} className="tweet-bottom">
                
                {tweet.text && (
                isSpeaking ? (
                  <>
                    <IconButton onClick={stopSpeech}>
                    <FiVolumeX size={16} />
                    </IconButton>

                    {isPaused && isSpeaking ? (
                      <IconButton onClick={resumeSpeech}>
                        <FiPlay size={15} />
                      </IconButton>
                    ) : isSpeaking ? (
                      <IconButton onClick={pauseSpeech}>
                        <FiPause size={15} />
                      </IconButton>
                    ) : null}
                  </>
                ) : (
                  <IconButton onClick={() => handleSpeech(tweet.text)}>
                    <FiVolume2 size={16} />
                  </IconButton>
                ))}

                <Reply tweet={tweet} />
                <Retweet tweetId={tweet.id} tweetAuthor={tweet.author.username} />
                <Like tweetId={tweet.id} tweetAuthor={tweet.author.username} />
                <Share
                    tweetUrl={`https://${window.location.hostname}/${tweet.author.username}/tweets/${tweet.id}`}
                    />
                </div>
            </div>
            <Popover
                sx={{ pointerEvents: "none" }}
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "bottom", horizontal: "center" }}
                onClose={() => setAnchorEl(null)}
                disableRestoreFocus
            >
                <ProfileCard username={hoveredProfile} token={token} />
            </Popover>
            
        </motion.div>
    );
}







