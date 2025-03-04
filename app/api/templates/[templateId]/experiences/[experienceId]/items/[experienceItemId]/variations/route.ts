import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/error-handler";
import { NextResponse } from "next/server";

// GET /templates/:templateId/experiences/:experienceId/items/:experienceItemId/variations
export const GET = withErrorHandling(async (request: Request, { params }: { params: { templateId: string; experienceId: string } }) => {
    const { experienceId } = params;

    // Fetch all variations for an experience from the database
    const variations = await db.experienceItemVariation.findMany({
        where: { experienceItemId: (experienceId) },
    });

    return NextResponse.json({
        data: variations,
    });
});

// POST /templates/:templateId/experiences/:experienceId/items/:experienceItemId/variations
export const POST = withErrorHandling(async (request: Request, { params }: { params: { templateId: string; experienceItemId: string } }) => {
    const { experienceItemId } = params;
    const body = await request.json();
    const { content } = body;

    // Create a new variation for an experience in the database
    const newVariation = await db.experienceItemVariation.create({
        data: {
            content,
            experienceItemId,
        },
    });

    return NextResponse.json(
        newVariation,
        { status: 201 }
    );
});
