import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const subscriberId = request.headers.get("subscriberId");
        const subscribedToId = request.headers.get("subscribedToId");

        console.log('received GET request',subscriberId, subscribedToId);

        if (!subscriberId || !subscribedToId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required headers: subscriberId or subscribedToId.",
                },
                { status: 400 }
            );
        }

        const subscription = await prisma.subscription.findUnique({
            where: {
                subscriberId_subscribedToId: {
                    subscriberId,
                    subscribedToId,
                },
            },
        });

        if (subscription) {
            return NextResponse.json(
                {
                    success: true,
                    message: "User is subscribed to the associated user.",
                    isSubscribed: true,
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "User is not subscribed to the associated user.",
                    isSubscribed: false,
                },
                { status: 200 }
            );
        }
    } catch (error: unknown) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "An unknown error occurred.",
            },
            { status: 500 }
        );
    }
}
