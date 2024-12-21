import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function POST(
    request: NextRequest,
    { params: { username } }: { params: { username: string } }
) {
    const tokenOwnerId = await request.json();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const verifiedToken: UserProps = token && (await verifyJwtToken(token));

    if (!verifiedToken)
        return NextResponse.json({
            success: false,
            message: "You are not authorized to perform this action.",
        });

    if (verifiedToken.id !== tokenOwnerId)
        return NextResponse.json({
            success: false,
            message: "You are not authorized to perform this action.",
        });

    try {
        await prisma.user.update({
            where: {
                username: username,
            },
            data: {
                followers: {
                    disconnect: {
                        id: tokenOwnerId,
                    },
                },
            },
        });

        const unfollowedUser = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        if (!unfollowedUser) {
            return NextResponse.json({
                success: false,
                message: "User not found.",
            });
        }

        // Unsubscribe from notifications
        await prisma.subscription.deleteMany({
            where: {
                subscriberId: tokenOwnerId,
                subscribedToId: unfollowedUser.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error });
    }
}
