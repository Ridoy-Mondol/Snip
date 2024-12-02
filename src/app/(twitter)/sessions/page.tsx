"use client";
import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
} from "@mui/material";
import { FaAndroid, FaWindows, FaApple, FaGlobe, FaTimes, FaLaptop, FaClock } from "react-icons/fa";
import { AuthContext } from "../layout";
import CircularLoading from "@/components/misc/CircularLoading";
import { set } from "date-fns";

interface Session {
    id: string;
    device: string;
    browser: string;
    ipAddress: string;
    createdAt: string;
}

const SessionManager = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);

    const { token } = useContext(AuthContext);

    const router = useRouter();

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const userId = token?.id;
            const response = await fetch(`/api/sessions/${userId}`);
            const data = await response.json();

            if (data.success) {
                setSessions(data.sessions);
            } else {
                console.error("Failed to fetch sessions:", data.message);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const logoutFromSession = async (sessionId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/auth/deletesession/${sessionId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
    
            if (data.success) {
                setSessions((prevSessions) =>
                    prevSessions.filter((session) => session.id !== sessionId)
                );
                setLoading(false);   
            } else {
                console.error("Failed to logout from session:", data.message);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error logging out of session:", error);
            setLoading(false);
        }
    };
    

    const logoutFromAllSessions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/auth/delete_all_sessions/${token?.id}`, { 
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }, 
                });
            const data = await response.json();
            if (data.success) {
                setSessions([]);
                router.push("/");
            } else {
                console.error("Failed to logout from all sessions:", data.message);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error logging out of all sessions:", error);
            setLoading(false);
        }
    };

    const getDeviceIcon = (device: string) => {
        if (device.toLowerCase().includes("android")) return <FaAndroid size={30} />;
        if (device.toLowerCase().includes("windows")) return <FaWindows size={30} />;
        if (device.toLowerCase().includes("macos") || device.toLowerCase().includes("ios"))
            return <FaApple size={30} />;
        return <FaGlobe size={30} />;
    };

    const formatRelativeTime = (date: string) => {
        const timeDifference = Date.now() - new Date(date).getTime();
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        if (days > 0) return `${days}d ago`;
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        if (hours > 0) return `${hours}h ago`;
        const minutes = Math.floor(timeDifference / (1000 * 60));
        return `${minutes}m ago`;
    };

    useEffect(() => {
        fetchSessions();
    }, [token?.id]);

    if (loading) {
        return <CircularLoading />;
    }

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Manage Sessions
            </Typography>
            <Button
                variant="contained"
                color="error"
                onClick={logoutFromAllSessions}
                sx={{ marginBottom: 2 }}
            >
                Logout from All Sessions
            </Button>
            <Grid container spacing={2}>
                {sessions.map((session) => (
                    <Grid item xs={12} sm={6} key={session.id}>
                        <Card>
                            <CardContent
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    position: "relative",
                                }}
                            >
                                {/* Logout button at the top-right */}
                                <IconButton
                                    color="error"
                                    onClick={() => logoutFromSession(session.id)}
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                    }}
                                >
                                    <FaTimes />
                                </IconButton>

                                {/* Device icon and name */}
                                <Box display="flex" alignItems="center" gap={1}>
                                    {getDeviceIcon(session.device)}
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        sx={{
                                            marginTop: "4px",
                                            marginLeft: "2px",
                                        }}
                                    >
                                        {session.device}
                                    </Typography>
                                </Box>

                                {/* Browser */}
                                <Box display="flex" alignItems="center" gap={1}>
                                    <FaLaptop size={20} />
                                    <Typography variant="body2" color="text.secondary">
                                        {session.browser}
                                    </Typography>
                                </Box>

                                {/* Time on the next line with clock icon */}
                                <Box display="flex" alignItems="center" gap={1}>
                                    <FaClock size={20} />
                                    <Typography variant="body2" color="text.secondary">
                                        {formatRelativeTime(session.createdAt)}
                                    </Typography>
                                </Box>

                                {/* IP address */}
                                <Typography variant="body2" color="text.secondary">
                                    IP Address: {session.ipAddress}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default SessionManager;
