import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";

import { prisma } from "@/prisma/client";
import { getJwtSecretKey } from "@/utilities/auth";
import { createNotification } from "@/utilities/fetch";

export async function POST(request: NextRequest) {
    const { email, name, avatar_url, storedReferralCode } = await request.json();

    try {
        const secret = process.env.CREATION_SECRET_KEY;
        if (!secret) {
            return NextResponse.json({
                success: false,
                message: "Secret key not found.",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        const userAgent = request.headers.get("user-agent") || "Unknown Device";
        const ipAddress = getIpAddress(request);

        const parser = new UAParser(userAgent);
        const os = parser.getOS();
        const browser = parser.getBrowser();
        let deviceInfo = os.name && os.version ? `${os.name} ${os.version}` : os.name || "Unknown OS";

        if (existingUser) {
                // Login logic
                const token = await generateJwt(existingUser);

                await prisma.session.create({
                    data: {
                        userId: existingUser.id,
                        token,
                        device: deviceInfo,
                        browser: `${browser.name || "Unknown Browser"} ${browser.version || "Unknown Version"}`,
                        ipAddress: ipAddress.toString(),
                    },
                });

                const response = NextResponse.json({ success: true });
                response.cookies.set({
                    name: "token",
                    value: token,
                    path: "/",
                });

                return response;
        
        } else {
            // Signup logic
            let username = email.split("@")[0];
            let suffix = 1;
            while (await prisma.user.findUnique({ where: { username } })) {
                username = `${email.split("@")[0]}${suffix++}`;
            }
            
            let referrerId = null;
            if (storedReferralCode) {
                const referrer = await prisma.user.findUnique({
                    where: {
                       referralCode: storedReferralCode, 
                    },
                    select: {
                        id: true,
                    }
                });

                referrerId = referrer ? referrer.id : null;
            }

            const apiKey = uuidv4();
            const referralCode = generateReferralCode(username);

            const newUser = await prisma.user.create({
                data: {
                    email,
                    name,
                    photoUrl: avatar_url,
                    username,
                    apiKey,
                    referralCode,
                    referrerId,
                },
            });

            const promises = [];

            if (referrerId) {
                promises.push(
                    prisma.referral.create({
                        data: {
                            referrerId: referrerId,
                            referredUserId: newUser.id,
                        },
                    }),
                    
                    prisma.user.update({
                        where: { id: referrerId },
                        data: {
                            referralPoints: { increment: 10 },
                        },
                    })
                );
            }
        
            promises.push(createNotification(newUser.username, "welcome", secret));
        
            const token = await generateJwt(newUser);

            promises.push(
                prisma.session.create({
                    data: {
                        userId: newUser.id,
                        token,
                        device: deviceInfo,
                        browser: `${browser.name || "Unknown Browser"} ${browser.version || "Unknown Version"}`,
                        ipAddress: ipAddress.toString(),
                    },
                })
            );
        
            // Execute all dependent operations concurrently
            await Promise.all(promises);        


            const response = NextResponse.json({ success: true });
            response.cookies.set({
                name: "token",
                value: token,
                path: "/",
            });

            return response;
        }
    } catch (error: unknown) {
        console.error("Error during login:", error);
        return NextResponse.json({
            success: false,
            error: error,
            message: error instanceof Error ? error.message : "An unknown error occurred.",
        });
    }
}

async function generateJwt(user: any) {
    return await new SignJWT({
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
}

const getIpAddress = (request: NextRequest) => {
    const isLocalhost =
        request.headers.get("x-forwarded-for")?.includes("127.0.0.1") ||
        request.headers.get("x-forwarded-for")?.includes("::1");

    if (isLocalhost || process.env.NODE_ENV === "development") {
        return "::1";
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    return request.ip || "Unknown IP";
};

const generateReferralCode = (username: string): string => {
    const usernamePart = username.substring(0, 3).toLowerCase();
    const randomPart = Math.random().toString(36).substring(2, 8).toLowerCase();
    return `${usernamePart.padEnd(3, "X")}-${randomPart}`;
};
