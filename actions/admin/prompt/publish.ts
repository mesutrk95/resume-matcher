'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { AIPromptStatus, AIPromptVariationStatus } from '@prisma/client'; // Assuming these enums exist from your Prisma schema

interface PublishPromptResult {
  success: boolean;
  message?: string;
}

export async function publishPrompt(promptKey: string): Promise<PublishPromptResult> {
  if (!promptKey) {
    return { success: false, message: 'Prompt key is required.' };
  }

  try {
    const prompt = await db.aIPrompt.findUnique({
      where: { key: promptKey },
      include: {
        // Use include to fetch related variations
        variations: {
          where: {
            status: {
              not: AIPromptVariationStatus.DELETED,
            },
          },
          select: { id: true }, // Only need id for counting, but variations will be on prompt object
        },
      },
    });

    if (!prompt) {
      return { success: false, message: 'Prompt not found.' };
    }

    // prompt.variations will now be available due to 'include'
    if (!prompt.variations || prompt.variations.length === 0) {
      return {
        success: false,
        message: 'Prompt must have at least one non-deleted variation to be published.',
      };
    }

    // Update prompt status to ACTIVE
    await db.aIPrompt.update({
      where: { key: promptKey },
      data: { status: AIPromptStatus.ACTIVE },
    });

    // Update all non-deleted variations of this prompt to ACTIVE
    // Assuming the foreign key in AIPromptVariation is promptKey (referencing AIPrompt.key)
    await db.aIPromptVariation.updateMany({
      where: {
        prompt: {
          // Use the 'prompt' relation to filter by the parent AIPrompt's key
          key: promptKey,
        },
        status: {
          not: AIPromptVariationStatus.DELETED,
        },
      },
      data: { status: AIPromptVariationStatus.ACTIVE },
    });

    revalidatePath(`/admin/prompts/${promptKey}`);
    revalidatePath('/admin/prompts');
    revalidatePath(`/admin/prompts/${promptKey}/variations`);

    return { success: true, message: 'Prompt and its variations published successfully.' };
  } catch (error) {
    console.error('Error publishing prompt:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to publish prompt: ${errorMessage}` };
  }
}
