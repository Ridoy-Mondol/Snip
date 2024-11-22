// import { Avatar, Popover, Tooltip } from "@mui/material";
// import { useRouter } from "next/navigation";
// import { useContext, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import { AiFillTwitterCircle } from "react-icons/ai";

// import { TweetProps } from "@/types/TweetProps";
// import { formatDate, formatDateExtended } from "@/utilities/date";
// import { shimmer } from "@/utilities/misc/shimmer";
// import Reply from "./Reply";
// import Retweet from "./Retweet";
// import Like from "./Like";
// import Share from "./Share";
// import PreviewDialog from "../dialog/PreviewDialog";
// import { getFullURL } from "@/utilities/misc/getFullURL";
// import { AuthContext } from "@/app/(twitter)/layout";
// import RetweetIcon from "../misc/RetweetIcon";
// import ProfileCard from "../user/ProfileCard";

// export default function Tweet({ tweet }: { tweet: TweetProps }) {
//     const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//     const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
//     const [hoveredProfile, setHoveredProfile] = useState("");

//     const { token } = useContext(AuthContext);
//     const router = useRouter();

//     let displayedTweet = tweet;

//     if (tweet.isRetweet) {
//         displayedTweet = tweet.retweetOf;
//     }

//     const handleTweetClick = () => {
//         router.push(`/${displayedTweet.author.username}/tweets/${displayedTweet.id}`);
//     };
//     const handlePropagation = (e: React.MouseEvent) => {
//         e.stopPropagation();
//     };
//     const handleImageClick = (e: React.MouseEvent) => {
//         e.stopPropagation();
//         handlePreviewClick();
//     };
//     const handlePreviewClick = () => {
//         setIsPreviewOpen(true);
//     };
//     const handlePreviewClose = () => {
//         setIsPreviewOpen(false);
//     };
//     const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>, type: "default" | "mention" | "retweet" = "default") => {
//         if (type === "mention") {
//             setHoveredProfile(displayedTweet.repliedTo.author.username);
//         }
//         if (type === "retweet") {
//             setHoveredProfile(tweet.author.username);
//         }
//         if (type === "default") {
//             setHoveredProfile(displayedTweet.author.username);
//         }
//         setAnchorEl(e.currentTarget);
//     };
//     const handlePopoverClose = () => {
//         setAnchorEl(null);
//     };

//     return (
//         <motion.div
//             onClick={handleTweetClick}
//             className={`tweet div-link ${tweet.isRetweet && "retweet"} ${displayedTweet.isReply && "reply"}`}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//         >
//             <Link
//                 onClick={handlePropagation}
//                 className="tweet-avatar"
//                 href={`/${displayedTweet.author.username}`}
//                 onMouseEnter={handlePopoverOpen}
//                 onMouseLeave={handlePopoverClose}
//             >
//                 <Avatar
//                     className="avatar"
//                     sx={{ width: 50, height: 50 }}
//                     alt=""
//                     src={displayedTweet.author.photoUrl ? getFullURL(displayedTweet.author.photoUrl) : "/assets/egg.jpg"}
//                 />
//             </Link>
//             <div className="tweet-main">
//                 <section className="tweet-author-section">
//                     <Link
//                         onClick={handlePropagation}
//                         className="tweet-author-link"
//                         href={`/${displayedTweet.author.username}`}
//                         onMouseEnter={handlePopoverOpen}
//                         onMouseLeave={handlePopoverClose}
//                     >
//                         <span className="tweet-author">
//                             {displayedTweet.author.name !== "" ? displayedTweet.author.name : displayedTweet.author.username}
//                             {displayedTweet.author.isPremium && (
//                                 <span className="blue-tick" data-blue="Verified Blue">
//                                     <AiFillTwitterCircle />
//                                 </span>
//                             )}
//                         </span>
//                         <span className="text-muted">@{displayedTweet.author.username}</span>
//                     </Link>
//                     <Tooltip title={formatDateExtended(displayedTweet.createdAt)} placement="top">
//                         <span className="text-muted date">
//                             <span className="middle-dot">·</span>
//                             {formatDate(displayedTweet.createdAt)}
//                         </span>
//                     </Tooltip>
//                 </section>
//                 <div className="tweet-text">
//                     {displayedTweet.isReply && (
//                         <Link
//                             onClick={handlePropagation}
//                             href={`/${displayedTweet.repliedTo.author.username}`}
//                             className="reply-to"
//                         >
//                             <span
//                                 className="mention"
//                                 onMouseEnter={(e) => handlePopoverOpen(e, "mention")}
//                                 onMouseLeave={handlePopoverClose}
//                             >
//                                 @{displayedTweet.repliedTo.author.username}
//                             </span>
//                         </Link>
//                     )}{" "}
//                     {displayedTweet.text}
//                 </div>
//                 {displayedTweet.photoUrl && (
//                     <div onClick={handlePropagation}>
//                         <div className="tweet-image">
//                             <Image
//                                 onClick={handleImageClick}
//                                 src={getFullURL(displayedTweet.photoUrl)}
//                                 alt="tweet image"
//                                 placeholder="blur"
//                                 blurDataURL={shimmer(500, 500)}
//                                 height={500}
//                                 width={500}
//                             />
//                         </div>
//                         <PreviewDialog
//                             open={isPreviewOpen}
//                             handlePreviewClose={handlePreviewClose}
//                             url={displayedTweet.photoUrl}
//                         />
//                     </div>
//                 )}
//                 <div onClick={handlePropagation} className="tweet-bottom">
//                     <Reply tweet={displayedTweet} />
//                     <Retweet tweetId={displayedTweet.id} tweetAuthor={displayedTweet.author.username} />
//                     <Like tweetId={displayedTweet.id} tweetAuthor={displayedTweet.author.username} />
//                     <Share
//                         tweetUrl={`https://${window.location.hostname}/${displayedTweet.author.username}/tweets/${displayedTweet.id}`}
//                     />
//                 </div>
//             </div>
//             {tweet.isRetweet &&
//                 (token?.username === tweet.author.username ? (
//                     <Link onClick={handlePropagation} href={`/${token?.username}`} className="retweeted-by">
//                         <RetweetIcon /> You retweeted.
//                     </Link>
//                 ) : (
//                     <Link
//                         onClick={handlePropagation}
//                         href={`/${tweet.author.username}`}
//                         className="retweeted-by"
//                         onMouseEnter={(e) => handlePopoverOpen(e, "retweet")}
//                         onMouseLeave={handlePopoverClose}
//                     >
//                         <RetweetIcon /> {`${tweet.author.name ? tweet.author.name : tweet.author.username} retweeted.`}
//                     </Link>
//                 ))}
//             <Popover
//                 sx={{
//                     pointerEvents: "none",
//                 }}
//                 open={Boolean(anchorEl)}
//                 anchorEl={anchorEl}
//                 anchorOrigin={{
//                     vertical: "top",
//                     horizontal: "center",
//                 }}
//                 transformOrigin={{
//                     vertical: "bottom",
//                     horizontal: "center",
//                 }}
//                 onClose={handlePopoverClose}
//                 disableRestoreFocus
//             >
//                 <ProfileCard username={hoveredProfile} token={token} />
//             </Popover>
//         </motion.div>
//     );
// }





import { Avatar, Popover, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AiFillTwitterCircle } from "react-icons/ai";
import { createClient } from "@supabase/supabase-js";

import { TweetProps } from "@/types/TweetProps";
import { formatDate, formatDateExtended } from "@/utilities/date";
import { shimmer } from "@/utilities/misc/shimmer";
import Reply from "./Reply";
import Retweet from "./Retweet";
import Like from "./Like";
import Share from "./Share";
import PreviewDialog from "../dialog/PreviewDialog";
import { getFullURL } from "@/utilities/misc/getFullURL";
import { AuthContext } from "@/app/(twitter)/layout";
import RetweetIcon from "../misc/RetweetIcon";
import ProfileCard from "../user/ProfileCard";
import { set } from "date-fns";
import CircularLoading from "../misc/CircularLoading";
import { LinearProgress, Button } from "@mui/material";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Tweet({ tweet }: { tweet: TweetProps }) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [hoveredProfile, setHoveredProfile] = useState("");
    const [userVoted, setUserVoted] = useState(false);
    
    const [updatedPollOptions, setUpdatedPollOptions] = useState(tweet.pollOptions);
    const [totalVotes, setTotalVotes] = useState(tweet.totalVotes);
    const [loading, setLoading] = useState(false);

    const { token } = useContext(AuthContext);
    const router = useRouter();

    const handlePreviewClick = (image: string) => {
        setPreviewImage(image);
        setIsPreviewOpen(true);
    };
    
    const handlePreviewClose = () => {
        setIsPreviewOpen(false);
        setPreviewImage(null);
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

    const isPollTweet = !tweet.text && tweet.pollOptions?.length > 0;

    // useEffect(() => {
    //     fetchVoteCounts();

    //     const channel = supabase
    //         .channel("realtime:PollOptions")
    //         .on(
    //             "postgres_changes",
    //             { event: "UPDATE", schema: "public", table: "PollOption" },
    //             (payload) => {
    //                 const updatedOption = payload.new;
    //                 // Update the relevant poll option
    //                 if (updatedOption) {
    //                     setUpdatedPollOptions((prevOptions) => 
    //                         prevOptions.map((option) =>
    //                             option.id === updatedOption.id
    //                                 ? { ...option, votes: updatedOption.votes }
    //                                 : option
    //                         )
    //                     );
    //                     setTotalVotes((prevVotes) => prevVotes + 1);
    //                 }
    //             }
    //         )
    //         .subscribe((status) => {
    //             if (status === "SUBSCRIBED") {
    //                 console.log("Subscribed to real-time poll updates.");
    //             } else {
    //                 console.error("Error subscribing to real-time updates:", status);
    //             }
    //         });

    //     // Cleanup subscription when component unmounts
    //     return () => {
    //         supabase.removeChannel(channel);
    //     };
    // }, []);

    useEffect(() => {
        fetchVoteCounts();
        fetchUserVotedStatus();
    }, []);

    if (loading) {
        return <CircularLoading />
    }

    return (
        <motion.div
            onClick={() => router.push(`/${tweet.author.username}/tweets/${tweet.id}`)}
            className={`tweet ${tweet.isRetweet && "retweet"} ${tweet.isReply && "reply"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Link
                onClick={(e) => e.stopPropagation()}
                className="tweet-avatar"
                href={`/${tweet.author.username}`}
                onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
                onMouseLeave={() => setAnchorEl(null)}
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
                        onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
                        onMouseLeave={() => setAnchorEl(null)}
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
                    <Tooltip title={formatDateExtended(tweet.createdAt)} placement="top">
                        <span className="text-muted date">
                            <span className="middle-dot">·</span>
                            {formatDate(tweet.createdAt)}
                        </span>
                    </Tooltip>
                </section>

  {isPollTweet ? (
    <div className="poll" style={{ padding: "1rem", borderRadius: "10px", border: "1px solid #e1e8ed" }}>
        <h4 className="poll-title" style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "1rem" }}>
            Poll
        </h4>
        <div className="poll-options" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {updatedPollOptions.map((option) => {
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

        <div className="total-votes" style={{ marginTop: "1rem", fontSize: "14px", color: "#657786" }}>
            {totalVotes === 0
                ? 'No votes yet'
                : `${totalVotes} ${totalVotes === 1 ? 'person' : 'people'} voted`}
        </div>

        {token && !userVoted && (
            <div className="vote-options" style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {updatedPollOptions.map((option) => (
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
    <div className="tweet-text">{tweet.text}</div>
)}




                <div onClick={(e) => e.stopPropagation()} className="tweet-bottom">
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
                {/* <ProfileCard user={tweet.author} /> */}
                <ProfileCard username={hoveredProfile} token={token} />
            </Popover>


        </motion.div>
    );
}







