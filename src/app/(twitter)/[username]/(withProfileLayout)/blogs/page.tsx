"use client";

import { useQuery } from "@tanstack/react-query";
import Blog from "@/components/blogs/Blog";
import { getUserTweets } from "@/utilities/fetch";
import CircularLoading from "@/components/misc/CircularLoading";
import NotFound from "@/app/not-found";
import NothingToShow from "@/components/misc/NothingToShow";

export default function UserTweets({ params: { username } }: { params: { username: string } })

{
    // const { isLoading, data } = useQuery({
    //     queryKey: ["tweets", username],
    //     queryFn: () => getUserTweets(username),
    // });

    // if (!isLoading && !data.tweets) return NotFound();

    // if (data && data.tweets.length === 0) return NothingToShow();

    // return <>{isLoading ? <CircularLoading /> : <Blog />}</>;

    return <Blog username={username} />
}
