import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
    const userId = request.headers.get("userId");

    if (!userId) {
        return NextResponse.json({
            success: false,
            message: "User ID is required in the headers.",
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                referralCode: true,
                referralPoints: true,
            },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found.",
            });
        }

        return NextResponse.json({
            success: true,
            referralCode: user.referralCode,
            referralPoints: user.referralPoints,
        });
    } catch (error: unknown) {
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred.",
        });
    }
}
