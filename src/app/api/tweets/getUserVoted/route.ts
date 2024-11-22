import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
    const userId = request.headers.get("userId");
    const pollId = request.headers.get("pollId");

    if (!userId || !pollId) {
        return NextResponse.json({
            success: false,
            error: "Missing required headers: userId or pollId",
        });
    }

    try {
        // Check if the user has voted for any option in the given poll
        const userVote = await prisma.vote.findFirst({
            where: {
                userId: userId,
                pollOption: {
                    tweetId: pollId, // Ensure the pollOption is linked to the poll (Tweet ID)
                },
            },
            select: {
                id: true, // Fetch the vote ID if it exists
                pollOptionId: true, // Fetch the poll option the user voted for
            },
        });

        return NextResponse.json({
            success: true,
            hasVoted: !!userVote, // Returns true if the user has voted, false otherwise
            vote: userVote, // Include vote details if needed
        });
    } catch (error: unknown) {
        console.error("Error checking user vote:", error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message,
        });
    }
}
