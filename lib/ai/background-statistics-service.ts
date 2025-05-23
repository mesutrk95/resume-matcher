// lib/ai/background-statistics-service.ts
import { db } from '@/lib/db';
import { AIRequestStatus } from '@prisma/client';
import Logger from '@/lib/logger';

export interface VariationStatisticsUpdate {
  variationId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  responseTime: number;
  success: boolean;
}

export interface AIRequestData {
  variationId: string;
  userId: string | null;
  contentId: string;
  clientId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  responseTime: number;
  status: AIRequestStatus;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export class BackgroundStatisticsService {
  /**
   * Update variation statistics in background (fire and forget)
   */
  updateVariationStatistics(update: VariationStatisticsUpdate): void {
    // Fire and forget - don't await this
    this.performVariationUpdate(update).catch(error => {
      Logger.error('Error updating variation statistics', {
        error,
        variationId: update.variationId,
      });
    });
  }

  /**
   * Create AI request record in background (fire and forget)
   */
  createAIRequest(requestData: AIRequestData): void {
    // Fire and forget - don't await this
    this.performAIRequestCreate(requestData).catch(error => {
      Logger.error('Error creating AI request record', {
        error,
        variationId: requestData.variationId,
      });
    });
  }

  /**
   * Perform the actual variation statistics update using SQL
   */
  private async performVariationUpdate(update: VariationStatisticsUpdate): Promise<void> {
    const requestCount = 1;
    const failureCount = update.success ? 0 : 1;

    // Use raw SQL to perform atomic updates and avoid race conditions
    await db.$executeRaw`
      UPDATE "AIPromptVariation" 
      SET 
        "requestCount" = "requestCount" + ${requestCount},
        "failureCount" = "failureCount" + ${failureCount},
        "totalTokens" = "totalTokens" + ${update.totalTokens},
        "promptTokens" = "promptTokens" + ${update.promptTokens},
        "completionTokens" = "completionTokens" + ${update.completionTokens},
        "totalResponseTime" = "totalResponseTime" + ${update.responseTime}
      WHERE "id" = ${update.variationId}
    `;

    Logger.debug(
      `Updated statistics for variation ${update.variationId}: success=${update.success}, tokens=${update.totalTokens}, responseTime=${update.responseTime}ms`,
    );
  }

  /**
   * Perform the actual AI request creation
   */
  private async performAIRequestCreate(requestData: AIRequestData): Promise<void> {
    await db.aIRequest.create({
      data: {
        variationId: requestData.variationId,
        userId: requestData.userId,
        contentId: requestData.contentId,
        clientId: requestData.clientId,
        promptTokens: requestData.promptTokens,
        completionTokens: requestData.completionTokens,
        totalTokens: requestData.totalTokens,
        responseTime: requestData.responseTime,
        status: requestData.status,
        errorMessage: requestData.errorMessage,
        metadata: requestData.metadata,
      },
    });

    Logger.debug(`Created AI request record for variation ${requestData.variationId}`);
  }
}

// Export a singleton instance
export const backgroundStatisticsService = new BackgroundStatisticsService();
