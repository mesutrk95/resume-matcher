'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { AIPromptVariationStatus } from '@prisma/client'; // Assuming this enum exists

interface UpdateVariationStatusResult {
  success: boolean;
  message?: string;
  updatedVariation?: { id: string; status: AIPromptVariationStatus };
}

export async function updateAIPromptVariationStatus(
  variationId: string,
  newStatus: AIPromptVariationStatus,
): Promise<UpdateVariationStatusResult> {
  if (!variationId) {
    return { success: false, message: 'Variation ID is required.' };
  }

  if (!newStatus || !Object.values(AIPromptVariationStatus).includes(newStatus)) {
    return { success: false, message: 'Invalid status provided.' };
  }

  // Prevent setting to DELETED or other non-toggleable statuses via this action
  if (
    newStatus === AIPromptVariationStatus.DELETED ||
    newStatus === AIPromptVariationStatus.DRAFT
  ) {
    return {
      success: false,
      message: `Status cannot be changed to ${newStatus} using this action.`,
    };
  }

  try {
    const variation = await db.aIPromptVariation.findUnique({
      where: { id: variationId },
      select: { prompt: { select: { key: true } } }, // Select prompt key for revalidation
    });

    if (!variation || !variation.prompt?.key) {
      return { success: false, message: 'Variation not found or prompt key missing.' };
    }

    const updatedVariation = await db.aIPromptVariation.update({
      where: { id: variationId },
      data: { status: newStatus },
      select: { id: true, status: true }, // Return the updated status
    });

    // Revalidate paths
    revalidatePath(`/admin/prompts/${variation.prompt.key}/variations`);
    revalidatePath(`/admin/prompts/${variation.prompt.key}/variations/${variationId}`);
    revalidatePath(`/admin/prompts/${variation.prompt.key}`); // Prompt page might show aggregated status
    revalidatePath('/admin/prompts'); // Main prompts list

    return {
      success: true,
      message: `Variation status updated to ${newStatus}.`,
      updatedVariation,
    };
  } catch (error) {
    console.error('Error updating variation status:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update variation status: ${errorMessage}` };
  }
}
