import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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
 * Primary: DeepSeek (OpenAI-compatible API)
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private openai: OpenAI | null = null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com',
      });
      this.logger.log('DeepSeek LLM initialized');
    } else {
      this.logger.warn('DEEPSEEK_API_KEY not set, using mock fallback');
    }
    this.model = this.configService.get<string>(
      'DEEPSEEK_MODEL',
      'deepseek-chat',
    );
  }

  /**
   * Stream a chat completion from the LLM.
   * Tokens are delivered via the onToken callback for real-time streaming.
   */
  async streamChat(params: LlmStreamParams): Promise<LlmResponse> {
    if (!this.openai) {
      return this.mockStreamChat(params);
    }

    try {
      return await this.deepseekStream(params);
    } catch (error: any) {
      this.logger.warn(
        `DeepSeek LLM failed: ${error.message}. Using mock fallback.`,
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
    if (!this.openai) {
      return this.mockStructuredOutput(params);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        max_tokens: params.maxTokens || 4096,
        temperature: params.temperature || 0.3,
        messages: [
          { role: 'system', content: params.systemPrompt },
          ...params.messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ],
      });

      const content = response.choices[0]?.message?.content || '';
      return {
        content,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      };
    } catch (error: any) {
      this.logger.warn(`Structured output failed: ${error.message}`);
      return this.mockStructuredOutput(params);
    }
  }

  private async deepseekStream(params: LlmStreamParams): Promise<LlmResponse> {
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = await this.openai!.chat.completions.create({
      model: this.model,
      max_tokens: params.maxTokens || 1024,
      temperature: params.temperature || 0.7,
      stream: true,
      stream_options: { include_usage: true },
      messages: [
        { role: 'system', content: params.systemPrompt },
        ...params.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullContent += delta;
        params.onToken(delta);
      }
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens || 0;
        outputTokens = chunk.usage.completion_tokens || 0;
      }
    }

    return {
      content: fullContent,
      inputTokens,
      outputTokens,
      model: this.model,
    };
  }

  /**
   * Mock implementation for development without API keys.
   */
  private async mockStreamChat(params: LlmStreamParams): Promise<LlmResponse> {
    const isFirstMessage = params.messages.length <= 1;
    let response: string;

    if (isFirstMessage || params.systemPrompt.includes('GREETING')) {
      response =
        'Здравствуйте! Я AI-консультант платформы Hearty. Я помогу вам разобраться в ваших потребностях и подобрать подходящего специалиста. Наш разговор конфиденциален. Скажите, у вас есть опыт работы с психологом или коучем?';
    } else if (params.systemPrompt.includes('SITUATION_EXPLORATION')) {
      response =
        'Спасибо, что поделились. Я понимаю, что это важно для вас. Расскажите подробнее, как давно вы замечаете эту ситуацию и как она влияет на вашу повседневную жизнь?';
    } else if (params.systemPrompt.includes('VALUE_ASSESSMENT')) {
      response =
        'Это очень ценное наблюдение. Позвольте задать вам проективный вопрос: представьте, что у вас есть год полной свободы — никаких финансовых ограничений или обязательств. Как бы вы провели этот год?';
    } else if (params.systemPrompt.includes('FORMAT_PREFERENCES')) {
      response =
        'Спасибо за все ваши ответы. Давайте обсудим практические предпочтения. Вам удобнее работать онлайн по видеосвязи или очно? И какой бюджет за сессию был бы для вас комфортным?';
    } else if (params.systemPrompt.includes('SUMMARY')) {
      response =
        '**Итог нашей беседы:**\n\n**Ваш запрос:** Личностный рост и управление балансом работы и жизни\n\n**Рекомендуемый специалист:** Психолог\n\n**Ваши ключевые ценности:**\n- Развитие: высокий приоритет\n- Свобода: очень важна\n- Здоровье: значительный фокус\n\n**Предпочтения по стилю:** Поддерживающий, аналитический подход\n\n**Формат:** Онлайн\n**Бюджет:** 2000-4000 руб.\n\nВсё верно?';
    } else {
      response =
        'Я понимаю. Спасибо, что поделились этим. Позвольте мне обдумать это. Не могли бы вы рассказать подробнее, что для вас сейчас кажется наиболее важным в этой ситуации?';
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
          summary_text: 'Опытный специалист, ориентированный на глубокую, доказательную работу с аналитическим подходом.',
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
          request_summary: 'Профессиональное выгорание, потеря мотивации, сложности с границами на работе.',
          summary_text: 'Ценит свободу и развитие. Предпочитает поддерживающий, аналитический подход.',
          confidence: 0.8,
        };

    return {
      content: JSON.stringify(mockResult),
      inputTokens: 1000,
      outputTokens: 500,
    };
  }
}
