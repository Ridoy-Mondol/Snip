import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function PATCH(request: NextRequest) {
    try {
        const postId = request.headers.get("postId");
        const authorId = request.headers.get("authorId");

        if (!postId) {
            return NextResponse.json({ success: false, message: "Post ID is required." });
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

        await prisma.tweet.update({
            where: {
                id: postId,
            },
            data: {
                status: "published",
                scheduledAt: null,
                createdAt: new Date(),
            }
        });

        console.log("Post published successfully from draft.");
        return NextResponse.json({ success: true, message: "Post published successfully." });

    } catch (error: unknown) {
        console.error("Error occurred while publishing the post:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
}
