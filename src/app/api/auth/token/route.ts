import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client"; 

export async function POST(request: NextRequest) {
    const token = await request.json();

    try {

        const session = await prisma.session.findFirst({
            where: { token: token }, 
        });
        if (!session) {
            return NextResponse.json(false);
        }
        return NextResponse.json(true);

    } catch (error) {
        return NextResponse.json({ message: "Invalid token or error during verification" }, { status: 500 });
    }
}
