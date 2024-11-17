import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    console.log("Received a POST request to update a blog.");

    try {
        const blogId = params.id;
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
            console.error("User is not authorized to update this blog.");
            return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
        }

        console.log("Updating the blog in the database...");

        const updateData: { title?: string; category?: string; content?: string; imageUrl?: string } = {};
        if (title) updateData.title = title;
        if (category) updateData.category = category;
        if (content) updateData.content = content;
        if (photoUrl) updateData.imageUrl = photoUrl;

        const updatedBlog = await prisma.blog.update({
            where: { id: blogId },
            data: updateData,
        });

        console.log("Blog updated successfully:", updatedBlog);
        return NextResponse.json({ success: true, blog: updatedBlog });
    } catch (error: unknown) {
        console.error("Error occurred while updating the blog:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
}
