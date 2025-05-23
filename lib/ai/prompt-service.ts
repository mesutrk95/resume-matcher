// lib/ai/prompt-service.ts
import { db } from '@/lib/db';
import { AIPromptStatus, AIPromptVariationStatus } from '@prisma/client';
import { cacheService } from '@/lib/cache/factory';
import Logger from '@/lib/logger';
import { Reason } from '@/domains/reasons';

export interface PromptWithVariations {
  key: string;
  name: string;
  description: string | null;
  jsonSchema: string | null;
  category: string | null;
  status: AIPromptStatus;
  variations: PromptVariation[];
}

export interface PromptVariation {
  id: string;
  userPrompt: string;
  systemPrompt: string | null;
  status: AIPromptVariationStatus;
  requestCount: number;
  failureCount: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalResponseTime: number;
}

export class PromptService {
  private static readonly CACHE_PREFIX = 'prompt:';
  private static readonly CACHE_TTL_MINUTES = 20 * 60;

  /**
   * Get prompt with active variations by key
   */
  async getPromptWithVariations(promptKey: Reason): Promise<PromptWithVariations | null> {
    const cacheKey = `${PromptService.CACHE_PREFIX}${promptKey}`;

    try {
      // Try to get from cache first
      const cached = cacheService.getObject<PromptWithVariations>(cacheKey);
      if (cached) {
        Logger.debug(`Prompt cache hit: ${promptKey}`);
        return cached;
      }

      // Not in cache, fetch from database
      const prompt = await this.fetchPromptFromDatabase(promptKey);

      if (!prompt) {
        Logger.warn(`Prompt not found: ${promptKey}`);
        return null;
      }

      // Cache the result
      cacheService.setObject(cacheKey, prompt, PromptService.CACHE_TTL_MINUTES);
      Logger.debug(`Prompt cached: ${promptKey}`);

      return prompt;
    } catch (error) {
      Logger.error(`Error fetching prompt: ${promptKey}`, { error });
      throw error;
    }
  }

  /**
   * Invalidate cache for a specific prompt
   */
  invalidatePromptCache(promptKey: Reason): void {
    const cacheKey = `${PromptService.CACHE_PREFIX}${promptKey}`;
    cacheService.delete(cacheKey);
    Logger.debug(`Prompt cache invalidated: ${promptKey}`);
  }

  /**
   * Fetch prompt from database
   */
  private async fetchPromptFromDatabase(promptKey: Reason): Promise<PromptWithVariations | null> {
    const prompt = await db.aIPrompt.findUnique({
      where: {
        key: promptKey,
        status: AIPromptStatus.ACTIVE, // Only active prompts
      },
      include: {
        variations: {
          where: {
            status: AIPromptVariationStatus.ACTIVE, // Only active variations
          },
          select: {
            id: true,
            userPrompt: true,
            systemPrompt: true,
            status: true,
            requestCount: true,
            failureCount: true,
            totalTokens: true,
            promptTokens: true,
            completionTokens: true,
            totalResponseTime: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!prompt) {
      return null;
    }

    // Check if prompt has active variations
    if (!prompt.variations || prompt.variations.length === 0) {
      Logger.warn(`Prompt ${promptKey} has no active variations`);
      return null;
    }

    return {
      key: prompt.key,
      name: prompt.name,
      description: prompt.description,
      jsonSchema: prompt.jsonSchema,
      category: prompt.category,
      status: prompt.status,
      variations: prompt.variations.map(v => ({
        id: v.id,
        userPrompt: v.userPrompt,
        systemPrompt: v.systemPrompt,
        status: v.status,
        requestCount: v.requestCount,
        failureCount: v.failureCount,
        totalTokens: v.totalTokens,
        promptTokens: v.promptTokens,
        completionTokens: v.completionTokens,
        totalResponseTime: v.totalResponseTime,
      })),
    };
  }

  /**
   * Check if a prompt exists and is active
   */
  async isPromptActive(promptKey: Reason): Promise<boolean> {
    const prompt = await this.getPromptWithVariations(promptKey);
    return prompt !== null && prompt.variations.length > 0;
  }

  /**
   * Get all active prompt keys (for debugging/management)
   */
  async getAllActivePromptKeys(): Promise<string[]> {
    try {
      const prompts = await db.aIPrompt.findMany({
        where: {
          status: AIPromptStatus.ACTIVE,
          variations: {
            some: {
              status: AIPromptVariationStatus.ACTIVE,
            },
          },
        },
        select: {
          key: true,
        },
      });

      return prompts.map(p => p.key);
    } catch (error) {
      Logger.error('Error fetching active prompt keys', { error });
      throw error;
    }
  }

  /**
   * Preload prompts into cache (useful for warming up cache)
   */
  async preloadPromptsIntoCache(promptKeys?: Reason[]): Promise<void> {
    try {
      const keys = promptKeys || (await this.getAllActivePromptKeys());

      const preloadPromises = keys.map(async key => {
        try {
          await this.getPromptWithVariations(key as Reason);
        } catch (error) {
          Logger.error(`Failed to preload prompt: ${key}`, { error });
        }
      });

      await Promise.all(preloadPromises);
      Logger.info(`Preloaded ${keys.length} prompts into cache`);
    } catch (error) {
      Logger.error('Error preloading prompts into cache', { error });
      throw error;
    }
  }
}
