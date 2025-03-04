import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/error-handler";
import { NextResponse } from "next/server";

// GET /templates/:templateId/experiences/:experienceId
export const GET = withErrorHandling(async (request: Request, { params }: { params: { templateId: string; experienceId: string } }) => {
    const { templateId, experienceId } = params;

    // Fetch a single experience by ID from the database
    const experience = await db.experience.findUnique({
        where: { id: experienceId },
        include: {
            items: true
        },
    });

    if (!experience) {
        return NextResponse.json({ message: "Experience not found" }, { status: 404 });
    }

    return NextResponse.json(experience);
});

// PUT /templates/:templateId/experiences/:experienceId
export const PUT = withErrorHandling(async (request: Request, { params }: { params: { templateId: string; experienceId: string } }) => {
    const { templateId, experienceId } = params;
    const body = await request.json();
    const { companyName, role, startDate, endDate } = body;

    // Update an experience by ID in the database
    const updatedExperience = await db.experience.update({
        where: { id: experienceId },
        data: {
            companyName,
            role,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
        },
    });

    return NextResponse.json(
        updatedExperience,
        { status: 200 }
    );
});

// DELETE /templates/:templateId/exps/:experienceId
export const DELETE = withErrorHandling(async (request: Request, { params }: { params: { templateId: string; experienceId: string } }) => {
    const { templateId, experienceId } = params;

    // Delete an experience by ID from the database
    await db.experience.delete({
        where: { id: experienceId },
    });

    return NextResponse.json(
        { message: `Experience ${experienceId} deleted for template ${templateId}` },
        { status: 200 }
    );
});