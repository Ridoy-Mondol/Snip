import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function PATCH(request: NextRequest) {
    try {
        const blogId = request.headers.get("blogId");
        const authorId = request.headers.get("authorId");

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

        if (!verifiedToken || verifiedToken.id !== authorId) {
            return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
        }

        await prisma.blog.update({
            where: {
                id: blogId,
            },
            data: {
                status: "published",
                scheduledAt: null,
                createdAt: new Date(),
            }
        });

        console.log("Blog published successfully from draft.");
        return NextResponse.json({ success: true, message: "Blog published successfully." });

    } catch (error: unknown) {
        console.error("Error occurred while publishing the blog:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
}
