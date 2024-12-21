import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function POST(request: NextRequest) {
    try {
        const { subscriberId, subscribedToId } = await request.json();

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

        const isFollowing = await prisma.user.findUnique({
            where: { id: subscriberId },
            select: {
                following: {
                    where: { id: subscribedToId },
                },
            },
        });

        if (!isFollowing?.following?.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You must follow the user before subscribing to notifications.",
                },
                { status: 400 }
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

        if (existingSubscription) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are already subscribed to notifications from this user.",
                },
                { status: 409 }
            );
        }

        const newSubscription = await prisma.subscription.create({
            data: {
                subscriberId,
                subscribedToId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Subscription successful. You will now receive notifications.",
                subscription: newSubscription,
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
