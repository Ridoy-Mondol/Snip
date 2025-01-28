import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const blogs = await prisma.blog.findMany({
            where: {
                status: "published",
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        photoUrl: true,
                        isPremium: true,
                        description: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ success: true, blogs });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error });
    }
}
