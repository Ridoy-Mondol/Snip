import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
    console.log("Received a GET request to fetch all blogs.");

    try {
        const blogs = await prisma.blog.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                author: true,
            },
        });

        console.log("Fetched blogs:", blogs);
        return NextResponse.json({ success: true, blogs });
    } catch (error: unknown) {
        console.error("Error occurred while fetching blogs:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
}
