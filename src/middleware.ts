import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, verifyTokenExist } from "@/utilities/auth";

const BOT_USER_AGENTS = [
    "facebookexternalhit",
    "Twitterbot",
    "Googlebot",
    "bingbot",
    "LinkedInBot",
    "WhatsApp",
    "TelegramBot",
];

const isBot = (userAgent: string) => {
    return BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));
};

export const middleware = async (request: NextRequest) => {
    const { cookies, nextUrl, url } = request;
    const { value: token } = cookies.get("token") ?? { value: null };

    const protectedRoutes = [
        "/like",
        "/unlike",
        "/follow",
        "/unfollow",
        "/edit",
        "/delete",
        "/retweet",
        "/unretweet",
        "/tweets/create",
        "/messages/create",
        "/create-blog",
    ];
    const staticRoutesPrivate = ["/notifications", "/messages", "/home", "/explore", "/settings", "/sessions"];

    const hasVerifiedToken = token && (await verifyJwtToken(token));
    const hasVerifiedTokenExist = token && (await verifyTokenExist(token));

    // If the request is from a bot, allow it to bypass authentication checks
    if (isBot(request.headers.get("user-agent") || "")) {
        return NextResponse.next();
    }

    if ((!hasVerifiedToken || !hasVerifiedTokenExist) && protectedRoutes.some((route) => nextUrl.pathname.endsWith(route))) {
        return NextResponse.redirect(new URL("/not-authorized", url));
    }

    if ((!hasVerifiedToken || !hasVerifiedTokenExist) && staticRoutesPrivate.some((route) => nextUrl.pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/", url));
    }

    if (hasVerifiedToken && hasVerifiedTokenExist && nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/explore", url));
    }

    if (
        hasVerifiedToken && hasVerifiedTokenExist &&
        (nextUrl.pathname === "/notifications/edit" ||
            nextUrl.pathname === "/messages/edit" ||
            nextUrl.pathname === "/explore/edit" ||
            nextUrl.pathname === "/home/edit" ||
            nextUrl.pathname === "/settings/edit")
    ) {
        const route = nextUrl.pathname.split("/")[1];
        return NextResponse.redirect(new URL(`/${route}`, url));
    }

    return NextResponse.next();
};

export const config = {
    matcher: ["/", "/api/:api*", "/:path*"],
};
