import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";


export async function PATCH(request: NextRequest) {
    try {
        const { name, amount, buyPrice, date, fee, notes, authorId } = await request.json();

        const assetId = request.headers.get("assetId");

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

        if (!assetId) {
            return NextResponse.json({
                success: false,
                message: "Id is required"
            },
            { status: 404}
          );
        }

        const asset = await prisma.asset.update({
            where: {
              id: assetId,
            },
            data: {
                ...(name && { name }),
                ...(amount && { amount }),
                ...(buyPrice && { buyPrice }),
                ...(fee && { fee }),
                ...(notes && { notes }),
            },
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



