import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = params.id;

    if (!userId) {
        return NextResponse.json({ success: false, message: "User ID is required." });
    }

    try {
        console.log("Fetching session data for user ID:", userId);

        // Fetch all sessions for the given user ID
        const sessions = await prisma.session.findMany({
            where: { userId },
            select: {
                id: true,
                device: true,
                browser: true,
                ipAddress: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        if (sessions.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No sessions found for the given user.",
                sessions: [],
            });
        }

        return NextResponse.json({
            success: true,
            sessions,
        });
    } catch (error: unknown) {
        console.error("Error fetching session data:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch session data." });
    }
}
