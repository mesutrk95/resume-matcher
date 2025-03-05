import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/error-handler";
import { NextResponse } from "next/server";

// PUT /templates/:templateId
export const PUT = withErrorHandling(async (request: Request, { params }: { params: { templateId: string } }) => {
  const { templateId } = params;
  const body = await request.json();
  const { name, description, content } = body;

  // Update the template in the database
  const updatedTemplate = await db.resumeTemplate.update({
    where: { id: templateId },
    data: { name, description, content },
  });

  return NextResponse.json(
    updatedTemplate,
    { status: 200 }
  );
});

// GET /templates/:templateId
export const GET = withErrorHandling(async (request: Request, { params }: { params: { templateId: string } }) => {
  const { templateId } = params;

  // Fetch a single template by ID from the database
  const template = await db.resumeTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    return NextResponse.json({ message: "Template not found" }, { status: 404 });
  }

  return NextResponse.json(template);
});

// DELETE /templates/:templateId 
export const DELETE = withErrorHandling(async (request: Request, { params }: { params: { templateId: string } }) => {
  const { templateId } = params;
  // Delete all templates from the database
  await db.resumeTemplate.delete({ where: { id: templateId }, });

  return NextResponse.json(
    {
      message: "template deleted",
    },
    { status: 200 }
  );
});