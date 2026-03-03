import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import {
  VALUE_EXTRACTION_PROMPT,
  SPECIALIST_EXTRACTION_PROMPT,
} from './prompts/system-prompts';

export interface ExtractedValueProfile {
  values: Record<string, number>;
  communicationStyle: Record<string, number>;
  worldview?: Record<string, number>;
  professionalValues?: Record<string, number>;
  requestType?: string;
  requestSummary?: string;
  summaryText: string;
  confidence: number;
}

/**
 * Extracts structured value profiles from AI conversation transcripts.
 * Uses LLM structured output to analyze dialogue and produce numeric scores.
 */
@Injectable()
export class ValueExtractionService {
  private readonly logger = new Logger(ValueExtractionService.name);

  constructor(private readonly llmService: LlmService) {}

  /**
   * Extract a client's value profile from their consultation conversation.
   */
  async extractClientValues(
    conversationText: string,
  ): Promise<ExtractedValueProfile> {
    const prompt = VALUE_EXTRACTION_PROMPT.replace(
      '{conversation}',
      conversationText,
    );

    const result = await this.llmService.structuredOutput({
      messages: [{ role: 'user', content: 'Extract the value profile.' }],
      systemPrompt: prompt,
      temperature: 0.3,
      maxTokens: 2048,
    });

    return this.parseAndNormalize(result.content, 'client');
  }

  /**
   * Extract a specialist's value profile from their interview conversation.
   */
  async extractSpecialistValues(
    conversationText: string,
  ): Promise<ExtractedValueProfile> {
    const prompt = SPECIALIST_EXTRACTION_PROMPT.replace(
      '{conversation}',
      conversationText,
    );

    const result = await this.llmService.structuredOutput({
      messages: [
        { role: 'user', content: 'Extract the specialist value profile.' },
      ],
      systemPrompt: prompt,
      temperature: 0.3,
      maxTokens: 2048,
    });

    return this.parseAndNormalize(result.content, 'specialist');
  }

  /**
   * Parse LLM JSON output and normalize values to [0.0, 1.0] range.
   */
  private parseAndNormalize(
    raw: string,
    type: 'client' | 'specialist',
  ): ExtractedValueProfile {
    let parsed: any;
    try {
      // Strip markdown code block markers if present
      const cleaned = raw.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (error) {
      this.logger.error(`Failed to parse LLM extraction output: ${raw}`);
      return this.getDefaultProfile(type);
    }

    const values = this.normalizeObject(parsed.values || {}, this.getDefaultValues());
    const communicationStyle = this.normalizeObject(
      parsed.communication_style || {},
      this.getDefaultStyle(),
    );
    const worldview = parsed.worldview
      ? this.normalizeObject(parsed.worldview, { pragmatic_vs_idealistic: 0.5, individual_vs_collective: 0.5 })
      : undefined;

    const result: ExtractedValueProfile = {
      values,
      communicationStyle,
      worldview,
      summaryText: parsed.summary_text || 'Profile extracted from conversation.',
      confidence: this.clamp(parsed.confidence || 0.5),
    };

    if (type === 'client') {
      result.requestType = parsed.request_type || 'therapy';
      result.requestSummary = parsed.request_summary || '';
    }

    if (type === 'specialist' && parsed.professional_values) {
      result.professionalValues = this.normalizeObject(
        parsed.professional_values,
        {
          boundaries_strict_vs_flexible: 0.5,
          depth_vs_speed: 0.5,
          evidence_vs_intuition: 0.5,
        },
      );
    }

    return result;
  }

  private normalizeObject(
    source: Record<string, any>,
    defaults: Record<string, number>,
  ): Record<string, number> {
    const result: Record<string, number> = {};
    for (const key of Object.keys(defaults)) {
      const val = source[key];
      result[key] = typeof val === 'number' ? this.clamp(val) : defaults[key];
    }
    return result;
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private getDefaultValues(): Record<string, number> {
    return {
      career: 0.5, family: 0.5, freedom: 0.5, security: 0.5,
      development: 0.5, spirituality: 0.5, relationships: 0.5,
      health: 0.5, creativity: 0.5, justice: 0.5,
    };
  }

  private getDefaultStyle(): Record<string, number> {
    return {
      directive_vs_supportive: 0.5,
      analytical_vs_intuitive: 0.5,
      structured_vs_free: 0.5,
      past_vs_future: 0.5,
    };
  }

  private getDefaultProfile(type: 'client' | 'specialist'): ExtractedValueProfile {
    return {
      values: this.getDefaultValues(),
      communicationStyle: this.getDefaultStyle(),
      summaryText: 'Default profile (extraction failed).',
      confidence: 0.0,
      ...(type === 'client' ? { requestType: 'therapy', requestSummary: '' } : {}),
    };
  }
}
