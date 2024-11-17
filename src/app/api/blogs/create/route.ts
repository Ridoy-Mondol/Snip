import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function POST(request: NextRequest) {
    console.log("Received a POST request to create a blog.");

    try {
        const { title, category, content, authorId, photoUrl } = await request.json();

        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;
        console.log("Token from cookies:", token);

        const verifiedToken: UserProps = token && (await verifyJwtToken(token));
        console.log("Verified token:", verifiedToken);

        if (!verifiedToken) {
            console.error("Token verification failed.");
            return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
        }

        if (verifiedToken.id !== authorId) {
            console.error("User is not authorized to create a blog for this author ID.");
            return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
        }

        console.log("Creating a blog in the database...");
        const blog = await prisma.blog.create({
            data: {
                title,
                category,
                content,
                imageUrl: photoUrl,
                author: {
                    connect: {
                        id: authorId,
                    },
                },
            },
        });

        console.log("Blog created successfully:", blog);
        return NextResponse.json({ success: true, blog });
    } catch (error: unknown) {
        console.error("Error occurred while creating a blog:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
}
