import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    console.log(`Received a DELETE request to delete blog with id: ${params.id}`);

    try {
        const blogId = params.id;

        if (!blogId) {
            return NextResponse.json({ success: false, message: "Blog ID is required." });
        }

        // Get the token from the cookies
        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            console.error("Token is missing.");
            return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
        }

        // Verify the token
        const verifiedToken: UserProps = await verifyJwtToken(token);
        console.log("Verified token:", verifiedToken);

        if (!verifiedToken) {
            console.error("Token verification failed.");
            return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
        }

        // Get the blog and check if it exists
        const blog = await prisma.blog.findUnique({
            where: {
                id: blogId,
            },
        });

        if (!blog) {
            return NextResponse.json({ success: false, message: "Blog not found." });
        }

        if (blog.authorId !== verifiedToken.id) {
            console.error("User is not authorized to delete this blog.");
            return NextResponse.json({ success: false, message: "You are not authorized to delete this blog." });
        }

        // Delete the blog
        await prisma.blog.delete({
            where: {
                id: blogId,
            },
        });

        console.log("Blog deleted successfully.");
        return NextResponse.json({ success: true, message: "Blog deleted successfully." });

    } catch (error: unknown) {
        console.error("Error occurred while deleting the blog:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
}
