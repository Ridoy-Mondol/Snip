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
    const router = useRouter();
    const supabase = createClientComponentClient();
    const storedReferralCode = localStorage.getItem('referralCode') || null;

    useEffect(() => {
        const fetchSessionAndSaveUser = async () => {
            try {
                // Fetch the session data
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("Failed to retrieve session data:", sessionError);
                    setSnackbar({
                        message: "Failed to retrieve session data. Please try again.",
                        severity: "error",
                        open: true,
                    });
                    setIsLoading(false);
                    return;
                }

                const user = sessionData?.session?.user;

                if (user) {
                    const { email, user_metadata } = user;
                    const { name, avatar_url } = user_metadata || {};

                    if (email && name && avatar_url) {
                        await saveGoogleUser({ email, name, avatar_url, storedReferralCode });
                    } else {
                        console.error("User data missing (email, name, avatar_url).");
                        setSnackbar({
                            message: "Incomplete user data received. Please try again.",
                            severity: "error",
                            open: true,
                        });
                    }
                } else {
                    setSnackbar({
                        message: "User not authenticated. Please try logging in again.",
                        severity: "error",
                        open: true,
                    });
                }
            } catch (error) {
                console.error("Error during session fetch:", error);
                setSnackbar({
                    message: "An error occurred while fetching session data. Please try again.",
                    severity: "error",
                    open: true,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessionAndSaveUser();
    }, [supabase]);

    const saveGoogleUser = async ({ email, name, avatar_url, storedReferralCode }: { email: string; name: string; avatar_url: string; storedReferralCode: string | null }) => {
        try {
            const response = await fetch("/api/users/google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, name, avatar_url, storedReferralCode }),
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
        } catch (error) {
            console.error("Error saving user data:", error);
            setSnackbar({
                message: "An error occurred while saving user data. Please try again.",
                severity: "error",
                open: true,
            });
            localStorage.removeItem('referralCode');
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