"use client";
import { useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { motion } from "framer-motion";

import { TweetOptionsProps, TweetResponse } from "@/types/TweetProps";
import { getUserTweet, updateTweetLikes } from "@/utilities/fetch";
import { AuthContext } from "@/context/AuthContext";
import { SnackbarProps } from "@/types/SnackbarProps";
import CustomSnackbar from "../misc/CustomSnackbar";

export default function Like({ tweetId, tweetAuthor }: TweetOptionsProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

    const { token, isPending } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const queryKey = ["tweets", tweetAuthor, tweetId];

    const { isFetched, data } = useQuery({
        queryKey: queryKey,
        queryFn: () => getUserTweet(tweetId, tweetAuthor),
        onSuccess: (data) => {
            const tokenOwnerId = JSON.stringify(token?.id);
            const likedBy = data?.tweet?.likedBy;
            const isLikedByTokenOwner = likedBy?.some((user: { id: string }) => JSON.stringify(user.id) === tokenOwnerId);
            setIsLiked(isLikedByTokenOwner);
        },
    });

    const likeMutation = useMutation({
        mutationFn: (tokenOwnerId: string) => updateTweetLikes(tweetId, tweetAuthor, tokenOwnerId, false),
        onMutate: async (tokenOwnerId: string) => {
            setIsButtonDisabled(true);
            await queryClient.cancelQueries({ queryKey: queryKey });
            const previousTweet = queryClient.getQueryData<TweetResponse>(queryKey);
            return { previousTweet };
        },
        onError: (err, variables, context) => {
            if (context?.previousTweet) {
                queryClient.setQueryData<TweetResponse>(queryKey, context.previousTweet);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
        },
    });

    const unlikeMutation = useMutation({
        mutationFn: (tokenOwnerId) => updateTweetLikes(tweetId, tweetAuthor, tokenOwnerId, true),
        onMutate: async (tokenOwnerId: string) => {
            setIsButtonDisabled(true);
            await queryClient.cancelQueries({ queryKey: queryKey });
            const previous = queryClient.getQueryData<TweetResponse>(queryKey);
            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData<TweetResponse>(queryKey, context.previous);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
        },
    });

    const handleLike = () => {
        if (!token) {
            return setSnackbar({
                message: "You need to login to like a tweet.",
                severity: "info",
                open: true,
            });
        }

        const tokenOwnerId = JSON.stringify(token.id);
        const likedBy = data?.tweet?.likedBy;
        const isLikedByTokenOwner = likedBy.some((user: { id: string }) => JSON.stringify(user.id) === tokenOwnerId);

        if (!likeMutation.isLoading && !unlikeMutation.isLoading) {
            if (isLikedByTokenOwner) {
                unlikeMutation.mutate(tokenOwnerId);
            } else {
                likeMutation.mutate(tokenOwnerId);
            }
        }
    };

    useEffect(() => {
        if (!isPending && isFetched) {
            const tokenOwnerId = JSON.stringify(token?.id);
            const likedBy = data?.tweet?.likedBy;
            const isLikedByTokenOwner = likedBy?.some((user: { id: string }) => JSON.stringify(user.id) === tokenOwnerId);
            setIsLiked(isLikedByTokenOwner);
        }
    }, [isPending, isFetched]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsButtonDisabled(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [isButtonDisabled]);

    return (
        <>
            <motion.button
                className={`icon like ${(data?.tweet?.likedBy?.length > 0) && isLiked ? "active" : ""}`}
                onClick={handleLike}
                whileTap={{ scale: 0.9 }}
                animate={{ scale: isLiked ? [1, 1.5, 1.2, 1] : 1 }}
                transition={{ duration: 0.25 }}
                disabled={isButtonDisabled}
            >
                {(data?.tweet?.likedBy?.length > 0) && isLiked ? (
                    <motion.span animate={{ scale: [1, 1.5, 1.2, 1] }} transition={{ duration: 0.25 }}>
                        <FaHeart />
                    </motion.span>
                ) : (
                    <motion.span animate={{ scale: [1, 0.8, 1] }} transition={{ duration: 0.25 }}>
                        <FaRegHeart />
                    </motion.span>
                )}
                <motion.span animate={{ scale: isLiked ? [0, 1.2, 1] : 0 }} transition={{ duration: 0.25 }} />
                {data?.tweet?.likedBy?.length === 0 ? null : <span className="count">{data?.tweet?.likedBy?.length}</span>}
            </motion.button>
            {snackbar.open && (
                <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
            )}
        </>
    );
}
