"use client";

import { useContext, useState, useEffect, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BsEnvelopePlus } from "react-icons/bs";

import NothingToShow from "@/components/misc/NothingToShow";
import NewMessageDialog from "@/components/dialog/NewMessageDialog";
import { AuthContext } from "../layout";
import CircularLoading from "@/components/misc/CircularLoading";
import { getUserMessages } from "@/utilities/fetch";
import Conversation from "@/components/message/Conversation";
import { ConversationResponse, MessageProps } from "@/types/MessageProps";
import Messages from "@/components/message/Messages";
import { NotificationProps } from "@/types/NotificationProps";
import { getNotifications, markMessageNotificationsRead } from "@/utilities/fetch";

type NotificationWithUserId = NotificationProps & { userId: string };

export default function MessagesPage() {
    const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationProps[]>([]);
    const [isConversationSelected, setIsConversationSelected] = useState({
        selected: false,
        messages: [] as MessageProps[],
        messagedUsername: "",
    });

    const { token, isPending } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const { isLoading, data, isFetched } = useQuery({
        queryKey: ["messages", token && token.username],
        queryFn: () => token && getUserMessages(token.username),
        enabled: !!token,
    });

    const handleNewMessageClose = () => {
        setIsNewMessageOpen(false);
    };

    const handleConversations = (isSelected: boolean, messages: MessageProps[] = [], messagedUsername: string = "") => {
        setIsConversationSelected({ selected: isSelected, messages, messagedUsername });
    };



    // const { isLoading: isLoading2, data: data2, isFetched: isFetched2 } =useQuery({
    //     queryKey: ["notifications"],
    //     queryFn: getNotifications,
    //     onSuccess: (data) => {
    //         const filteredNotifications = data.notifications.filter ((notification: NotificationProps) => notification.type === "message"); 
    //         setNotifications(filteredNotifications);
    //     },
    // });

    // const mutation = useMutation({
    //     mutationFn: markNotificationsRead,
    //     onSuccess: () => {
    //         queryClient.invalidateQueries(["notifications"]);
    //     },
    //     onError: (error) => console.log(error),
    // });

    // const handleNotificationsRead = () => {
    //     mutation.mutate();
    // };

    // console.log("Notifications:", notifications);

    // useEffect(() => {
    //     if (notifications?.filter((notification: NotificationProps) => !notification.isRead).length > 0) {
    //         const countdownForMarkAsRead = setTimeout(() => {
    //             handleNotificationsRead();
    //         }, 1000);

    //         return () => {
    //             clearTimeout(countdownForMarkAsRead);
    //         };
    //     }
    // }, [notifications]);

    
        // Fetch notifications and filter for "message" type
        const {
            isLoading: isNotificationsLoading,
            data: notificationsData,
            isFetched: isNotificationsFetched,
        } = useQuery({
            queryKey: ["notifications"],
            queryFn: getNotifications,
            enabled: !!token,
            onError: (error) => console.error("Error fetching notifications:", error),
        });
    
        // Derived filtered notifications
        const messageNotifications = notificationsData?.notifications?.filter(
            (notification: NotificationProps) => notification.type === "message"
        ) || [];

        // console.log('messageNotificationss', messageNotifications.filter((notifications: NotificationProps) => (notifications?.userId === token?.id && notifications.isRead === false)));

        // Mutation to mark notifications as read
        const markNotificationsReadMutation = useMutation({
            mutationFn: (notificationId: string) => markMessageNotificationsRead(notificationId),
            onSuccess: () => {
                queryClient.invalidateQueries(["notifications"]);
            },
            onError: (error) => console.error("Error marking notifications as read:", error),
        });
    
        const handleNotificationsRead = (notificationId: string) => {
            markNotificationsReadMutation.mutate(notificationId);
        };

        // console.log('userId', isConversationSelected.messages[isConversationSelected.messages.length - 1]?.recipient.username, isConversationSelected.messages[isConversationSelected.messages.length - 1]?.recipient.username === token?.username);



        // const recipientId = isConversationSelected.messages[isConversationSelected.messages.length - 1]?.recipientId;

        const recipientId = isConversationSelected.messages[isConversationSelected.messages.length - 1]?.recipientId;

        const senderName = isConversationSelected.messages[isConversationSelected.messages.length - 1]?.sender.username;

        console.log('recipientId', recipientId, 'senderName', senderName);

        const specificNotificationToMarkAsRead = messageNotifications.find((notification: NotificationWithUserId) => notification.userId === recipientId && (JSON.parse(notification.content)).sender.username === senderName && !notification.isRead);

        console.log('specificNotificationToMarkAsRead', specificNotificationToMarkAsRead);


        
        useEffect(() => {
        if (isConversationSelected.selected &&isNotificationsFetched && specificNotificationToMarkAsRead) {
                const timeoutId = setTimeout(() => {
                    handleNotificationsRead(specificNotificationToMarkAsRead.id);
                }, 1000);
                return () => clearTimeout(timeoutId);
        }}, [isNotificationsFetched,isConversationSelected.selected, specificNotificationToMarkAsRead]);

    



    if (isPending || !token || isLoading) return <CircularLoading />;

    const conversations = data.formattedConversations;

    return (
        <main className="messages-page">
            {isConversationSelected.selected ? (
                <Messages
                    selectedMessages={isConversationSelected.messages}
                    messagedUsername={isConversationSelected.messagedUsername}
                    handleConversations={handleConversations}
                    token={token}
                />
            ) : (
                <>
                    <h1 className="page-name">
                        Messages
                        <button
                            onClick={() => setIsNewMessageOpen(true)}
                            className="btn btn-white icon-hoverable new-message"
                        >
                            <BsEnvelopePlus />
                        </button>
                    </h1>
                    {isFetched && !(conversations.length > 0) && <NothingToShow />}
                    <div>
                        {conversations.map((conversation: ConversationResponse) => {
                            return (
                                <Conversation
                                    key={conversation.participants.join("+")}
                                    conversation={conversation}
                                    token={token}
                                    handleConversations={handleConversations}
                                />
                            );
                        })}
                    </div>
                </>
            )}
            <NewMessageDialog handleNewMessageClose={handleNewMessageClose} open={isNewMessageOpen} token={token} />
        </main>
    );
}



