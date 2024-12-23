import { NextResponse, NextRequest } from "next/server";
import { SignJWT } from "jose";
import { UAParser } from 'ua-parser-js';

import { prisma } from "@/prisma/client";
import { comparePasswords } from "@/utilities/bcrypt";
import { getJwtSecretKey } from "@/utilities/auth";

export async function POST(request: NextRequest) {
    const { username, password } = await request.json();

    try {
        console.log("NODE_ENV:", process.env.NODE_ENV);
        console.log("Connecting to database...");
        
        // Fetch user by username
        const user = await prisma.user.findFirst({
            where: { username },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Username or password is not correct.",
            });
        }

        // Verify password
        const isPasswordValid: boolean = await comparePasswords(password, user.password as string);

        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                message: "Username or password is not correct.",
            });
        }

        // Create JWT token
        const token = await new SignJWT({
            id: user.id,
            username: user.username,
            name: user.name,
            description: user.description,
            location: user.location,
            website: user.website,
            isPremium: user.isPremium,
            createdAt: user.createdAt,
            photoUrl: user.photoUrl,
            headerUrl: user.headerUrl,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1d")
            .sign(getJwtSecretKey());

        // Extract session details from request
        const userAgent = request.headers.get("user-agent") || "Unknown Device";
        const ipAddress = getIpAddress(request);
        
        // Parse the user-agent for detailed information using UAParser
        const parser = new UAParser(userAgent);
        const device = parser.getDevice();
        const os = parser.getOS();
        const browser = parser.getBrowser();

        // Get detailed OS info including version (e.g., "Windows 10", "Windows 11")
        let deviceInfo = os.name && os.version ? `${os.name} ${os.version}` : os.name || "Unknown OS"; // Windows 10, macOS 11, etc.

        // Store session in database
        await prisma.session.create({
            data: {
                userId: user.id,
                token: token,
                device: deviceInfo,
                browser: `${browser.name || "Unknown Browser"} ${browser.version || "Unknown Version"}`,
                ipAddress: ipAddress.toString(),
            },
        });

        // Create response with token in cookie
        const response = NextResponse.json({
            success: true,
        });

        response.cookies.set({
            name: "token",
            value: token,
            path: "/",
        });

        return response;
    } catch (error: unknown) {
        console.error("Error during login:", error);
        return NextResponse.json({ success: false, error });
    }
}



const getIpAddress = (request: NextRequest) => {
    const isLocalhost = request.headers.get("x-forwarded-for")?.includes("127.0.0.1") || request.headers.get("x-forwarded-for")?.includes("::1");

    // In development environment (localhost), return "::1" for localhost IP
    if (isLocalhost || process.env.NODE_ENV === "development") {
        return "::1";
    }

    // In production, extract first IP from x-forwarded-for
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim(); // Get the first IP
    }
    
    // Fallback to the request IP if no x-forwarded-for header
    return request.ip || "Unknown IP";
};