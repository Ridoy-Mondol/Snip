import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, reason } = body;

    if (!postId || !reason) {
      return NextResponse.json(
        { success: false, message: "postId and reason are required." },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token." },
        { status: 401 }
      );
    }

    const verifiedToken: UserProps | null = await verifyJwtToken(token);

    if (!verifiedToken || !verifiedToken.id) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing user token." },
        { status: 401 }
      );
    }

    // Check if appeal already exists for this tweet
    const existingAppeal = await prisma.appeal.findUnique({
      where: { tweetId: postId },
    });

    if (existingAppeal) {
      return NextResponse.json(
        { success: false, message: "Appeal already submitted for this post." },
        { status: 409 }
      );
    }

    const newAppeal = await prisma.appeal.create({
      data: {
        tweetId: postId,
        authorId: verifiedToken.id,
        reason,
      },
    });

    console.log("appeal successfull", newAppeal);

    return NextResponse.json(
      { success: true, message: "Appeal submitted successfully.", data: newAppeal },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting appeal:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
  }
}
