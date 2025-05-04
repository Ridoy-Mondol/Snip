// route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { success: false, message: "postId is required." },
        { status: 400 }
      );
    }

    const appeal = await prisma.appeal.findUnique({
      where: { tweetId: postId },
      select: {
        tweetId: true,
        reason: true,
      },
    });

    if (!appeal) {
      return NextResponse.json(
        { success: false, message: "Appeal not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Appeal fetched successfully.", data: appeal },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching appeal:", error);
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
