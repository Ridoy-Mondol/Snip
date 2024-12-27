import localFont from "next/font/local";
import Script from "next/script";
import { Metadata } from "next";

import "../styles/reset.scss";
import "../styles/globals.scss";
import Providers from "./providers";
import OneSignalProvider from "@/components/layout/OneSignalProvider";

export const metadata: Metadata = {
    title: "Snip",
    description: "A social platform to explore and share trending content.",
    openGraph: {
        type: "website",
        title: "Snip - Explore and Share Content",
        description: "A social platform to explore and share trending content.",
        url: process.env.NEXT_PUBLIC_HOST_URL,
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
                type: "image/png",
                width: 1200,
                height: 630,
                alt: "Snip Platform OpenGraph Image",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Snip - Explore and Share Content",
        description: "A social platform to explore and share trending content.",
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
                alt: "Snip Twitter Image",
            },
        ],
    },
};

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
    return (
        <html lang="en" className={`${roboto.variable} ${poppins.variable}`}>
            <body>
            <Script
                    src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"
                    strategy="afterInteractive"
                />
                <Providers>
                    <OneSignalProvider />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
