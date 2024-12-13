import { prisma } from "@/prisma/client";

export const shouldCreateNotification = async (sender: string, recipient: string) => {
    const lastNotification = await prisma.notification.findFirst({
        where: {
            type: "message",
            user: {
                username: recipient,
            },
            content: {
                contains: sender,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // If no notification exists, allow creation of a new notification
    if (!lastNotification) return true;

    // If the last notification is marked as read, allow creation of a new notification
    if (lastNotification.isRead) {
        return true;
    }

    // If the last notification is unread, don't create a new notification
    return false;
};

