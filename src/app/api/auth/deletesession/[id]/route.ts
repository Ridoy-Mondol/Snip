import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client"; 

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    
    const sessionId = params.id;
    console.log('sessionId', sessionId);

    if (!sessionId) {
        return NextResponse.json({ message: "Session ID is required" }, { status: 400 });
    }

    try {

        await prisma.session.delete({
            where: {
                id: sessionId,
            },
        })

        return NextResponse.json({ success: true, message: "Session deleted successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Error occurred while deleting session" }, { status: 500 });
    }
}
