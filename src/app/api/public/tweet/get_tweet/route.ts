import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
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

        const tweets = await prisma.tweet.findMany({
            where: { authorId: user.id }, 
            orderBy: { createdAt: "desc" },
            include: {
                pollOptions: true,
            },
        });

        if (!tweets || tweets.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No tweets found for the user.",
            });
        }

        return NextResponse.json({
            success: true,
            data: tweets,
        });
    } catch (error: any) {
        console.error("Error fetching tweets:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch tweets.",
            error: error.message,
        });
    }
}
