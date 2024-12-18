import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { NotificationProps } from "@/types/NotificationProps";

export async function POST(request: NextRequest) {
    const { recipient, type, secret, notificationContent }: NotificationProps = await request.json();

    if (secret !== process.env.CREATION_SECRET_KEY) {
        return NextResponse.json({ success: false, error: "Invalid secret." });
    }

    try {
        // Create the notification in the database
        const notification = await prisma.notification.create({
            data: {
                user: {
                    connect: {
                        username: recipient,
                    },
                },
                type: type,
                content: JSON.stringify(notificationContent),
            },
        });

        // Fetch recipient's player_id
        const user = await prisma.user.findUnique({
            where: { username: recipient },
            select: { playerIds: true },
        });

        if (user?.playerIds?.length) {
            const { title, message } = getNotificationContent(type, notification);
            if (title && message) {
                for (const playerId of user.playerIds) {
                    await sendPushNotification(playerId, title, message, type);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error });
    }
}

function getNotificationContent(type: string, notification: any): { title: string; message: string } {
    const notificationContent = JSON.parse(notification.content);
    const sender = notificationContent.sender.name;
    switch (type) {
        case "like":
            return {
                title: "Your post got a like!",
                message: `${sender} liked your post.`,
            };
        case "reply":
            return {
                title: "New comment on your post!",
                message: `${sender} replied to your post.`,
            };
        case "follow":
            return {
                title: "You have a new follower!",
                message: `${sender} started following you.`,
            };
        case "message":
            return {
                title: "New Message!",
                message: `${sender} sent you a message.`,
            };
        case "retweet":
            return {
                title: "Your post was retweeted!",
                message: `${sender} retweeted your post.`,
            };
        case "welcome":
            return {
                title: "Welcome!",
                message: `Welcome to Snip!`,
            };
        default:
            return {
                title: "New Notification!",
                message: "You have a new notification.",
            };
    }
}

// Utility to send push notifications
async function sendPushNotification(playerId: string, title: string, message: string, type: string) {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${process.env.NEXT_PUBLIC_ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
            app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            include_player_ids: [playerId],
            headings: { en: title },
            contents: { en: message },
            data: { type },
        }),
    });

    const responseData = await response.json();

    if (!response.ok) {
        const error = await response.json();
        console.error("Failed to send push notification:", error);
    }
}
