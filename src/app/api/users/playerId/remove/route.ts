import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function PATCH(request: NextRequest) {
    try {
        const { playerId, userId } = await request.json();

        if (!playerId || !userId) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields: playerId or userId.",
            }, { status: 400 });
        }

        const token = cookies().get("token")?.value;
            const verifiedToken: UserProps = token && (await verifyJwtToken(token));
        
            if (!verifiedToken || verifiedToken.id !== userId) {
                return NextResponse.json({
                    success: false,
                    message: "You are not authorized to perform this action.",
                }, { status: 403 });
            }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found.",
            }, { status: 404 });
        }

        if (!user.playerIds || !user.playerIds.includes(playerId)) {
            return NextResponse.json({
                success: false,
                message: "Player ID not found.",
            }, { status: 404 });
        }
        
        const updatedPlayerIds = user.playerIds.filter((id: string) => id !== playerId);
        await prisma.user.update({
            where: { id: userId },
            data: { playerIds: updatedPlayerIds },
        });

        return NextResponse.json({
            success: true,
            message: "Player ID updated successfully.",
        }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred.",
        }, { status: 500 });
    }
}

