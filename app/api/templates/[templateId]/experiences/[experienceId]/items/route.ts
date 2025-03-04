import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/error-handler";
import { NextResponse } from "next/server";

// GET /templates/:templateId/experiences/:experienceId/items
export const GET = withErrorHandling(async (request: Request, { params }: { params: { experienceId: string } }) => {
    const { experienceId } = params;

    // Fetch a single experience by ID from the database
    const experience = await db.experienceItem.findMany({
        where: { experienceId },
    });

    if (!experience) {
        return NextResponse.json({ message: "Experience not found" }, { status: 404 });
    }

    return NextResponse.json(experience);
});

// POST /templates/:templateId/experiences/:experienceId/items
export const POST = withErrorHandling(async (request: Request, { params }: { params: { experienceId: string, templateId: string } }) => {
    const { experienceId, templateId } = params;
    const body = await request.json();
    const { description } = body;

    // Update an experience by ID in the database
    const updatedExperience = await db.experienceItem.create({
        data: {
            experienceId,
            templateId,
            description,
        },
    });

    return NextResponse.json(
        updatedExperience,
        { status: 200 }
    );
});
