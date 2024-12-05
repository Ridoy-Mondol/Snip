import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { createClient } from "@supabase/supabase-js";
import { addDays, addMinutes, addHours } from "date-fns";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase credentials are missing.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const uploadFile = async (file: File) => {
    const { data, error } = await supabase.storage.from("media").upload(`${Date.now()}`, file);
    if (error) {
        console.error("Failed to upload image:", error.message);
        throw new Error("Image upload failed.");
    }
    return data.path;
};

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get("content-type");
        const apiKey = request.headers.get("x-api-key");

        if (!apiKey) {
            return NextResponse.json({
                success: false,
                message: "API key is missing.",
            });
        }

        const user = await prisma.user.findFirst({
            where: { apiKey },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Invalid API key.",
            });
        }

        if (!contentType?.includes("multipart/form-data")) {
            return NextResponse.json({
                success: false,
                message: "Request must be multipart/form-data.",
            });
        }

        const formData = await request.formData();
        const text = formData.get("text") as string | null;
        const poll = formData.get("poll") ? JSON.parse(formData.get("poll") as string) : null;
        const isReply = formData.get("isReply") === "true";
        const repliedToId = formData.get("repliedToId") as string | null;
        const photo = formData.get("photo") as File | null;

        let photoUrl = null;
        if (photo) {
            const uploadedPath = await uploadFile(photo);
            const { publicUrl } = supabase.storage.from("media").getPublicUrl(uploadedPath).data;
            photoUrl = publicUrl; 
        }

        let pollExpiresAt = null;
        let pollOptions = undefined;

        if (poll) {
            if (poll.length?.days > 0 || poll.length?.hours > 0 || poll.length?.minutes > 0) {
                const now = new Date();
                pollExpiresAt = addDays(now, poll.length.days || 0);
                pollExpiresAt = addHours(pollExpiresAt, poll.length.hours || 0);
                pollExpiresAt = addMinutes(pollExpiresAt, poll.length.minutes || 0);
            } else {
                pollExpiresAt = addDays(new Date(), 7);
            }

            pollOptions = {
                create: poll.options.map((option: string) => ({ text: option })),
            };
        }

        let tweetText;

        if (poll && poll.question) {
            tweetText = poll.question;
        }

        if (!poll && text) {
            tweetText = text;
        }

        const tweetData = {
            text: tweetText,
            photoUrl,
            isReply,
            repliedTo: repliedToId ? { connect: { id: repliedToId } } : undefined,
            isPoll: !!poll,
            pollExpiresAt,
            pollOptions,
            author: { connect: { id: user.id } },
        };

        console.log("Prepared tweet data for database:", JSON.stringify(tweetData, null, 2));

        const createdTweet = await prisma.tweet.create({
            data: tweetData,
        });

        console.log("Tweet created successfully:", createdTweet);

        return NextResponse.json({ success: true, message: "Tweet created successfully." });
    } catch (error: any) {
        console.error("Error creating tweet:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to create tweet.",
            error: error.message,
        });
    }
}
