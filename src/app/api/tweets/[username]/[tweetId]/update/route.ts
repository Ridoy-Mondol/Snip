import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function PATCH(request: NextRequest, { params }: { params: { tweetId: string } }) {
    const { tweetId } = params;
    const { authorId, text } = await request.json();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const verifiedToken: UserProps = token && (await verifyJwtToken(token));

    if (!verifiedToken) {
        return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
    }

    if (verifiedToken.id !== authorId) {
        return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
    }

    try {
        const updatedTweet = await prisma.tweet.update({
            where: { id: tweetId },
            data: { text },
        });
        return NextResponse.json({ success: true, data: updatedTweet });
    } catch (error) {
        console.error("Error updating tweet:", error);
        return NextResponse.json({ success: false, message: "Failed to update tweet.", error });
    }
}
