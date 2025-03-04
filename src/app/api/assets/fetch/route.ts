import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET (request: NextRequest) {
    try {
        const authorId = request.headers.get("userId");
        if (!authorId) {
            return NextResponse.json({
                success: false,
                message: "You are not authorized to visit it"
            }, { status: 401 }
          )
        }

        const assets = await prisma.asset.findMany({
            where: {
                authorId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        photoUrl: true,
                        isPremium: true,
                        description: true,
                    }
                }
            },
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            assets,
        }, 
        { status: 200}
      )
    } catch(error: unknown) {
        return NextResponse.json({
            success: false,
            message: "Something went wrong",
            error: error instanceof Error ? error.message : "Unknown error",
        }, 
        { status: 500 }
       )
    }
}