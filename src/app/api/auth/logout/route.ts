import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client"; 
import { verifyJwtToken } from "@/utilities/auth";
import { UAParser } from "ua-parser-js"; 
import { cookies } from "next/headers";


const getIpAddress = (request: NextRequest) => {
    const isLocalhost = request.headers.get("x-forwarded-for")?.includes("127.0.0.1") || request.headers.get("x-forwarded-for")?.includes("::1");

    if (isLocalhost || process.env.NODE_ENV === "development") {
        return "::1";
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim(); 
    }
    
    return request.ip || "Unknown IP";
};

export async function GET(request: NextRequest) {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return NextResponse.json({ success: false, message: "No token found" });
    }

    try {
        const decodedToken = token && (await verifyJwtToken(token));

        if (!decodedToken || !decodedToken.id) {
            return NextResponse.json({ success: false, message: "Invalid token" });
        }

        const userId = decodedToken.id;

        const userAgent = request.headers.get("user-agent") || "Unknown Device";
        const ipAddress = getIpAddress(request);

        const parser = new UAParser(userAgent);
        const os = parser.getOS();
        const browser = parser.getBrowser();

        const device = os.name && os.version ? `${os.name} ${os.version}` : os.name || "Unknown OS";
        const browserInfo = `${browser.name || "Unknown Browser"} ${browser.version || "Unknown Version"}`;

        await prisma.session.deleteMany({
            where: {
                userId: userId,
                device: device,
                browser: browserInfo,
                ipAddress: ipAddress.toString(),
            },
        });

        // Delete the token cookie
        const response = new NextResponse();
        response.cookies.delete("token");
        return response;
    } catch (error) {
        console.error("Error during logout:", error);
        return NextResponse.json({ success: false, error: 'Logout failed' });
    }
}
