import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";
import { addDays, addMinutes, addHours } from "date-fns";

export async function POST(request: NextRequest) {
    const { authorId, text, photoUrl, poll, isReply, repliedToId, schedule } = await request.json();

    const token = cookies().get("token")?.value;
    const verifiedToken: UserProps = token && (await verifyJwtToken(token));

    if (!verifiedToken || verifiedToken.id !== authorId) {
        return NextResponse.json({
            success: false,
            message: "You are not authorized to perform this action.",
        });
    }

    const secret = process.env.CREATION_SECRET_KEY;

    if (!secret) {
        return NextResponse.json({
            success: false,
            message: "Secret key not found.",
        });
    }

    let scheduledTime: Date | null = null;
        if (schedule) {
            const currentTime = new Date();

            switch (schedule) {
                case "1h":
                    scheduledTime = new Date(currentTime.getTime() + 1 * 60 * 60 * 1000);
                    break;
                case "2h":
                    scheduledTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
                    break;
                case "5h":
                    scheduledTime = new Date(currentTime.getTime() + 5 * 60 * 60 * 1000);
                    break;
                case "10h":
                    scheduledTime = new Date(currentTime.getTime() + 10 * 60 * 60 * 1000);
                    break;
                case "1D":
                    scheduledTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case "7D":
                    scheduledTime = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                case "Never":
                    scheduledTime = null;
                    break;
                default:
                    scheduledTime = null;
            }
        }


    try {
        let pollExpiresAt = null;
        let pollOptions = undefined;

        if (poll) {
            if (poll.length?.days > 0 || poll.length?.hours > 0 || poll.length?.minutes > 0) {
                const now = new Date();
                pollExpiresAt = addDays(now, poll.length.days || 0);
                pollExpiresAt = addHours(pollExpiresAt, poll.length.hours || 0);
                pollExpiresAt = addMinutes(pollExpiresAt, poll.length.minutes || 0);
            } else {
                pollExpiresAt = addDays(new Date(), 7);
            }

            // Prepare poll options
            pollOptions = {
                create: poll.options.map((option: string) => ({
                    text: option,
                })),
            };
        }

        let tweetText;

        if (poll !== null) {
             tweetText = poll.question;
        }

        if (poll === null && text) {
            tweetText = text;
        }

        const tweetData = {
            text: tweetText, 
            photoUrl: photoUrl || null,
            status: "draft",
            scheduledAt: scheduledTime,
            isReply: isReply || false,
            repliedTo: repliedToId
                ? {
                      connect: { id: repliedToId },
                  }
                : undefined,
            isPoll: !!poll,
            pollExpiresAt: poll ? pollExpiresAt : null,
            pollOptions: pollOptions,
            author: {
                connect: {
                    id: authorId,
                },
            },
        };

        console.log("Prepared draft data for database:", JSON.stringify(tweetData, null, 2));

        const createdTweet = await prisma.tweet.create({
            data: tweetData,
        });

        console.log("Draft created successfully:", createdTweet);

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
