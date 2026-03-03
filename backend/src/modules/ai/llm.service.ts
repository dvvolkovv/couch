import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmStreamParams {
  messages: LlmMessage[];
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  onToken: (token: string) => void;
}

export interface LlmResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

/**
 * LLM service abstraction layer.
 * Primary: Claude (Anthropic)
 * Fallback: Could be extended with OpenAI GPT-4o-mini.
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private anthropic: Anthropic;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey && apiKey !== 'sk-ant-your-key-here') {
      this.anthropic = new Anthropic({ apiKey });
    }
    this.model = this.configService.get<string>(
      'ANTHROPIC_MODEL',
      'claude-sonnet-4-20250514',
    );
  }

  /**
   * Stream a chat completion from the LLM.
   * Tokens are delivered via the onToken callback for real-time streaming.
   */
  async streamChat(params: LlmStreamParams): Promise<LlmResponse> {
    if (!this.anthropic) {
      return this.mockStreamChat(params);
    }

    try {
      return await this.anthropicStream(params);
    } catch (error: any) {
      this.logger.warn(
        `Primary LLM (Anthropic) failed: ${error.message}. Using mock fallback.`,
      );
      return this.mockStreamChat(params);
    }
  }

  /**
   * Get a structured JSON output from the LLM (no streaming).
   */
  async structuredOutput(params: {
    messages: LlmMessage[];
    systemPrompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
    if (!this.anthropic) {
      return this.mockStructuredOutput(params);
    }

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: params.maxTokens || 4096,
        temperature: params.temperature || 0.3,
        system: params.systemPrompt,
        messages: params.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const textBlock = response.content.find((c) => c.type === 'text');
      return {
        content: textBlock ? textBlock.text : '',
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };
    } catch (error: any) {
      this.logger.warn(`Structured output failed: ${error.message}`);
      return this.mockStructuredOutput(params);
    }
  }

  private async anthropicStream(params: LlmStreamParams): Promise<LlmResponse> {
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = this.anthropic.messages.stream({
      model: this.model,
      max_tokens: params.maxTokens || 1024,
      temperature: params.temperature || 0.7,
      system: params.systemPrompt,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const token = event.delta.text;
        fullContent += token;
        params.onToken(token);
      }
    }

    const finalMessage = await stream.finalMessage();
    inputTokens = finalMessage.usage.input_tokens;
    outputTokens = finalMessage.usage.output_tokens;

    return {
      content: fullContent,
      inputTokens,
      outputTokens,
      model: this.model,
    };
  }

  /**
   * Mock implementation for development without API keys.
   * Generates contextually appropriate responses based on phase.
   */
  private async mockStreamChat(params: LlmStreamParams): Promise<LlmResponse> {
    const lastMessage = params.messages[params.messages.length - 1];
    const isFirstMessage = params.messages.length <= 1;
    let response: string;

    if (isFirstMessage || params.systemPrompt.includes('GREETING')) {
      response =
        'Zdravstvuyte! I am the SoulMate AI consultant. I will help you understand your needs and find a suitable specialist. Our conversation is confidential. Is this your first experience with a psychologist or coach?';
    } else if (params.systemPrompt.includes('SITUATION_EXPLORATION')) {
      response =
        'Thank you for sharing. I understand this is important to you. Could you tell me more about how long you have been experiencing this, and how it affects your daily life?';
    } else if (params.systemPrompt.includes('VALUE_ASSESSMENT')) {
      response =
        'That is very insightful. Let me ask you a reflective question: imagine you have a year of complete freedom, no financial constraints or obligations. How would you spend that year?';
    } else if (params.systemPrompt.includes('FORMAT_PREFERENCES')) {
      response =
        'Thank you for all your answers. Now let us discuss practical preferences. Would you prefer to work online via video call, or in person? And what budget per session would be comfortable for you?';
    } else if (params.systemPrompt.includes('SUMMARY')) {
      response =
        '**Summary of our conversation:**\n\n**Your request:** Personal growth and managing work-life balance\n\n**Recommended specialist:** Psychologist\n\n**Your key values:**\n- Development: high priority\n- Freedom: very important\n- Health: significant focus\n\n**Style preferences:** Supportive, analytical approach\n\n**Format:** Online\n**Budget:** 2000-4000 RUB\n\nIs this accurate?';
    } else {
      response =
        'I understand. Thank you for sharing that with me. Let me consider this carefully. Could you elaborate a bit more on what feels most important to you in this situation?';
    }

    // Simulate streaming
    const words = response.split(' ');
    for (const word of words) {
      params.onToken(word + ' ');
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    return {
      content: response,
      inputTokens: 500,
      outputTokens: response.split(' ').length * 2,
      model: 'mock-model',
    };
  }

  private async mockStructuredOutput(params: {
    messages: LlmMessage[];
    systemPrompt: string;
  }) {
    const isSpecialist = params.systemPrompt.includes('specialist');
    const mockResult = isSpecialist
      ? {
          values: {
            career: 0.7, family: 0.6, freedom: 0.5, security: 0.6,
            development: 0.85, spirituality: 0.3, relationships: 0.7,
            health: 0.65, creativity: 0.5, justice: 0.75,
          },
          communication_style: {
            directive_vs_supportive: 0.6,
            analytical_vs_intuitive: 0.4,
            structured_vs_free: 0.3,
            past_vs_future: 0.5,
          },
          worldview: {
            pragmatic_vs_idealistic: 0.5,
            individual_vs_collective: 0.5,
          },
          professional_values: {
            boundaries_strict_vs_flexible: 0.4,
            depth_vs_speed: 0.7,
            evidence_vs_intuition: 0.4,
          },
          summary_text: 'Experienced specialist focused on deep, evidence-based work with an analytical approach.',
          confidence: 0.75,
        }
      : {
          values: {
            career: 0.75, family: 0.6, freedom: 0.85, security: 0.4,
            development: 0.9, spirituality: 0.2, relationships: 0.65,
            health: 0.7, creativity: 0.55, justice: 0.45,
          },
          communication_style: {
            directive_vs_supportive: 0.3,
            analytical_vs_intuitive: 0.7,
            structured_vs_free: 0.6,
            past_vs_future: 0.5,
          },
          worldview: {
            pragmatic_vs_idealistic: 0.5,
            individual_vs_collective: 0.4,
          },
          request_type: 'therapy',
          request_summary: 'Professional burnout, loss of motivation, difficulty with boundaries at work.',
          summary_text: 'Values freedom and development. Prefers supportive, analytical approach.',
          confidence: 0.8,
        };

    return {
      content: JSON.stringify(mockResult),
      inputTokens: 1000,
      outputTokens: 500,
    };
  }
}
