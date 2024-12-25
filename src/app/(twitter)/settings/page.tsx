"use client";

import { useContext, useEffect, useState } from "react";
import { Switch, Button, Typography, Tooltip, Box } from "@mui/material";
import { BiCopy } from "react-icons/bi";

import { ThemeContext } from "@/app/providers";
import { AuthContext } from "@/context/AuthContext";

export default function SettingsPage() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [referralCode, setReferralCode] = useState<string>("");
    const [referralPoints, setReferralPoints] = useState<number>(0);
    const [isCopied, setIsCopied] = useState(false);

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

    
    const fetchReferralCode = async () => {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
    
            if (token?.id) {
                headers["userId"] = token.id;
            }
    
            const res = await fetch("/api/auth/referralCode", {
                method: "GET",
                headers,
            });
    
            const data = await res.json();
            if (data.success) {
                setReferralCode(data.referralCode);
                setReferralPoints(data.referralPoints);
            }
        } catch (err) {
            console.error("Error fetching API key:", err);
        }
    };
    
    useEffect(() => {
        fetchReferralCode();
    }, [token]);

    const copyToClipboard = () => {
        if (referralCode) {
            navigator.clipboard.writeText(`${window.location.origin}?ref=${referralCode}`).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
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

           {/* Referral Code Section */}
           <div style={{ marginTop: "2rem", padding: "1.5rem", borderRadius: "8px" }}>
           <Typography variant="h5" align="left"   gutterBottom>
               Your Referral Link
            </Typography>
            {referralCode ? (
            <>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
                mb={2}
              >
              <Box
                sx={{
                  padding: "0.5rem 1rem",
                  border: "1px solid",
                  borderColor: "divider", 
                  borderRadius: "8px",
                  fontWeight: "bold",
                  color: "text.primary",
                  wordBreak: "break-word",
                  textAlign: "start",
                  flexGrow: 1,
                  }}
                >
                 {`${window.location.origin}?ref=${referralCode}`}
                </Box>
                <Tooltip title={isCopied ? "Copied!" : "Copy to Clipboard"} arrow>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<BiCopy size={20} />}
                        onClick={copyToClipboard}
                        sx={{
                            padding: "0.5rem 1rem",
                            fontSize: "0.9rem",
                            borderRadius: "8px",
                        }}
                    >
                        {isCopied ? "Copied!" : "Copy"}
                    </Button>
                </Tooltip>
                </Box>
                <Typography variant="body2"   color="text.secondary" align="left">
                   Refer friends to join our platform and earn rewards. Simply share your unique referral link, and when they sign up, you&apos;ll both enjoy the benefits. Share the link via email, social media, or messaging, and start earning today.
                </Typography>

                {/* Referral Points Display */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: theme === "dark" ? "#2b2b2b" : "#fff",
                    padding: "1rem",
                    marginTop: "1rem",
                    borderRadius: "8px",
                    boxShadow:
                        theme === "dark"
                            ? "0px 2px 4px rgba(255, 255, 255, 0.1)"
                            : "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                <Typography
                    variant="body1"
                    color="text.primary"
                    fontWeight="bold"
                >
                    Your current Referral Points:
                </Typography>
                <Typography
                    variant="h6"
                    color="primary"
                    fontWeight="bold"
                >
                    {referralPoints}
                </Typography>
                </Box>
                </>
                ) : (
                <Typography variant="body2" color="text.secondary" align="left">
                  Loading your referral link...
                </Typography>
                )}
               </div>
               
        </main>
    );
}
