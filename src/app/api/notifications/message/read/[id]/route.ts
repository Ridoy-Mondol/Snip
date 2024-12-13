import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const verifiedToken: UserProps = token && (await verifyJwtToken(token));

    if (!verifiedToken) {
        return NextResponse.json({
            success: false,
            message: "You are not authorized to perform this action.",
        });
    }

    const notificationId = params.id;

    console.log("Notification ID:", notificationId);

    if (!notificationId) {
        return NextResponse.json({
            success: false,
            message: "Notification ID is required.",
        });
    }

    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                isRead: true,
            },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error: unknown) {
        return NextResponse.json({
            success: false, error
        });
    }
}
