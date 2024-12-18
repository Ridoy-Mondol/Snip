"use client";

import { useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const OneSignalProvider = () => {
    const { token } = useContext(AuthContext);

    useEffect(() => {
        if (!token) {
            return;
        }
        const initializeOneSignal = () => {
            if (!window.OneSignal) {
                window.OneSignal = [];
            }
            window.OneSignal.push(() => {
                window.OneSignal.init({
                    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
                    safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
                    notifyButton: { enable: true },
                    allowLocalhostAsSecureOrigin: false,
                });

                window.OneSignal.on("subscriptionChange", async (isSubscribed: boolean) => {
                    try {
                        const playerId = await window.OneSignal.getUserId();
                        if (!isSubscribed) {
                            window.OneSignal.deleteTags(["playerId"]);
                            localStorage.removeItem("OneSignalSDK");
                            document.cookie = "onesignal-pageview-count=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            document.cookie = "onesignal-notification-prompt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            if (playerId && token) {
                                removePlayerId(playerId, token.id);
                            }
                        } 
                        else {
                            if (playerId && token) {
                                updatePlayerId(playerId, token.id);
                            }
                        }
                    } catch (error) {
                        console.error("Error handling subscription change:", error);
                    }
                });
            });
        };

        const scriptLoaded = document.querySelector('script[src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"]');
        if (scriptLoaded) {
            initializeOneSignal();
        } else {
            const script = document.createElement("script");
            script.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
            script.async = true;
            script.onload = initializeOneSignal;
            document.body.appendChild(script);
        }
    }, [token]);

    return null;
};

const removePlayerId = async (playerId: string, userId: string) => {
    try {
        const response = await fetch("/api/users/playerId/remove", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ playerId, userId }),
        });

        if (!response.ok) {
            console.error("Failed to remove playerId");
        } else {
            console.log("Player ID removed successfully.");
        }
    } catch (error) {
        console.error("Error removing playerId:", error);
    }
};

const updatePlayerId = async (playerId: string, userId: string) => {
    try {
        const response = await fetch("/api/users/playerId/create", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ playerId, userId }),
        });

        if (!response.ok) {
            console.error("Failed to update playerId");
        } else {
            console.log("Player ID updated successfully.");
        }
    } catch (error) {
        console.error("Error updating playerId:", error);
    }
};

export default OneSignalProvider;





