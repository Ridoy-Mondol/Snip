"use client";

import { useContext, useEffect, useState } from "react";
import { Switch } from "@mui/material";

import { ThemeContext } from "@/app/providers";
import { AuthContext } from "@/context/AuthContext";

export default function SettingsPage() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const { token } = useContext(AuthContext);

    // Log and handle subscription changes
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

    // Check subscription status on component mount
    useEffect(() => {
        const checkSubscription = async () => {
            if (window.OneSignal) {
                try {
                    await window.OneSignal.isPushNotificationsEnabled((enabled: boolean) => {
                        setIsSubscribed(enabled);
                        setIsInitialized(true);
                    });
                } catch (error) {
                    console.error("Error checking subscription status:", error);
                }
            } else {
                console.error("OneSignal SDK is not available.");
            }
        };

        checkSubscription();
    }, []);

    // Toggle subscription status
    const toggleSubscription = async () => {
        if (!window.OneSignal) {
            console.error("OneSignal SDK is not initialized.");
            return;
        }

        try {
            if (isSubscribed) {
                const playerId = await window.OneSignal.getUserId();
                if (playerId && token) {
                    await removePlayerId(playerId, token.id);
                }
                await window.OneSignal.setSubscription(false);
            } else {
                await window.OneSignal.setSubscription(true);
                const playerId = await window.OneSignal.getUserId();
                if (playerId && token) {
                    await updatePlayerId(playerId, token.id);
                }
            }
            setIsSubscribed((prev) => !prev);
        } catch (error) {
            console.error("Error toggling subscription:", error);
        }
    };

    return (
        <main>
            <h1 className="page-name">Settings</h1>

            {/* Theme Toggle */}
            <div className="color-theme-switch">
                <h1>Color Theme</h1>
                <Switch checked={theme === "dark"} onChange={toggleTheme} />
                <div className="label">{theme === "dark" ? "(Lights Out)" : "(Default)"}</div>
            </div>

            {/* Subscription Toggle */}
            <div className="color-theme-switch">
                <h1>Notifications</h1>
                {isInitialized ? (
                    <Switch
                        checked={isSubscribed}
                        onChange={toggleSubscription}
                        color={isSubscribed ? "primary" : "secondary"}
                    />
                ) : (
                    <p>Loading subscription status...</p>
                )}
                <div className="label">
                    {isSubscribed ? "You are subscribed to notifications" : "Subscribe to receive notifications"}
                </div>
            </div>
        </main>
    );
}
