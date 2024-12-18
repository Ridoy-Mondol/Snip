"use client";
import localFont from "next/font/local";
import Head from "next/head";
import Script from "next/script";
import { usePathname } from "next/navigation";

import "../styles/reset.scss";
import "../styles/globals.scss";
import Providers from "./providers";
import OneSignalProvider from "@/components/onesignal/OneSignalProvider";

// export const metadata = {
//     title: "Snip",
// };

const roboto = localFont({
    src: "../fonts/Roboto.ttf",
    display: "swap",
    variable: "--font-roboto",
});

const poppins = localFont({
    src: [
        {
            path: "../fonts/Poppins-ExtraLight.ttf",
            weight: "100",
            style: "normal",
        },
        {
            path: "../fonts/Poppins-Light.ttf",
            weight: "200",
            style: "normal",
        },
        {
            path: "../fonts/Poppins-Regular.ttf",
            weight: "400",
            style: "normal",
        },
        {
            path: "../fonts/Poppins-Medium.ttf",
            weight: "500",
            style: "normal",
        },
        {
            path: "../fonts/Poppins-SemiBold.ttf",
            weight: "600",
            style: "normal",
        },
        {
            path: "../fonts/Poppins-Bold.ttf",
            weight: "700",
            style: "normal",
        },
        {
            path: "../fonts/Poppins-ExtraBold.ttf",
            weight: "800",
            style: "normal",
        },
    ],
    display: "swap",
    variable: "--font-poppins",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const shouldIncludeOneSignal = pathname !== "/";
    return (
        <html lang="en" className={`${roboto.variable} ${poppins.variable}`}>
        <Head>
         <title>Snip</title>
       </Head>
            <body>
            <Script
                    src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"
                    strategy="afterInteractive"
                />
                <Providers>
                     {shouldIncludeOneSignal && <OneSignalProvider />}
                    {children}
                </Providers>
            </body>
        </html>
    );
}
