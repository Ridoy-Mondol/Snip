"use client";

import { useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const OneSignalInitializer = () => {
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
                    notifyButton: { enable: false },
                    allowLocalhostAsSecureOrigin: true,
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

export default OneSignalInitializer;
