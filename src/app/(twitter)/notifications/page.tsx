"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../layout";
import { getNotifications, markNotificationsRead } from "@/utilities/fetch";
import CircularLoading from "@/components/misc/CircularLoading";
import NothingToShow from "@/components/misc/NothingToShow";
import { NotificationProps } from "@/types/NotificationProps";
import Notification from "@/components/misc/Notification";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://edduuatujlvepjzkvtau.supabase.co";
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZHV1YXR1amx2ZXBqemt2dGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMDkwNDMsImV4cCI6MjA0Njg4NTA0M30._bT8Un-DaoDE30O-jPSmP4_ZCGnBIn56miAZPr1FGzU";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function NotificationsPage() {
    const { token, isPending } = useContext(AuthContext);
    const [notifications, setNotifications] = useState<NotificationProps[]>([]);

    const queryClient = useQueryClient();

    const { isLoading, data, isFetched } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        onSuccess: (data) => {
            setNotifications(data.notifications);
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
