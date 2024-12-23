import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const apiKey = request.headers.get("x-api-key");

        if (!apiKey) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    message: "API key is missing.",
                }),
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET',
                        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
                    }
                }
            );
        }

        const user = await prisma.user.findFirst({
            where: { apiKey },
            select: {
                id: true,
                username: true,
            },
        });

        if (!user) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    message: "Invalid API key.",
                }),
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET',
                        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
                    }
                }
            );
        }

        const tweets = await prisma.tweet.findMany({
            where: { authorId: user.id }, 
            orderBy: { createdAt: "desc" },
            include: {
                pollOptions: true,
            },
        });

        if (!tweets || tweets.length === 0) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    message: "No tweets found for the user.",
                }),
                {
                    status: 404,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET',
                        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
                    }
                }
            );
        }

        return new NextResponse(
            JSON.stringify({
                success: true,
                data: tweets,
            }),
            {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
                }
            }
        );
    } catch (error: any) {
        console.error("Error fetching tweets:", error);

        return new NextResponse(
            JSON.stringify({
                success: false,
                message: "Failed to fetch tweets.",
                error: error.message,
            }),
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
                }
            }
        );
    }
}
