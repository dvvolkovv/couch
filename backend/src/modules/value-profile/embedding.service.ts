import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

const VALUE_LABELS: Record<string, string> = {
  career: 'Career and achievements',
  family: 'Family and close ones',
  freedom: 'Freedom and autonomy',
  security: 'Security and stability',
  development: 'Self-development',
  spirituality: 'Spirituality and meaning',
  relationships: 'Relationships and community',
  health: 'Health and body',
  creativity: 'Creativity and self-expression',
  justice: 'Justice and ethics',
};

/**
 * Service for generating text embeddings using OpenAI's text-embedding-3-small.
 * Embeddings are 1536-dimensional vectors stored in pgvector.
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI | null = null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk-your-key-here') {
      this.openai = new OpenAI({ apiKey });
    }
    this.model = this.configService.get<string>(
      'OPENAI_EMBEDDING_MODEL',
      'text-embedding-3-small',
    );
  }

  /**
   * Generate embedding vector for a value profile.
   * Converts structured profile data to a textual representation,
   * then generates a 1536-dim embedding.
   */
  async generateProfileEmbedding(profile: {
    values: Record<string, number>;
    communicationStyle: Record<string, number>;
    requestSummary?: string;
    requestType?: string;
  }): Promise<number[]> {
    const text = this.profileToText(profile);
    return this.generateEmbedding(text);
  }

  /**
   * Generate embedding for arbitrary text.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      this.logger.warn('OpenAI not configured, returning mock embedding');
      return this.mockEmbedding();
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
      });
      return response.data[0].embedding;
    } catch (error: any) {
      this.logger.error(`Embedding generation failed: ${error.message}`);
      return this.mockEmbedding();
    }
  }

  /**
   * Convert a value profile to a text representation suitable for embedding.
   */
  profileToText(profile: {
    values: Record<string, number>;
    communicationStyle: Record<string, number>;
    requestSummary?: string;
    requestType?: string;
  }): string {
    const parts: string[] = [];

    // High values (>0.7)
    const highValues = Object.entries(profile.values)
      .filter(([, v]) => v > 0.7)
      .sort(([, a], [, b]) => b - a);

    if (highValues.length > 0) {
      parts.push(
        `High values: ${highValues.map(([k]) => VALUE_LABELS[k] || k).join(', ')}`,
      );
    }

    // Low values (<0.3)
    const lowValues = Object.entries(profile.values)
      .filter(([, v]) => v < 0.3)
      .map(([k]) => VALUE_LABELS[k] || k);

    if (lowValues.length > 0) {
      parts.push(`Low priority: ${lowValues.join(', ')}`);
    }

    // Communication style
    const style = profile.communicationStyle;
    if (style.directive_vs_supportive < 0.4) {
      parts.push('Prefers directive style');
    } else if (style.directive_vs_supportive > 0.6) {
      parts.push('Prefers supportive style');
    }

    if (style.analytical_vs_intuitive < 0.4) {
      parts.push('Analytical approach');
    } else if (style.analytical_vs_intuitive > 0.6) {
      parts.push('Intuitive approach');
    }

    if (style.structured_vs_free < 0.4) {
      parts.push('Structured format');
    } else if (style.structured_vs_free > 0.6) {
      parts.push('Free-form format');
    }

    if (style.past_vs_future < 0.4) {
      parts.push('Focus on past and causes');
    } else if (style.past_vs_future > 0.6) {
      parts.push('Focus on future and goals');
    }

    // Request details
    if (profile.requestSummary) {
      parts.push(`Request: ${profile.requestSummary}`);
    }
    if (profile.requestType) {
      parts.push(`Type: ${profile.requestType}`);
    }

    return parts.join('. ');
  }

  /**
   * Generate a deterministic mock embedding for development.
   */
  private mockEmbedding(): number[] {
    const dim = 1536;
    const embedding: number[] = [];
    for (let i = 0; i < dim; i++) {
      embedding.push(Math.sin(i * 0.1) * 0.5);
    }
    // Normalize
    const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
    return embedding.map((v) => v / norm);
  }
}
