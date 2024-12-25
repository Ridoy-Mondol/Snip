"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import GlobalLoading from "@/components/misc/GlobalLoading";
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";

export default function GoogleCallbackPage() {
    const [snackbar, setSnackbar] = useState<SnackbarProps>({
        message: "",
        severity: "success",
        open: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [sessionData, setSessionData] = useState<any | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const router = useRouter();
    const supabase = createClientComponentClient();
    const storedReferralCode = localStorage.getItem('referralCode') || null;

    useEffect(() => {
        const fetchSessionAndSaveUser = async () => {
            try {
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !sessionData?.session?.user) {
                    if (retryCount < 5) {
                    setRetryCount((prev) => prev + 1);
                     return;
                    }
                    return;
                }

                const user = sessionData.session.user;
                const { email, user_metadata } = user;
                const { name, avatar_url } = user_metadata || {};

                if (email && name && avatar_url) {
                    await saveGoogleUser({ email, name, avatar_url, storedReferralCode });
                    console.log("Session data:", sessionData);
                } else {
                    console.error("User data missing (email, name, avatar_url).");
                    setSnackbar({
                        message: "Incomplete user data received. Please try again.",
                        severity: "error",
                        open: true,
                    });
                }
                setSessionData(sessionData.session);
            } catch (error) {
                if (retryCount < 5) {
                    setRetryCount((prev) => prev + 1);
                } else {
                    setSnackbar({
                        message: "Error fetching session. Please try again.",
                        severity: "error",
                        open: true,
                    });
                    setIsLoading(false);
                }
            }
        };

        if (sessionData) {
            setIsLoading(false);
            return;
        }

        if (!sessionData && retryCount < 5) {
            const timeout = setTimeout(fetchSessionAndSaveUser, 500);
            return () => clearTimeout(timeout); 
        }

        if (retryCount >= 5 && !sessionData) {
            setSnackbar({
                message: "Failed to retrieve session data after multiple attempts. Please try again.",
                severity: "error",
                open: true,
            });
            setIsLoading(false);
        }
    }, [supabase, sessionData, retryCount]);

    const saveGoogleUser = async ({ email, name, avatar_url, storedReferralCode }: { email: string; name: string; avatar_url: string; storedReferralCode: string | null }) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        try {
            const response = await fetch("/api/users/google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, name, avatar_url, storedReferralCode }),
                signal: controller.signal,
            });

            const data = await response.json();

            if (!data.success) {
                console.error("Error saving user data:", data.message);
                setSnackbar({
                    message: "Failed to save user data. Please try again.",
                    severity: "error",
                    open: true,
                });
                localStorage.removeItem('referralCode');
                return;
            } else {
                setSnackbar({
                    message: "Logged in successfully.",
                    severity: "success",
                    open: true,
                });
                localStorage.removeItem('referralCode');
                router.push("/explore");
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                setSnackbar({
                    message: "The request took too long to respond. Please try again later.",
                    severity: "error",
                    open: true,
                });
            } else {
                setSnackbar({
                    message: "An error occurred while saving user data. Please try again.",
                    severity: "error",
                    open: true,
                });
            }
            localStorage.removeItem('referralCode');
        } finally {
            clearTimeout(timeoutId);
        }
    };

    if (isLoading) return <GlobalLoading />;

    return (
        <>
            {snackbar.open && (
                <CustomSnackbar
                    message={snackbar.message}
                    severity={snackbar.severity}
                    setSnackbar={setSnackbar}
                />
            )}
        </>
    );
}

