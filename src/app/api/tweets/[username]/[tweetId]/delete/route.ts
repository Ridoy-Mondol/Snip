// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// import { prisma } from "@/prisma/client";
// import { verifyJwtToken } from "@/utilities/auth";
// import { UserProps } from "@/types/UserProps";

// export async function POST(request: NextRequest, { params: { tweetId } }: { params: { tweetId: string } }) {
//     const tokenOwnerId = await request.json();

//     const cookieStore = cookies();
//     const token = cookieStore.get("token")?.value;
//     const verifiedToken: UserProps = token && (await verifyJwtToken(token));

//     if (!verifiedToken)
//         return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });

//     if (verifiedToken.id !== tokenOwnerId)
//         return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });

//     try {
//         await prisma.tweet.delete({
//             where: {
//                 id: tweetId,
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

export async function POST(request: NextRequest, { params: { tweetId } }: { params: { tweetId: string } }) {
    const tokenOwnerId = await request.json();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const verifiedToken: UserProps = token && (await verifyJwtToken(token));

    if (!verifiedToken)
        return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });

    if (verifiedToken.id !== tokenOwnerId)
        return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });

    try {
        // Delete associated PollOptions and Votes before deleting the Tweet
        await prisma.pollOption.deleteMany({
            where: {
                tweetId: tweetId,
            },
        });

        await prisma.vote.deleteMany({
            where: {
                pollOptionId: {
                    in: await prisma.pollOption.findMany({
                        where: { tweetId },
                        select: { id: true },
                    }).then(options => options.map(option => option.id)),
                },
            },
        });

        // Finally, delete the tweet
        await prisma.tweet.delete({
            where: {
                id: tweetId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error });
    }
}
