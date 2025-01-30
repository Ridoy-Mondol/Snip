import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("userId");

        if (!userId) {
            return NextResponse.json({ success: false, message: 'You are not authorized to visit it' }, { status: 400 });
          }

        const blogs = await prisma.blog.findMany({
            where: {
                status: "draft",
                authorId: userId,
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
