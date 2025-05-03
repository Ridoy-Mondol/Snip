import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ success: false, message: "Post ID is required." }, { status: 400 });
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

    // Update status to "hidden"
    await prisma.tweet.update({
      where: { id: postId },
      data: { status: "hidden" },
    });

    console.log("Post successfully hidden.")

    return NextResponse.json({ success: true, message: "Post successfully hidden." });

  } catch (error: unknown) {
    console.error("Error hiding post:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
