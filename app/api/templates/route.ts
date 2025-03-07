import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-error-handler";
import { NextResponse } from "next/server";

// GET /templates
export const GET = withErrorHandling(async () => {
    // Fetch all templates from the database
    const templates = await db.resumeTemplate.findMany();

    return NextResponse.json({ data: templates });
});

// POST /templates
export const POST = withErrorHandling(async (request: Request) => {
    const body = await request.json();
    const { name, description, content } = body;
    const user = await currentUser()

    // Create a new template in the database
    const newTemplate = await db.resumeTemplate.create({
        data: {
            name,
            description,
            content,
            userId: user?.id!,
        },
    });

    return NextResponse.json(
        newTemplate,
        { status: 201 }
    );
});
