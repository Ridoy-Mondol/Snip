import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function PATCH(request: NextRequest, { params }: { params: { tweetId: string } }) {
    const { tweetId } = params;
    const { authorId, text, schedule } = await request.json();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const verifiedToken: UserProps = token && (await verifyJwtToken(token));

    if (!verifiedToken) {
        return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
    }

    if (verifiedToken.id !== authorId) {
        return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
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
        const updatedTweet = await prisma.tweet.update({
            where: { id: tweetId },
            data: { 
                text,
                scheduledAt: scheduledTime,
            },
        });
        return NextResponse.json({ success: true, data: updatedTweet });
    } catch (error) {
        console.error("Error updating tweet:", error);
        return NextResponse.json({ success: false, message: "Failed to update tweet.", error });
    }
}
