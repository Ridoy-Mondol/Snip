import { useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AuthContext } from "@/context/AuthContext";
import { updateUserFollows, subscribeToNotifications } from "@/utilities/fetch";
import { UserProps, UserResponse } from "@/types/UserProps";
import CustomSnackbar from "../misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";

export default function Follow({ profile }: { profile: UserProps }) {
    const [isFollowed, setIsFollowed] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });
    const [isSubscribed, setIsSubscribed] = useState(false);

    const { token, isPending } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const queryKey = ["users", profile.username];

    const followMutation = useMutation({
        mutationFn: (tokenOwnerId: string) => updateUserFollows(profile.username, tokenOwnerId, false),
        onMutate: async (tokenOwnerId: string) => {
            setIsButtonDisabled(true);
            await queryClient.cancelQueries({ queryKey: queryKey });
            const previous = queryClient.getQueryData<UserResponse>(queryKey);
            setIsFollowed(true);
            if (previous) {
                queryClient.setQueryData(queryKey, {
                    ...previous,
                    user: {
                        ...previous.user,
                        followers: [...previous.user.followers, tokenOwnerId],
                    },
                });
            }
            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: (tokenOwnerId: string) => updateUserFollows(profile.username, tokenOwnerId, true),
        onMutate: async (tokenOwnerId: string) => {
            setIsButtonDisabled(true);
            await queryClient.cancelQueries({ queryKey: queryKey });
            const previous = queryClient.getQueryData<UserResponse>(queryKey);
            setIsFollowed(false);
            if (previous) {
                queryClient.setQueryData(queryKey, {
                    ...previous,
                    user: {
                        ...previous.user,
                        followers: previous.user.followers.filter(
                            (user: UserProps) => JSON.stringify(user.id) !== tokenOwnerId
                        ),
                    },
                });
            }
            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    const subscribeMutation = useMutation({
        mutationFn: ({ subscriberId, subscribedToId, isSubscribed }: { subscriberId: string; subscribedToId: string; isSubscribed: boolean }) =>
            subscribeToNotifications(subscriberId, subscribedToId, isSubscribed),
        onError: () => {
            setSnackbar({ message: "Something went wrong", severity: "error", open: true });
        },
        onSuccess: () => {
            setSnackbar({ message: isSubscribed ?"Notifications enabled." : "Notifications disabled.", severity: "success", open: true });
            window.location.reload();
        },
    });

    const handleFollowClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!token) {
            return setSnackbar({
                message: "You need to login first to follow someone.",
                severity: "info",
                open: true,
            });
        }

        const tokenOwnerId = JSON.stringify(token.id);
        const followers = profile.followers;
        const isFollowedByTokenOwner = followers?.some((user: { id: string }) => JSON.stringify(user.id) === tokenOwnerId);

        if (!followMutation.isLoading && !unfollowMutation.isLoading) {
            if (isFollowedByTokenOwner) {
                unfollowMutation.mutate(tokenOwnerId);
            } else {
                followMutation.mutate(tokenOwnerId);
            }
        }
    };

    const handleBellClick = () => {
        if (!token) {
            return setSnackbar({
                message: "You need to login first to enable notifications.",
                severity: "info",
                open: true,
            });
        }

        const subscriberId = token?.id;
        const subscribedToId = profile.id;

        subscribeMutation.mutate({ subscriberId, subscribedToId, isSubscribed });

        setIsSubscribed(!isSubscribed);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const checkSubscription = async () => {
        if (!token || !profile.id) return;

        const subscriberId = token.id;
        const subscribedToId = profile.id;

        try {
            const response = await fetch("/api/users/subscribe/issubscribed", {
                method: "GET",
                headers: {
                    "subscriberId": subscriberId,
                    "subscribedToId": subscribedToId,
                },
            });

            const data = await response.json();
            if (data.success && data.isSubscribed) {
                setIsSubscribed(true);
            } else {
                setIsSubscribed(false);
            }
        } catch (error) {
            console.error("Failed to check subscription", error);
        }
    };

    useEffect(() => {
        if (!isPending && token) {
            const tokenOwnerId = JSON.stringify(token.id);
            const followers = profile.followers;
            const isFollowedByTokenOwner = followers?.some(
                (user: { id: string }) => JSON.stringify(user.id) === tokenOwnerId
            );
            setIsFollowed(isFollowedByTokenOwner);
        }
    }, [isPending]);

    useEffect(() => {
        checkSubscription();
    }, [token, profile.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsButtonDisabled(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [isButtonDisabled]);

    const conditionalText = isFollowed ? (isHovered ? "Unfollow" : "Following") : "Follow";
    const conditionalClass = isFollowed ? (isHovered ? "btn btn-danger-outline" : "btn btn-white") : "btn btn-dark";

    return (
        <>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}
            >
                <button
                    onClick={handleFollowClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={conditionalClass}
                    disabled={isButtonDisabled}
                >
                    {conditionalText}
                </button>
                {isFollowed && (
                    <span
                        style={{
                            fontSize: "1.2rem",
                            color: "#f39c12",
                            cursor: "pointer",
                        }}
                        title={isSubscribed ? "Notifications enabled" : "Click to receive notifications"}
                        onClick={handleBellClick}
                    >
                        {isSubscribed ? "🔕" : "🔔"}
                    </span>
                )}
            </div>
            {snackbar.open && (
                <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
            )}
        </>
    );
}
