import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const contentType = request.headers.get("content-type");
        const apiKey = request.headers.get("x-api-key");

        if (!apiKey) {
            return NextResponse.json({
                success: false,
                message: "API key is missing.",
            });
        }

        const user = await prisma.user.findFirst({
            where: { apiKey },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Invalid API key.",
            });
        }

        if (!contentType?.includes("application/json")) {
            return NextResponse.json({
                success: false,
                message: "Request must be JSON.",
            });
        }

        const tweetId = params.id;
        const body = await request.json();
        const { text } = body;

        if (!tweetId || !text) {
            return NextResponse.json({
                success: false,
                message: "Tweet ID and new text are required.",
            });
        }

        const tweet = await prisma.tweet.findUnique({
            where: { id: tweetId },
        });

        if (!tweet) {
            return NextResponse.json({
                success: false,
                message: "Tweet not found.",
            });
        }

        if (tweet.authorId !== user.id) {
            return NextResponse.json({
                success: false,
                message: "You do not have permission to update this tweet.",
            });
        }

        const updatedTweet = await prisma.tweet.update({
            where: { id: tweetId },
            data: { text: text },
        });

        const response = NextResponse.json({
            success: true,
            message: "Tweet updated successfully.",
        });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'PATCH');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

        return response;
    } catch (error: any) {
        console.error("Error updating tweet:", error);
        const response = NextResponse.json({
            success: false,
            message: "Failed to update tweet.",
            error: error.message,
        });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'PATCH');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

        return response;
    }
}
