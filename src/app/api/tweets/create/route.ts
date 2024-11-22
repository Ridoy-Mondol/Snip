// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// import { prisma } from "@/prisma/client";
// import { verifyJwtToken } from "@/utilities/auth";
// import { UserProps } from "@/types/UserProps";

// export async function POST(request: NextRequest) {
//     const { authorId, text, photoUrl } = await request.json();

//     const cookieStore = cookies();
//     const token = cookieStore.get("token")?.value;
//     const verifiedToken: UserProps = token && (await verifyJwtToken(token));

//     if (!verifiedToken)
//         return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });

//     if (verifiedToken.id !== authorId)
//         return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });

//     try {
//         await prisma.tweet.create({
//             data: {
//                 text,
//                 photoUrl,
//                 author: {
//                     connect: {
//                         id: authorId,
//                     },
//                 },
//             },
//         });
//         return NextResponse.json({ success: true });
//     } catch (error: unknown) {
//         return NextResponse.json({ success: false, error });
//     }
// }




import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";
export async function POST(request: NextRequest) {
    const { authorId, text, photoUrl, poll, isReply, repliedToId } = await request.json();

    const token = cookies().get("token")?.value;
    const verifiedToken: UserProps = token && (await verifyJwtToken(token));

    if (!verifiedToken || verifiedToken.id !== authorId) {
        return NextResponse.json({
            success: false,
            message: "You are not authorized to perform this action.",
        });
    }

    try {
        const tweetData = {
            text: text || "",
            photoUrl: photoUrl || null,
            isReply: isReply || false,
            repliedTo: repliedToId
                ? {
                      connect: { id: repliedToId }, 
                  }
                : undefined,
            isPoll: !!poll,
            pollExpiresAt: poll?.expiresAt || null,
            pollOptions: poll
                ? {
                      create: poll.options.map((option: string) => ({ text: option })),
                  }
                : undefined,
            author: {
                connect: {
                    id: authorId,
                },
            },
        };

        console.log("Prepared tweet data for database:", JSON.stringify(tweetData, null, 2));

        const createdTweet = await prisma.tweet.create({
            data: tweetData,
        });

        console.log("Tweet created successfully:", createdTweet);

        return NextResponse.json({ success: true, data: createdTweet });
    } catch (error: any) {
        console.error("Error creating tweet:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to create tweet.",
            error: error.message,
        });
    }
}
