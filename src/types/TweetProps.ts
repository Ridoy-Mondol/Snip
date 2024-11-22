// import { UserProps } from "./UserProps";

// export type TweetProps = {
//     id: string;
//     text: string;
//     createdAt: Date;
//     author: UserProps;
//     authorId: string;
//     photoUrl: string;
//     likedBy: UserProps[];
//     retweets: TweetProps[];
//     replies: TweetProps[];
//     isRetweet: boolean;
//     retweetedBy: UserProps[];
//     retweetedById: string;
//     retweetOf: TweetProps;
//     isReply: boolean;
//     repliedTo: TweetProps;
//     repliedToId: string;
// };

// export type TweetsArray = {
//     tweets: TweetProps[];
// };

// export type TweetResponse = {
//     success: boolean;
//     tweet: TweetProps;
// };

// export type TweetOptionsProps = {
//     tweetId: string;
//     tweetAuthor: string;
// };

// export type NewTweetProps = {
//     token: UserProps;
//     handleSubmit?: () => void;
// };







import { UserProps } from "./UserProps";

export type PollOptionProps = {
    id: string;
    text: string;
    votes: number;
};

export type TweetProps = {
    id: string;
    text: string;
    createdAt: Date;
    author: UserProps;
    authorId: string;
    photoUrl: string | null; // photoUrl is now nullable
    likedBy: UserProps[];
    retweets: TweetProps[];
    replies: TweetProps[];
    isRetweet: boolean;
    retweetedBy: UserProps[];
    retweetedById: string;
    retweetOf: TweetProps | null; // retweetOf is nullable (nullable relation)
    isReply: boolean;
    repliedTo: TweetProps | null; // repliedTo is nullable (nullable relation)
    repliedToId: string | null;
    
    // Poll-specific fields
    isPoll: boolean;            // Indicates whether the tweet is a poll
    pollOptions: PollOptionProps[]; // Array of poll options
    pollExpiresAt: Date | null;   // When the poll expires (nullable)
    totalVotes: number;          // Total number of votes in the poll
};

export type TweetsArray = {
    tweets: TweetProps[];
};

export type TweetResponse = {
    success: boolean;
    tweet: TweetProps;
};

export type TweetOptionsProps = {
    tweetId: string;
    tweetAuthor: string;
};

export type NewTweetProps = {
    token: UserProps;
    handleSubmit?: () => void;
};
