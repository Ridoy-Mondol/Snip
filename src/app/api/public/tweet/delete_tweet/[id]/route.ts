import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

        const tweet = await prisma.tweet.findUnique({
            where: { id: params.id },
        });

        console.log("Tweet:", tweet);

        if (!tweet) {
            return NextResponse.json({
                success: false,
                message: "Tweet not found.",
            });
        }

        if (tweet.authorId !== user.id) {
            return NextResponse.json({
                success: false,
                message: "You can only delete your own tweets.",
            });
        }

        await prisma.tweet.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            success: true,
            message: "Tweet deleted successfully.",
        });
    } catch (error: any) {
        console.error("Error deleting tweet:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to delete tweet.",
            error: error.message,
        });
    }
}
