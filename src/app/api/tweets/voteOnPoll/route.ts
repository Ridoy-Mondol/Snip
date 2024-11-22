import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { cookies } from "next/headers";
import { UserProps } from "@/types/UserProps";

export async function POST(request: NextRequest) {
    try {
        // Parse incoming JSON request
        const { tweetId, optionId, userId } = await request.json();

        console.log("Received vote request:", { tweetId, optionId, userId });

        // Validate required fields from the frontend
        if (!tweetId || !optionId || !userId) {
            return NextResponse.json({
                success: false,
                message: "Missing tweetId, optionId, or userId in the request.",
            });
        }

        // Authenticate the user using the Authorization header
        const token = cookies().get("token")?.value;

        if (!token) {
            return NextResponse.json({
                success: false,
                message: "Missing or invalid authentication token.",
            });
        }

        const verifiedToken: UserProps = token && (await verifyJwtToken(token));

        if (!verifiedToken || verifiedToken.id !== userId) {
            return NextResponse.json({
                success: false,
                message: "You are not authenticated or userId does not match.",
            });
        }

        // Fetch the tweet and associated poll options
        const tweet = await prisma.tweet.findUnique({
            where: { id: tweetId },
            include: { pollOptions: true },
        });

        if (!tweet || !tweet.isPoll || tweet.pollOptions.length === 0) {
            return NextResponse.json({
                success: false,
                message: "This tweet does not have a valid poll.",
            });
        }

        // Validate the selected poll option
        const pollOption = tweet.pollOptions.find((option) => option.id === optionId);
        if (!pollOption) {
            return NextResponse.json({
                success: false,
                message: "Poll option not found.",
            });
        }

        // Check if the user has already voted for this poll
        const existingVote = await prisma.vote.findFirst({
            where: {
                userId,
                pollOption: { tweetId },
            },
        });

        if (existingVote) {
            return NextResponse.json({
                success: false,
                message: "You have already voted for this poll.",
            });
        }

        // Cast a new vote
        await prisma.vote.create({
            data: {
                userId,
                pollOptionId: optionId,
            },
        });

        // Increment the vote count for the selected option
        await prisma.pollOption.update({
            where: { id: optionId },
            data: { votes: { increment: 1 } },
        });

        // Update the total votes count for the tweet
        const totalVotes = await prisma.vote.count({
            where: { pollOption: { tweetId } },
        });

        await prisma.tweet.update({
            where: { id: tweetId },
            data: { totalVotes },
        });

        return NextResponse.json({
            success: true,
            message: "Vote cast successfully.",
        });
    } catch (error: any) {
        console.error("Error processing poll vote:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to process your vote.",
            error: error.message,
        });
    }
}
