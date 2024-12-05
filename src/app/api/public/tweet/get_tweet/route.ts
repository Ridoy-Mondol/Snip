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

        // const response = NextResponse.json({
        //     success: true,
        //     data: tweets,
        // });
        // response.headers.set('Access-Control-Allow-Origin', '*');
        // response.headers.set('Access-Control-Allow-Methods', 'GET');
        // response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

        // return response;
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
                },
            }
        );        
    } catch (error: any) {
        console.error("Error fetching tweets:", error);
        const response = NextResponse.json({
            success: false,
            message: "Failed to fetch tweets.",
            error: error.message,
        });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

        return response;
    }
}
