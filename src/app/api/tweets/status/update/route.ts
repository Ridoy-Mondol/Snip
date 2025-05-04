import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";
import { createNotification } from "@/utilities/fetch";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, status, username } = body;

    console.log('postId, status, username', postId, status, username);

    if (!postId || !status) {
      return NextResponse.json({ success: false, message: "Post ID or Status is required." }, { status: 400 });
    }

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized: No token." }, { status: 401 });
    }

    const verifiedToken: UserProps = await verifyJwtToken(token);

    if (!verifiedToken) {
      return NextResponse.json({ success: false, message: "Invalid token." }, { status: 401 });
    }

    // Update status
    await prisma.tweet.update({
      where: { id: postId },
      data: { status: status },
    });

    console.log("Post successfully updated.")

    const secret = process.env.CREATION_SECRET_KEY;

    if (!secret) {
        return NextResponse.json({
            success: false,
            message: "Secret key not found.",
        });
    }

    if (username !== verifiedToken.username) {
        const notificationContent = {
            sender: {
                username: verifiedToken.username,
                name: verifiedToken.name,
                photoUrl: verifiedToken.photoUrl,
            },
            content: {
                id: postId,
            },
        };
        
        console.log(`Creating notification for ${username} about post status "${status}"`);
        await createNotification(username, status, secret, notificationContent);
    }

    return NextResponse.json({ success: true, message: "Post successfully updated." });

  } catch (error: unknown) {
    console.error("Error updating post:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
