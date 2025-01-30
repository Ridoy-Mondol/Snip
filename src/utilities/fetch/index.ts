import { NotificationContent, NotificationTypes } from "@/types/NotificationProps";

const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

export const getAllTweets = async (page = "1") => {
    const response = await fetch(`${HOST_URL}/api/tweets/all?page=${page}`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const getRelatedTweets = async () => {
    const response = await fetch(`${HOST_URL}/api/tweets/related`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const getUserTweets = async (username: string) => {
    const response = await fetch(`${HOST_URL}/api/tweets/${username}`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const getUserLikes = async (username: string) => {
    const response = await fetch(`${HOST_URL}/api/tweets/${username}/likes`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const getUserMedia = async (username: string) => {
    const response = await fetch(`${HOST_URL}/api/tweets/${username}/media`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const getUserReplies = async (username: string) => {
    const response = await fetch(`${HOST_URL}/api/tweets/${username}/replies`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const getUserTweet = async (tweetId: string, tweetAuthor: string) => {
    const response = await fetch(`${HOST_URL}/api/tweets/${tweetAuthor}/${tweetId}`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};


export const createTweet = async (tweetData: {
    text: string;
    authorId: string;
    photoUrl: string;
    poll: null | {
        question: string;
        options: string[];
        length: {
            days: number;
            hours: number;
            minutes: number;
        };
    };
}) => {
    try {
        const response = await fetch(`${HOST_URL}/api/tweets/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tweetData),
        });

        const json = await response.json();

        if (!json.success) {
            throw new Error(json.message || "Something went wrong.");
        }

        console.log("Tweet created successfully:", json);
        return json;
    } catch (error) {
        console.error("Error creating tweet:", error);
        throw error; 
    }
};




export const createBlog = async (blog: { title: string, category: string, content: string, authorId: string, photoUrl: string }) => {
    const response = await fetch(`${HOST_URL}/api/blogs/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(blog),
    });

    const json = await response.json();

    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    
    return json;
};

export const draftBlog = async (blog: { 
    title: string, 
    category: string, 
    content: string, 
    authorId: string, 
    photoUrl: string,
    schedule: string, 
}) => {
    const response = await fetch(`${HOST_URL}/api/blogs/draft/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(blog),
    })

    const json = await response.json();

    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");

    return json;

}

export const updateBlog = async (blog: { 
    id: string; 
    title?: string; 
    category?: string; 
    content?: string; 
    authorId: string; 
    photoUrl?: string;
    schedule?: string; 
}) => {
    const response = await fetch(`${HOST_URL}/api/blogs/update/${blog.id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: blog.title,
            category: blog.category,
            content: blog.content,
            photoUrl: blog.photoUrl,
            authorId: blog.authorId,
        }),
    });

    const json = await response.json();

    if (!json.success) {
        throw new Error(json.message || "Something went wrong while updating the blog.");
    }

    return json;
};

export const publishBlog = async (blog: { 
    id: string; 
    title?: string; 
    category?: string; 
    content?: string; 
    authorId: string; 
    photoUrl?: string;
    schedule?: string; 
}) => {
    const response = await fetch(`${HOST_URL}/api/blogs/draft/publish/${blog.id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: blog.title,
            category: blog.category,
            content: blog.content,
            photoUrl: blog.photoUrl,
            authorId: blog.authorId,
        }),
    });

    const json = await response.json();

    if (!json.success) {
        throw new Error(json.message || "Something went wrong while updating the blog.");
    }

    return json;
};

export const getAllBlogs = async () => {
    const response = await fetch(`${HOST_URL}/api/blogs`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const getDraftBlogs = async (userId: string) => {
    const response = await fetch(`${HOST_URL}/api/blogs/draft/get`, {
        next: {
            revalidate: 0,
        },
        headers: {
            'userId': userId,
          },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};




export const logIn = async (candidate: string) => {
    const response = await fetch(`${HOST_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: candidate,
    });
    return response.json();
};

export const logInAsTest = async (userAgent: string, ipAddress: string) => {
    const testAccount = {
        username: "test",
        password: "123456789",
        browser: userAgent,
        ip: ipAddress,
    };
    return await logIn(JSON.stringify(testAccount));
};

export const logout = async ({ userAgent, ipAddress }: { userAgent: string; ipAddress: string }) => {
    await fetch(`${HOST_URL}/api/auth/logout`, {
        method: "GET",  
        headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            "X-Forwarded-For": ipAddress,
        },
        next: {
            revalidate: 0,
        },
    });
};

export const createUser = async (newUser: string) =>
 {
    console.log("HOST_URL:", HOST_URL);
    const response = await fetch(`${HOST_URL}/api/users/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: newUser,
    });
    return response.json();
};

export const getUser = async (username: string) => {
    const response = await fetch(`${HOST_URL}/api/users/${username}`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const editUser = async (updatedUser: string, username: string) => {
    const response = await fetch(`${HOST_URL}/api/users/${username}/edit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: updatedUser,
    });
    return response.json();
};

export const updateTweetLikes = async (tweetId: string, tweetAuthor: string, tokenOwnerId: string, isLiked: boolean) => {
    const route = isLiked ? "unlike" : "like";
    const response = await fetch(`${HOST_URL}/api/tweets/${tweetAuthor}/${tweetId}/${route}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: tokenOwnerId,
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const updateRetweets = async (tweetId: string, tweetAuthor: string, tokenOwnerId: string, isRetweeted: boolean) => {
    const route = isRetweeted ? "unretweet" : "retweet";
    const response = await fetch(`${HOST_URL}/api/tweets/${tweetAuthor}/${tweetId}/${route}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: tokenOwnerId,
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const updateUserFollows = async (followedUsername: string, tokenOwnerId: string, isFollowed: boolean) => {
    const route = isFollowed ? "unfollow" : "follow";
    const response = await fetch(`${HOST_URL}/api/users/${followedUsername}/${route}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: tokenOwnerId,
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export async function subscribeToNotifications(subscriberId: string, subscribedToId: string, isSubscribed: boolean) {
    const route = isSubscribed ? '/api/users/unsubscribe' : '/api/users/subscribe';
    let requestOptions: RequestInit;

    if (isSubscribed) {
        requestOptions = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "subscriberId": subscriberId,
                "subscribedToId": subscribedToId,
            }, 
        };
    } else {
        requestOptions = {
            method: "POST",  
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ subscriberId, subscribedToId }), 
        };
    }
    const response = await fetch(route,requestOptions);

    if (!response.ok) {
        throw new Error(isSubscribed ? "Failed to unsubscribe from notifications" : "Failed to subscribe to notifications");
    } else {
        console.log(isSubscribed ? "Successfully unsubscribed from notifications" : "Successfully subscribed to notifications");
    }

    return response.json();
}

export const deleteTweet = async (tweetId: string, tweetAuthor: string, tokenOwnerId: string) => {
    const response = await fetch(`${HOST_URL}/api/tweets/${tweetAuthor}/${tweetId}/delete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: tokenOwnerId,
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const updateTweet = async (
    tweetId: string,
    tokenId: string,
    updatedTweetData: { text: string; authorId: string }
) => {
    try {
        const response = await fetch(`${HOST_URL}/api/tweets/${updatedTweetData.authorId}/${tweetId}/update`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tokenId, 
                ...updatedTweetData,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update tweet: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating tweet:", error);
        throw error;
    }
};

export const createReply = async (reply: string, tweetAuthor: string, tweetId: string) => {
    const response = await fetch(`${HOST_URL}/api/tweets/${tweetAuthor}/${tweetId}/reply`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: reply,
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const getReplies = async (tweetAuthor: string, tweetId: string) => {
    const response = await fetch(`${HOST_URL}/api/tweets/${tweetAuthor}/${tweetId}/reply`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const search = async (text: string) => {
    const response = await fetch(`${HOST_URL}/api/search?q=${text}`);
    return response.json();
};

export const getRandomThreeUsers = async () => {
    const response = await fetch(`${HOST_URL}/api/users/random`);
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const createMessage = async (message: string) => {
    const response = await fetch(`${HOST_URL}/api/messages/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: message,
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const getUserMessages = async (username: string) => {
    const response = await fetch(`${HOST_URL}/api/messages/${username}`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const checkUserExists = async (username: string) => {
    const response = await fetch(`${HOST_URL}/api/users/exists?q=${username}`);
    if (!response.ok) {
        console.error("Error fetching checkUserExists", response.status, response.statusText);
        return { success: false };
    }
    return await response.json();
};

export const deleteConversation = async (participants: string[], tokenOwnerId: string) => {
    const response = await fetch(`${HOST_URL}/api/messages/delete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ participants, tokenOwnerId }),
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const getNotifications = async () => {
    const response = await fetch(`${HOST_URL}/api/notifications`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const createNotification = async (
    recipient: string,
    type: NotificationTypes,
    secret: string,
    notificationContent: NotificationContent = null
) => {
    const response = await fetch(`${HOST_URL}/api/notifications/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient, type, secret, notificationContent }),
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};

export const markNotificationsRead = async () => {
    const response = await fetch(`${HOST_URL}/api/notifications/read`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};


export const markMessageNotificationsRead = async (notificationId: string) => {
    const response = await fetch(`${HOST_URL}/api/notifications/message/read/${notificationId}`, {
        next: {
            revalidate: 0,
        },
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message ? json.message : "Something went wrong.");
    return json;
};


