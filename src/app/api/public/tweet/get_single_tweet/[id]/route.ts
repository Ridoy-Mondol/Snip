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

        const response = NextResponse.json({
            success: true,
            message: "Tweet fetched successfully.",
            data: tweet,
        });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
        return response;
    } catch (error: any) {
        console.error("Error fetching tweet:", error);
        const response= NextResponse.json({
            success: false,
            message: "Failed to fetch tweet.",
            error: error.message,
        });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
        return response;
    }
}
