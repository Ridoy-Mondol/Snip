"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "@mui/material";
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import SignUpDialog from "@/components/dialog/SignUpDialog";
import LogInDialog from "@/components/dialog/LogInDialog";
import { logInAsTest } from "@/utilities/fetch";
import GlobalLoading from "@/components/misc/GlobalLoading";
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";


declare global {
    interface Window {
        OneSignal?: any;
    }
}

export default function RootPage() {
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [isLogInOpen, setIsLogInOpen] = useState(false);
    const [isLoggingAsTest, setIsLoggingAsTest] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });

    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleSignUpClick = () => {
        setIsSignUpOpen(true);
    };
    const handleSignUpClose = () => {
        setIsSignUpOpen(false);
    };
    const handleLogInClick = () => {
        setIsLogInOpen(true);
    };
    const handleLogInClose = () => {
        setIsLogInOpen(false);
    };

    const handleTestLogin = async () => {
        const userAgent = navigator.userAgent || "Unknown Device";
        const ipAddress = await fetch("https://api.ipify.org?format=json")
                .then((res) => res.json())
                .then((data) => data.ip)
                .catch(() => "Unknown IP");
        try {
            setIsLoggingAsTest(true);
            const response = await logInAsTest(userAgent, ipAddress);
            if (!response?.success) {
                setIsLoggingAsTest(false);
                setSnackbar({ message: "Something went wrong! Please try again.", severity: "error", open: true });
                return;
            }
            router.push("/explore");
        } catch (error) {
            setIsLoggingAsTest(false);
            setSnackbar({ message: "An error occurred during login. Please try again.", severity: "error", open: true });
            console.error("Error in handleTestLogin:", error);
        }
    }; 
    
    const redirectTo =
  process.env.NODE_ENV === "production"
    ? "https://snip-mu.vercel.app/auth/google/callback"
    : "http://localhost:3000/auth/google/callback";
    console.log("Redirecting to:", redirectTo);
    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_HOST_URL}/auth/google/callback`,
                },
            });

            if (error) {
                setSnackbar({
                    message: "Failed to log in with Google. Please try again.",
                    severity: "error",
                    open: true,
                });
                console.error("Google Login Error:", error);
            }
        } catch (error) {
            console.error("Error during Google login:", error);
            setSnackbar({
                message: "An error occurred during Google login. Please try again.",
                severity: "error",
                open: true,
            });
        }
    };  

    if (isLoggingAsTest) return <GlobalLoading />;

    return (
        <>
            <main className="root">
                <div className="root-left">
                    <Image src="/assets/root.png" alt="" fill />
                    <div className="root-left-logo">
                        <Image src="/assets/favicon-white.png" alt="" width={140} height={140} />
                    </div>
                </div>
                <div className="root-right">
                    <Image src="/assets/favicon.png" alt="" width={40} height={40} />
                    <h1>See what&apos;s happening in the world right now</h1>
                    <p>Join Twitter today.</p>
                    <div className="button-group">
                        <button className="btn" onClick={handleSignUpClick}>
                            Create account
                        </button>
                        <button className="btn btn-light" onClick={handleLogInClick}>
                            Sign in
                        </button>
                        <Tooltip
                            title="You can log in as test account to get full user priviliges if you don't have time to sign up. You can ALSO just look around without even being logged in, just like real Twitter!"
                            placement="bottom"
                        >
                            <button onClick={handleTestLogin} className="btn btn-light">
                                <span>Test account (Hover here!)</span>
                            </button>
                        </Tooltip>
                        <button className="btn btn-light" onClick={handleGoogleLogin}>
                            Login with Google
                        </button>
                    </div>
                </div>
            </main>
            <SignUpDialog open={isSignUpOpen} handleSignUpClose={handleSignUpClose} />
            <LogInDialog open={isLogInOpen} handleLogInClose={handleLogInClose} />
            <Link className="fixed-link text-muted" href="/explore">
                Explore without signing in <FaArrowRight />
            </Link>
            {snackbar.open && (
                <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
            )}
        </>
    );
}
