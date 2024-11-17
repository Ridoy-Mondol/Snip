import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    console.log(`Received a GET request to fetch blog with id: ${params.id}`);

    try {
        const blog = await prisma.blog.findUnique({
            where: {
                id: params.id,
            },
            include: {
                author: true,
            },
        });

        if (!blog) {
            console.log(`Blog with id ${params.id} not found.`);
            return NextResponse.json({ success: false, message: "Blog not found" });
        }

        console.log("Fetched blog:", blog);
        return NextResponse.json({ success: true, blog });
    } catch (error: unknown) {
        console.error("Error occurred while fetching blog:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
}
