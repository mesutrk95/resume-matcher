import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/error-handler";
import { NextResponse } from "next/server";

// GET /templates/:templateId/experiences
export const GET = withErrorHandling(async (request: Request, { params }: { params: { templateId: string } }) => {
    const { templateId } = params;

    // Fetch all experiences for a specific template from the database
    const experiences = await db.experience.findMany({
        where: { templateId: templateId },
    });

    return NextResponse.json({
        data: experiences,
    });
});

// POST /templates/:templateId/experiences
export const POST = withErrorHandling(async (request: Request, { params }: { params: { templateId: string } }) => {
    const { templateId } = params;
    const body = await request.json();
    const { companyName, role, startDate, endDate } = body;

    // Create a new experience for a specific template in the database
    const newExperience = await db.experience.create({
        data: {
            companyName,
            role,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            templateId: (templateId),
        },
    });

    return NextResponse.json(
        newExperience,
        { status: 201 }
    );
});