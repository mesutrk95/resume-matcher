'use server';

import { db } from '@/lib/db';
import { withErrorHandling } from '@/lib/with-error-handling';
import { AIPromptStatus } from '@prisma/client';

export interface PromptCategoryWithKeys {
  name: string;
  promptKeys: string[];
}

async function getAIPromptCategoriesFn(): Promise<PromptCategoryWithKeys[]> {
  const prompts = await db.aIPrompt.findMany({
    where: {
      status: {
        not: AIPromptStatus.DELETED,
      },
      category: {
        not: null, // Ensure category is not null
      },
    },
    select: {
      key: true,
      category: true,
    },
    orderBy: {
      category: 'asc',
    },
  });

  if (!prompts.length) {
    return [];
  }

  const categoriesMap = new Map<string, string[]>();

  for (const prompt of prompts) {
    if (prompt.category) {
      // Should always be true due to the where clause
      if (!categoriesMap.has(prompt.category)) {
        categoriesMap.set(prompt.category, []);
      }
      categoriesMap.get(prompt.category)!.push(prompt.key);
    }
  }

  return Array.from(categoriesMap.entries()).map(([name, promptKeys]) => ({
    name,
    promptKeys,
  }));
}

export const getAIPromptCategories = withErrorHandling(getAIPromptCategoriesFn);
