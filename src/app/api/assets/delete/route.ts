import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function DELETE(request: NextRequest) {
    try {
        const assetId = request.headers.get("assetId");

        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;

        const verifiedToken: UserProps = token && (await verifyJwtToken(token));

        if (!verifiedToken) {
            return NextResponse.json({
                success: false,
                message: "You are not authorized to perform this action",
            }, { status: 401 });
        }

        if (!assetId) {
            return NextResponse.json({
                success: false,
                message: "Asset ID is required",
            }, { status: 400 });
        }

        const deletedAsset = await prisma.asset.deleteMany({
            where: {
                id: assetId,
                authorId: verifiedToken.id,
            },
        });

        if (deletedAsset.count === 0) {
            return NextResponse.json({
                success: false,
                message: "Asset not found or you are not the owner",
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Asset deleted successfully",
        }, { status: 200 });

    } catch (error: unknown) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
