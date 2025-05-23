import Logger from '@/lib/logger';
import { PromptVariation } from './prompt-service';

export interface VariationSelectionStrategy {
  selectVariation(variations: PromptVariation[]): PromptVariation;
}

/**
 * Round Robin strategy for selecting variations
 * Maintains state in memory for each prompt key
 */
export class RoundRobinStrategy implements VariationSelectionStrategy {
  private lastSelectedIndexes = new Map<string, number>();

  selectVariation(variations: PromptVariation[]): PromptVariation {
    if (variations.length === 0) {
      throw new Error('No variations available for selection');
    }

    if (variations.length === 1) {
      return variations[0];
    }

    // Create a unique key for this set of variations
    const variationIds = variations
      .map(v => v.id)
      .sort()
      .join(',');
    const currentIndex = this.lastSelectedIndexes.get(variationIds) || 0;

    // Get next index in round robin
    const nextIndex = (currentIndex + 1) % variations.length;

    // Update the stored index
    this.lastSelectedIndexes.set(variationIds, nextIndex);

    const selectedVariation = variations[nextIndex];
    Logger.debug(`Round robin selected variation: ${selectedVariation.id} (index: ${nextIndex})`);

    return selectedVariation;
  }

  /**
   * Reset round robin state for all prompts
   */
  reset(): void {
    this.lastSelectedIndexes.clear();
    Logger.debug('Round robin state reset');
  }

  /**
   * Reset round robin state for specific variation set
   */
  resetForVariations(variations: PromptVariation[]): void {
    const variationIds = variations
      .map(v => v.id)
      .sort()
      .join(',');
    this.lastSelectedIndexes.delete(variationIds);
    Logger.debug(`Round robin state reset for variations: ${variationIds}`);
  }

  /**
   * Get current round robin state (for debugging)
   */
  getState(): Record<string, number> {
    return Object.fromEntries(this.lastSelectedIndexes.entries());
  }
}

/**
 * Weighted random strategy (future implementation)
 * Could weight based on success rate, response time, etc.
 */
export class WeightedRandomStrategy implements VariationSelectionStrategy {
  selectVariation(variations: PromptVariation[]): PromptVariation {
    if (variations.length === 0) {
      throw new Error('No variations available for selection');
    }

    if (variations.length === 1) {
      return variations[0];
    }

    // For now, just implement random selection
    // Future: implement weighted selection based on performance metrics
    const randomIndex = Math.floor(Math.random() * variations.length);
    const selectedVariation = variations[randomIndex];

    Logger.debug(
      `Weighted random selected variation: ${selectedVariation.id} (index: ${randomIndex})`,
    );
    return selectedVariation;
  }
}

/**
 * Performance-based strategy (future implementation)
 * Select variations based on success rate and response time
 */
export class PerformanceBasedStrategy implements VariationSelectionStrategy {
  selectVariation(variations: PromptVariation[]): PromptVariation {
    if (variations.length === 0) {
      throw new Error('No variations available for selection');
    }

    if (variations.length === 1) {
      return variations[0];
    }

    // Calculate performance score for each variation
    const scoredVariations = variations.map(variation => {
      const totalRequests = variation.requestCount;
      const successRate = totalRequests > 0 ? 1 - variation.failureCount / totalRequests : 0.5;
      const avgResponseTime =
        totalRequests > 0 ? variation.totalResponseTime / totalRequests : 1000;

      // Performance score: higher success rate and lower response time is better
      // Normalize response time (assume 1000ms is average)
      const responseTimeScore = Math.max(0, 1 - avgResponseTime / 1000);
      const performanceScore = successRate * 0.7 + responseTimeScore * 0.3;

      return {
        variation,
        score: performanceScore,
      };
    });

    // Sort by performance score (descending)
    scoredVariations.sort((a, b) => b.score - a.score);

    // Select the best performing variation
    const selectedVariation = scoredVariations[0].variation;

    Logger.debug(
      `Performance-based selected variation: ${selectedVariation.id} (score: ${scoredVariations[0].score.toFixed(3)})`,
    );
    return selectedVariation;
  }
}

/**
 * Main variation selector service
 */
export class VariationSelectorService {
  private strategy: VariationSelectionStrategy;

  constructor(strategy?: VariationSelectionStrategy) {
    this.strategy = strategy || new RoundRobinStrategy();
  }

  /**
   * Select a variation using the current strategy
   */
  selectVariation(variations: PromptVariation[]): PromptVariation {
    if (!variations || variations.length === 0) {
      throw new Error('No variations provided for selection');
    }

    try {
      return this.strategy.selectVariation(variations);
    } catch (error) {
      Logger.error('Error selecting variation', { error });
      // Fallback to first variation
      Logger.warn('Falling back to first variation due to selection error');
      return variations[0];
    }
  }

  /**
   * Change the selection strategy
   */
  setStrategy(strategy: VariationSelectionStrategy): void {
    this.strategy = strategy;
    Logger.debug(`Variation selection strategy changed to: ${strategy.constructor.name}`);
  }

  /**
   * Get the current strategy name
   */
  getStrategyName(): string {
    return this.strategy.constructor.name;
  }

  /**
   * Get available strategies
   */
  static getAvailableStrategies(): Record<string, () => VariationSelectionStrategy> {
    return {
      'round-robin': () => new RoundRobinStrategy(),
      'weighted-random': () => new WeightedRandomStrategy(),
      'performance-based': () => new PerformanceBasedStrategy(),
    };
  }
}

// Export a singleton instance
export const variationSelectorService = new VariationSelectorService();
