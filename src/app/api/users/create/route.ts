import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { v4 as uuidv4 } from "uuid";
import { UAParser } from 'ua-parser-js';

import { prisma } from "@/prisma/client";
import { hashPassword } from "@/utilities/bcrypt";
import { getJwtSecretKey } from "@/utilities/auth";
import { createNotification } from "@/utilities/fetch";

export async function POST(request: NextRequest) {
    const userData = await request.json();
    const hashedPassword = await hashPassword(userData.password);
    const secret = process.env.CREATION_SECRET_KEY;

    if (!secret) {
        return NextResponse.json({
            success: false,
            message: "Secret key not found.",
        });
    }

    try {
        // Check if username exists
        const userExists = await prisma.user.findUnique({
            where: {
                username: userData.username,
            },
        });

        if (userExists) {
            return NextResponse.json({
                success: false,
                message: "Username already exists.",
            });
        }

        let referrerId = null;
        if (userData.referralCode) {
            const referrer = await prisma.user.findUnique({
                where: {
                    referralCode: userData.referralCode,
                },
                select: {
                    id: true,
                },
            });

            referrerId = referrer ? referrer.id : null;
        }

        const userAgent = request.headers.get("user-agent") || "Unknown Device";
        const ipAddress = getIpAddress(request);

        const parser = new UAParser(userAgent);
        const device = parser.getDevice();
        const os = parser.getOS();
        const browser = parser.getBrowser();

        let deviceInfo = os.name && os.version ? `${os.name} ${os.version}` : os.name || "Unknown OS";

        const apiKey = uuidv4();
        const referralCode = generateReferralCode(userData.username);

        const newUser = await prisma.user.create({
            data: {
                username: userData.username,
                password: hashedPassword,
                name: userData.name,
                apiKey: apiKey,
                referralCode: referralCode,
                referrerId: referrerId,
            },
        });

        const promises = [];

        if (referrerId && newUser) {
            promises.push(
                prisma.referral.create({
                    data: {
                        referrerId: referrerId,
                        referredUserId: newUser.id,
                    },
                }),
                prisma.user.update({
                    where: {
                        id: referrerId,
                    },
                    data: {
                        referralPoints: {
                            increment: 10,
                        },
                    },
                })
            );
        }

        promises.push(createNotification(newUser.username, "welcome", secret));

        const token = await new SignJWT({
            id: newUser.id,
            username: newUser.username,
            name: newUser.name,
            description: newUser.description,
            location: newUser.location,
            website: newUser.website,
            isPremium: newUser.isPremium,
            createdAt: newUser.createdAt,
            photoUrl: newUser.photoUrl,
            headerUrl: newUser.headerUrl,
        })
            .setProtectedHeader({
                alg: "HS256",
            })
            .setIssuedAt()
            .setExpirationTime("1d")
            .sign(getJwtSecretKey());

        promises.push(
            prisma.session.create({
                data: {
                    userId: newUser.id,
                    token: token,
                    device: deviceInfo,
                    browser: `${browser.name || "Unknown Browser"} ${browser.version || "Unknown Version"}`,
                    ipAddress: ipAddress.toString(),
                },
            })
        );
        
        // execute all promises in parallel
        await Promise.all(promises);

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
        return NextResponse.json({
            success: false,
            error: error,
            message: error instanceof Error ? error.message : "An unknown error occurred.",
        });
    }
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
