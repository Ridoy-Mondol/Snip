import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function DELETE(request: NextRequest) {
    try {
        const subscriberId = request.headers.get("subscriberId");
        const subscribedToId = request.headers.get("subscribedToId");

        if (!subscriberId || !subscribedToId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: subscriberId or subscribedToId.",
                },
                { status: 400 }
            );
        }

        const token = cookies().get("token")?.value;
        const verifiedToken: UserProps = token && (await verifyJwtToken(token));

        if (!verifiedToken || verifiedToken.id !== subscriberId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not authorized to perform this action.",
                },
                { status: 403 }
            );
        }

        const existingSubscription = await prisma.subscription.findUnique({
            where: {
                subscriberId_subscribedToId: {
                    subscriberId,
                    subscribedToId,
                },
            },
        });

        if (!existingSubscription) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not subscribed to notifications from this user.",
                },
                { status: 404 }
            );
        }

        await prisma.subscription.delete({
            where: {
                subscriberId_subscribedToId: {
                    subscriberId,
                    subscribedToId,
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Unsubscribed successfully. You will no longer receive notifications.",
            },
            { status: 200 }
        );
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
