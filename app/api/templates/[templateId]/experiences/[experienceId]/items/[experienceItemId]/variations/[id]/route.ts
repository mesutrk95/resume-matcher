import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/error-handler";
import { NextResponse } from "next/server";

// DELETE /templates/:templateId/experiences/:experienceId/items/:experienceItemId/variations/:id
export const DELETE = withErrorHandling(async (request: Request, { params }: { params: { templateId: string; id: string } }) => {
    const { id } = params;

    // Delete a variation by ID from the database
    await db.experienceItemVariation.delete({
        where: { id: (id) },
    });

    return NextResponse.json(
        { message: `Variation ${id} deleted` },
        { status: 200 }
    );
});

// PUT /templates/:templateId/experiences/:experienceId/items/:experienceItemId/variations/:id
export const PUT = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
    const { id } = params;
    const body = await request.json();
    const { content } = body;

    // Update a variation by ID in the database
    const updatedVariation = await db.experienceItemVariation.update({
        where: { id: (id) },
        data: { content },
    });

    return NextResponse.json(
        updatedVariation,
        { status: 200 }
    );
});