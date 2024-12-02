import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client"; 

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    
    const userId = params.id;

    if (!userId) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    try {

        await prisma.session.deleteMany({
            where: {
                userId: userId,
            },
        })

        return NextResponse.json({ success: true, message: "All Session deleted successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Error occurred while deleting session" }, { status: 500 });
    }
}
