import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client"; 

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters from the URL using the get method
    const tweetId = request.nextUrl.searchParams.get("tweetId");
    const optionId = request.nextUrl.searchParams.get("optionId");

    // Validate that tweetId and optionId are present
    if (!tweetId || !optionId) {
      return NextResponse.json({
        success: false,
        message: "Missing tweetId or optionId in the query parameters.",
      });
    }

    // Fetch the tweet with the poll options and vote counts
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
      include: {
        pollOptions: {
          where: { id: optionId },
          select: {
            id: true,
            votes: true,  // You can adjust this to get the count or any other field you need
          },
        },
      },
    });

    // Check if the tweet and poll options are found
    if (!tweet || !tweet.isPoll || tweet.pollOptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: "This tweet does not have a valid poll or poll option not found.",
      });
    }

    // Return the vote status for the specified option
    const pollOption = tweet.pollOptions[0]; // As we are filtering by optionId
    return NextResponse.json({
      success: true,
      pollOption: {
        id: pollOption.id,
        votes: pollOption.votes, // You can return the votes count here
      },
    });
  } catch (error) {
    console.error("Error fetching vote status:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch vote status.",
    });
  }
}
