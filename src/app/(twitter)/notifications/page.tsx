"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";

import { AuthContext } from "@/context/AuthContext";
import { getNotifications, markNotificationsRead } from "@/utilities/fetch";
import CircularLoading from "@/components/misc/CircularLoading";
import NothingToShow from "@/components/misc/NothingToShow";
import { NotificationProps } from "@/types/NotificationProps";
import Notification from "@/components/misc/Notification";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function NotificationsPage() {
    const { token, isPending } = useContext(AuthContext);
    const [notifications, setNotifications] = useState<NotificationProps[]>([]);

    const queryClient = useQueryClient();

    const { isLoading, data, isFetched } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        onSuccess: (data) => {
            const filteredNotifications = data.notifications.filter ((notification: NotificationProps) => notification.type !== "message"); 
            setNotifications(filteredNotifications);
        },
    });

    const mutation = useMutation({
        mutationFn: markNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(["notifications"]);
        },
        onError: (error) => console.log(error),
    });

    const handleNotificationsRead = () => {
        mutation.mutate();
    };

    useEffect(() => {
        if (isFetched && data.notifications.filter((notification: NotificationProps) => !notification.isRead).length > 0) {
            const countdownForMarkAsRead = setTimeout(() => {
                handleNotificationsRead();
            }, 1000);

            return () => {
                clearTimeout(countdownForMarkAsRead);
            };
        }
    }, [data, isFetched]);

    useEffect(() => {
        const channel = supabase
            .channel("realtime:Notification")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "Notification" },
                (payload) => { 
    
                    const newNotification = payload.new as NotificationProps;
    
                    // Validate the notification fields
                    if (newNotification && newNotification.id && newNotification.type && newNotification.createdAt) {
   
                        if (newNotification.content && typeof newNotification.content === "string") {
                            try {
                                newNotification.content = JSON.parse(newNotification.content); // Parse the content
                            } catch (error) {
                                console.error("Failed to parse content:", error);
                            }
                        } else if (newNotification.content && typeof newNotification.content === "object") {
                            console.log("Content is already an object:", newNotification.content);
                        }
    
                        setNotifications((prev) => [newNotification, ...prev]);
                    } else {
                        console.error("Received invalid notification data:", newNotification);
                        console.log("Payload Structure:", payload);
                    }
                }
            )
            .subscribe((status) => {
                // Check the status of the subscription
                if (status === "SUBSCRIBED") {
                    console.log("Subscribed to real-time notifications.");
                } else {
                    console.error("Error subscribing to real-time notifications:", status);
                }
            });
    
        // Cleanup subscription when component unmounts
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
    

    if (isPending || !token || isLoading) return <CircularLoading />;

    return (
        <main>
            <h1 className="page-name">Notifications</h1>
            {isFetched && notifications.length === 0 ? (
                <NothingToShow />
            ) : (
                <div className="notifications-wrapper">
                    {notifications.map((notification) => (
                        <Notification key={notification.id} notification={notification} token={token} />
                    ))}
                </div>
            )}
        </main>
    );
}
