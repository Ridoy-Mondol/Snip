import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const apiKey = request.headers.get("x-api-key");

        if (!apiKey) {
            return NextResponse.json({
                success: false,
                message: "API key is missing.",
            });
        }

        const user = await prisma.user.findFirst({
            where: { apiKey },
            select: {
                id: true,
                username: true,
            },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Invalid API key.",
            });
        }

        const tweetId = params.id;

        if (!tweetId) {
            return NextResponse.json({
                success: false,
                message: "Tweet ID is required.",
            });
        }

        const tweet = await prisma.tweet.findUnique({
            where: { id: tweetId },
            include: {
                pollOptions: true,
            },
            },
        );

        if (!tweet) {
            return NextResponse.json({
                success: false,
                message: "Tweet not found.",
            });
        }

        return NextResponse.json({
            success: true,
            message: "Tweet fetched successfully.",
            data: tweet,
        });
    } catch (error: any) {
        console.error("Error fetching tweet:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch tweet.",
            error: error.message,
        });
    }
}
