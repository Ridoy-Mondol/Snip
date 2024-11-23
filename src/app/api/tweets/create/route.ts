// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// import { prisma } from "@/prisma/client";
// import { verifyJwtToken } from "@/utilities/auth";
// import { UserProps } from "@/types/UserProps";
// export async function POST(request: NextRequest) {
//     const { authorId, text, photoUrl, poll, isReply, repliedToId } = await request.json();

//     console.log("Received a POST request to create a poll.", poll);

//     const token = cookies().get("token")?.value;
//     const verifiedToken: UserProps = token && (await verifyJwtToken(token));

//     if (!verifiedToken || verifiedToken.id !== authorId) {
//         return NextResponse.json({
//             success: false,
//             message: "You are not authorized to perform this action.",
//         });
//     }

//     try {
//         const tweetData = {
//             text: text || "",
//             photoUrl: photoUrl || null,
//             isReply: isReply || false,
//             repliedTo: repliedToId
//                 ? {
//                       connect: { id: repliedToId }, 
//                   }
//                 : undefined,
//             isPoll: !!poll,
//             pollExpiresAt: poll?.expiresAt || null,
//             pollOptions: poll
//                 ? {
//                       create: poll.options.map((option: string) => ({ text: option })),
//                   }
//                 : undefined,
//             author: {
//                 connect: {
//                     id: authorId,
//                 },
//             },
//         };

//         console.log("Prepared tweet data for database:", JSON.stringify(tweetData, null, 2));

//         const createdTweet = await prisma.tweet.create({
//             data: tweetData,
//         });

//         console.log("Tweet created successfully:", createdTweet);

//         return NextResponse.json({ success: true, data: createdTweet });
//     } catch (error: any) {
//         console.error("Error creating tweet:", error);
//         return NextResponse.json({
//             success: false,
//             message: "Failed to create tweet.",
//             error: error.message,
//         });
//     }
// }






import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";
import { addDays, addMinutes, addHours } from "date-fns";

export async function POST(request: NextRequest) {
    const { authorId, text, photoUrl, poll, isReply, repliedToId } = await request.json();

    const token = cookies().get("token")?.value;
    const verifiedToken: UserProps = token && (await verifyJwtToken(token));

    if (!verifiedToken || verifiedToken.id !== authorId) {
        return NextResponse.json({
            success: false,
            message: "You are not authorized to perform this action.",
        });
    }

    try {
        // Initialize default poll values
        let pollExpiresAt = null;
        let pollOptions = undefined;

        if (poll) {
            // Compute poll expiration if poll data is provided
            if (poll.length?.days > 0 || poll.length?.hours > 0 || poll.length?.minutes > 0) {
                const now = new Date();
                pollExpiresAt = addDays(now, poll.length.days || 0);
                pollExpiresAt = addHours(pollExpiresAt, poll.length.hours || 0);
                pollExpiresAt = addMinutes(pollExpiresAt, poll.length.minutes || 0);
            } else {
                pollExpiresAt = addDays(new Date(), 7); // Default to 7 days if no length is specified
            }

            // Prepare poll options
            pollOptions = {
                create: poll.options.map((option: string) => ({
                    text: option,
                })),
            };
        }

        // const tweetText = poll?.question || text || "";
        let tweetText;

        if (poll !== null) {
             tweetText = poll.question;
        }

        if (poll === null && text) {
            tweetText = text;
        }

        // Prepare tweet data
        const tweetData = {
            text: tweetText, 
            photoUrl: photoUrl || null,
            isReply: isReply || false,
            repliedTo: repliedToId
                ? {
                      connect: { id: repliedToId },
                  }
                : undefined,
            isPoll: !!poll,
            pollExpiresAt: poll ? pollExpiresAt : null, // Only set expiration for polls
            pollOptions: pollOptions, // Add poll options only if poll exists
            author: {
                connect: {
                    id: authorId,
                },
            },
        };

        console.log("Prepared tweet data for database:", JSON.stringify(tweetData, null, 2));

        const createdTweet = await prisma.tweet.create({
            data: tweetData,
        });

        console.log("Tweet created successfully:", createdTweet);

        return NextResponse.json({ success: true, data: createdTweet });
    } catch (error: any) {
        console.error("Error creating tweet:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to create tweet.",
            error: error.message,
        });
    }
}
