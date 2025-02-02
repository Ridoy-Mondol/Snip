"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { getDraftTweets } from "@/utilities/fetch";
import Tweets from "@/components/tweet/Tweets";
import { AuthContext } from "@/context/AuthContext";
import CircularLoading from "@/components/misc/CircularLoading";

export default function ExplorePage() {
    const { token, isPending } = useContext(AuthContext);

    const { data, fetchNextPage, isLoading, hasNextPage } = useInfiniteQuery(
        ["drafts"],
        async ({ pageParam = 1 }) =>  {
            if (!token) return { tweets: [], nextPage: null, lastPage: null };
            return getDraftTweets(pageParam, token.id);
        },
        {
            getNextPageParam: (lastResponse) => {
                if (!lastResponse?.tweets?.length || lastResponse.nextPage > lastResponse.lastPage) return false;
                return lastResponse.nextPage;
            },
        }
    );

    const tweetsResponse = useMemo(
        () =>
            data?.pages.reduce((prev, page) => {
                return {
                    nextPage: page.nextPage,
                    tweets: [...prev.tweets, ...page.tweets],
                };
            }, { nextPage: 1, tweets: [] }),
        [data]
    );

    if (isPending) return <CircularLoading />;
    return (
        <main>
            {isLoading ? (
                <CircularLoading />
            ) : (
                <InfiniteScroll
                    dataLength={tweetsResponse ? tweetsResponse.tweets.length : 0}
                    next={() => fetchNextPage()}
                    hasMore={!!hasNextPage}
                    loader={<CircularLoading />}
                >
                    <Tweets tweets={tweetsResponse && tweetsResponse.tweets} />
                </InfiniteScroll>
            )}
        </main>
    );
}
