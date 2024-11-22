// import { NextRequest, NextResponse } from "next/server";

// import { prisma } from "@/prisma/client";

// export async function GET(request: NextRequest) {
//     let page = request.nextUrl.searchParams.get("page");
//     const limit = "10";

//     if (!page) {
//         page = "1";
//     }

//     const parsedPage = Number(page);
//     const parsedLimit = Number(limit);
//     let nextPage = parsedPage + 1;

//     try {
//         const tweets = await prisma.tweet.findMany({
//             where: {
//                 isReply: false,
//             },
//             include: {
//                 author: {
//                     select: {
//                         id: true,
//                         username: true,
//                         name: true,
//                         isPremium: true,
//                         photoUrl: true,
//                         description: true,
//                     },
//                 },
//                 likedBy: {
//                     select: {
//                         id: true,
//                         username: true,
//                         name: true,
//                         isPremium: true,
//                         photoUrl: true,
//                         description: true,
//                     },
//                 },
//                 retweetedBy: {
//                     select: {
//                         id: true,
//                         username: true,
//                         name: true,
//                         isPremium: true,
//                         photoUrl: true,
//                         description: true,
//                     },
//                 },
//                 retweetOf: {
//                     select: {
//                         id: true,
//                         author: {
//                             select: {
//                                 id: true,
//                                 username: true,
//                                 name: true,
//                                 isPremium: true,
//                                 photoUrl: true,
//                                 description: true,
//                             },
//                         },
//                         authorId: true,
//                         createdAt: true,
//                         likedBy: {
//                             select: {
//                                 id: true,
//                                 username: true,
//                                 name: true,
//                                 isPremium: true,
//                                 photoUrl: true,
//                                 description: true,
//                             },
//                         },
//                         retweetedBy: {
//                             select: {
//                                 id: true,
//                                 username: true,
//                                 name: true,
//                                 isPremium: true,
//                                 photoUrl: true,
//                                 description: true,
//                             },
//                         },
//                         photoUrl: true,
//                         text: true,
//                         isReply: true,
//                         repliedTo: {
//                             select: {
//                                 id: true,
//                                 author: {
//                                     select: {
//                                         id: true,
//                                         username: true,
//                                         name: true,
//                                         isPremium: true,
//                                         photoUrl: true,
//                                         description: true,
//                                     },
//                                 },
//                             },
//                         },
//                         replies: {
//                             select: {
//                                 authorId: true,
//                             },
//                         },
//                     },
//                 },
//                 replies: {
//                     select: {
//                         id: true,
//                     },
//                 },
//                 repliedTo: {
//                     select: {
//                         id: true,
//                         author: {
//                             select: {
//                                 id: true,
//                                 username: true,
//                                 name: true,
//                                 isPremium: true,
//                                 photoUrl: true,
//                                 description: true,
//                             },
//                         },
//                     },
//                 },
//             },
//             orderBy: [
//                 {
//                     createdAt: "desc",
//                 },
//             ],
//             skip: (parsedPage - 1) * parsedLimit,
//             take: parsedLimit,
//         });

//         const totalTweets = await prisma.tweet.count();
//         const lastPage = Math.ceil(totalTweets / parsedLimit);

//         return NextResponse.json({ success: true, tweets, nextPage, lastPage });
//     } catch (error: unknown) {
//         return NextResponse.json({ success: false, error });
//     }
// }














import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
    let page = request.nextUrl.searchParams.get("page");
    const limit = "10";

    if (!page) {
        page = "1";
    }

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    let nextPage = parsedPage + 1;

    try {
        const tweets = await prisma.tweet.findMany({
            where: {
                isReply: false, // Fetch only top-level tweets, excluding replies
            },
            select: {
                id: true,
                text: true,
                createdAt: true,
                isPoll: true,
                pollExpiresAt: true, // Fetch poll expiration time
                totalVotes: true, // Fetch the total number of votes
                photoUrl: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        isPremium: true,
                        photoUrl: true,
                        description: true,
                    },
                },
                likedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        isPremium: true,
                        photoUrl: true,
                        description: true,
                    },
                },
                retweetedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        isPremium: true,
                        photoUrl: true,
                        description: true,
                    },
                },
                retweetOf: {
                    select: {
                        id: true,
                        text: true,
                        photoUrl: true,
                        isReply: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                isPremium: true,
                                photoUrl: true,
                                description: true,
                            },
                        },
                        likedBy: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                isPremium: true,
                                photoUrl: true,
                                description: true,
                            },
                        },
                        retweetedBy: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                isPremium: true,
                                photoUrl: true,
                                description: true,
                            },
                        },
                        repliedTo: {
                            select: {
                                id: true,
                                author: {
                                    select: {
                                        id: true,
                                        username: true,
                                        name: true,
                                        isPremium: true,
                                        photoUrl: true,
                                        description: true,
                                    },
                                },
                            },
                        },
                        replies: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
                replies: {
                    select: {
                        id: true,
                    },
                },
                repliedTo: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                isPremium: true,
                                photoUrl: true,
                                description: true,
                            },
                        },
                    },
                },
                pollOptions: {
                    select: {
                        id: true,
                        text: true,
                        votes: true, // Fetch votes for each poll option
                    },
                },
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
            ],
            skip: (parsedPage - 1) * parsedLimit,
            take: parsedLimit,
        });

        const totalTweets = await prisma.tweet.count();
        const lastPage = Math.ceil(totalTweets / parsedLimit);

        return NextResponse.json({ success: true, tweets, nextPage, lastPage });
    } catch (error: unknown) {
        console.error("Error fetching tweets:", error);
        return NextResponse.json({ success: false, error: (error as Error).message });
    }
}
