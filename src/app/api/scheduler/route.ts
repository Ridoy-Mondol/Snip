import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function PATCH(request: NextRequest) {
    try {
        const currentTime = new Date();
        currentTime.setSeconds(0, 0);


        await prisma.tweet.updateMany({
            where: {
                status: "draft",
                scheduledAt: {
                    lte: currentTime,
                },
            },
            data: {
                status: "published",
                scheduledAt: null,
                createdAt: new Date(),
            }
        });

        await prisma.blog.updateMany({
            where: {
                status: "draft",
                scheduledAt: {
                    lte: currentTime,
                },
            },
            data: {
                status: "published",
                scheduledAt: null,
                createdAt: new Date(),
            }
        });

        console.log("Published successfully from draft.");
        const response = NextResponse.json({ success: true, message: "Published successfully." });

        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
        
        return response;

    } catch (error: unknown) {
        console.error("Error occurred while publishing:", error);
        const response= NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });

        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'POST');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

        return response;
    }
}
