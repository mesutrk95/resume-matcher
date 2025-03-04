import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/error-handler";
import { NextResponse } from "next/server";


// GET /templates/:templateId/exps/:experienceId/items/:experienceItemId
export const GET = withErrorHandling(async (request: Request, { params }: { params: { templateId: string; experienceItemId: string } }) => {
    const { templateId, experienceItemId } = params;

    // Fetch a single experience by ID from the database
    const experience = await db.experienceItem.findUnique({
        where: { id: experienceItemId },
        include: {
            variations: true
        },
    });

    if (!experience) {
        return NextResponse.json({ message: "Experience not found" }, { status: 404 });
    }

    return NextResponse.json(experience);
});

// PUT /templates/:templateId/exps/:experienceId/items/:experienceItemId
export const PUT = withErrorHandling(async (request: Request, { params }: { params: { templateId: string; experienceItemId: string } }) => {
    const { experienceItemId } = params;
    const body = await request.json();
    const { description } = body;

    // Update an experience by ID in the database
    const updatedExperience = await db.experienceItem.update({
        where: { id: experienceItemId },
        data: { description },
    });

    return NextResponse.json(
        updatedExperience,
        { status: 200 }
    );
});

// DELETE /templates/:templateId/exps/:experienceId/items/:experienceItemId
export const DELETE = withErrorHandling(async (request: Request, { params }: { params: { experienceItemId: string } }) => {
    const { experienceItemId } = params;

    // Delete an experience by ID from the database
    await db.experienceItem.delete({
        where: { id: experienceItemId },
    });

    return NextResponse.json(
        { message: `Experience item ${experienceItemId} deleted.` },
        { status: 200 }
    );
});