import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function POST(request: NextRequest) {
    try {
        const { title, category, content, authorId, photoUrl, schedule } = await request.json();

        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;
        console.log("Token from cookies:", token);

        const verifiedToken: UserProps = token && (await verifyJwtToken(token));
        console.log("Verified token:", verifiedToken);

        if (!verifiedToken) {
            console.error("Token verification failed.");
            return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
        }

        if (!authorId) {
            console.error("Author ID is required.");
            return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
        }

        if (verifiedToken.id !== authorId) {
            console.error("User is not authorized to create a blog for this author ID.");
            return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });
        }

        if (!title) {
            return NextResponse.json({ success: false, message: "Title is required!" });
        }

        let scheduledTime: Date | null = null;
        if (schedule) {
            const currentTime = new Date();

            switch (schedule) {
                case "1h":
                    scheduledTime = new Date(currentTime.getTime() + 1 * 60 * 60 * 1000);
                    break;
                case "2h":
                    scheduledTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
                    break;
                case "5h":
                    scheduledTime = new Date(currentTime.getTime() + 5 * 60 * 60 * 1000);
                    break;
                case "10h":
                    scheduledTime = new Date(currentTime.getTime() + 10 * 60 * 60 * 1000);
                    break;
                case "1D":
                    scheduledTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case "7D":
                    scheduledTime = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                case "Never":
                    scheduledTime = null;
                    break;
                default:
                    scheduledTime = null;
            }
        }

        console.log("Creating a draft in the database...");
        const blog = await prisma.blog.create({
            data: {
                title,
                category: category || "",
                content: content || "",
                imageUrl: photoUrl || null,
                status: "draft",
                scheduledAt: scheduledTime,
                author: {
                    connect: {
                        id: authorId,
                    },
                },
            },
        });

        console.log("Draft created successfully:", blog);
        return NextResponse.json({ success: true, blog });
    } catch (error: unknown) {
        console.error("Error occurred while creating a draft:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
}
