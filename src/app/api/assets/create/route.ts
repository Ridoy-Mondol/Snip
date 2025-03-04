import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";


export async function POST(request: NextRequest) {
    try {
        const { name, amount, buyPrice, date, fee, notes, authorId } = await request.json();
        console.log('data from frontend', name, amount, buyPrice, date, fee, notes, authorId)

        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;

        const verifiedToken: UserProps = token && (await verifyJwtToken(token));

        if (!verifiedToken || !authorId || (verifiedToken.id !== authorId)) {
            return NextResponse.json({
                success: false,
                message: "You are not authorized to perform this action"
            },
            { status: 401}
          );
        }

        if (!name || !amount || !buyPrice) {
            return NextResponse.json ({
                success: false,
                message: "Missing required field"
            },
            { status: 404 }
          );
        }

        const asset = await prisma.asset.create({
            data: {
                name,
                amount,
                buyPrice,
                date: date || new Date(),
                fee,
                notes,
                author: {
                    connect: {
                        id: authorId,
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            asset,
        },
        { status: 201}
      )

    } catch(error: unknown) {
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, 
        { status: 500}
      );
    }
}