import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { LlmService, LlmMessage } from './llm.service';
import { CrisisDetectorService } from './crisis-detector.service';
import { ValueExtractionService, ExtractedValueProfile } from './value-extraction.service';
import { ValueProfileService } from '../value-profile/value-profile.service';
import {
  CLIENT_BASE_PROMPT,
  PHASE_PROMPTS,
  SPECIALIST_BASE_PROMPT,
  SPECIALIST_PHASE_PROMPTS,
  CRISIS_RESPONSE,
} from './prompts/system-prompts';

/** Phase flow for client consultations */
const CLIENT_PHASES = [
  'GREETING',
  'SITUATION_EXPLORATION',
  'VALUE_ASSESSMENT',
  'FORMAT_PREFERENCES',
  'SUMMARY',
  'CONFIRMATION',
] as const;

/** Phase flow for specialist interviews */
const SPECIALIST_PHASES = [
  'GREETING',
  'PROFESSIONAL_BACKGROUND',
  'CASE_QUESTIONS',
  'WORK_STYLE',
  'VALUE_ASSESSMENT',
  'SUMMARY',
  'CONFIRMATION',
] as const;

/** Min/max exchanges per phase (client) */
const CLIENT_PHASE_LIMITS: Record<string, { min: number; max: number }> = {
  GREETING: { min: 2, max: 3 },
  SITUATION_EXPLORATION: { min: 4, max: 8 },
  VALUE_ASSESSMENT: { min: 5, max: 8 },
  FORMAT_PREFERENCES: { min: 2, max: 4 },
  SUMMARY: { min: 1, max: 2 },
  CONFIRMATION: { min: 1, max: 1 },
};

const SPECIALIST_PHASE_LIMITS: Record<string, { min: number; max: number }> = {
  GREETING: { min: 1, max: 2 },
  PROFESSIONAL_BACKGROUND: { min: 5, max: 8 },
  CASE_QUESTIONS: { min: 4, max: 6 },
  WORK_STYLE: { min: 3, max: 5 },
  VALUE_ASSESSMENT: { min: 4, max: 6 },
  SUMMARY: { min: 1, max: 2 },
  CONFIRMATION: { min: 1, max: 1 },
};

interface ConversationState {
  exchangeCount: number;
  phaseExchangeCount: number;
  extractedData: Record<string, any>;
}

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly llmService: LlmService,
    private readonly crisisDetector: CrisisDetectorService,
    private readonly valueExtraction: ValueExtractionService,
    private readonly valueProfileService: ValueProfileService,
  ) {}

  /**
   * Create a new AI consultation/interview session.
   */
  async createConsultation(userId: string, type: string) {
    // Check consultation limits for free users
    if (type === 'CLIENT_CONSULTATION') {
      const sub = await this.prisma.clientSubscription.findUnique({
        where: { userId },
      });
      if (sub && sub.plan === 'free' && sub.aiConsultationsUsed >= sub.aiConsultationsLimit) {
        throw new UnprocessableEntityException(
          'AI consultation limit reached. Upgrade to premium for unlimited consultations.',
        );
      }
    }

    const initialPhase =
      type === 'SPECIALIST_INTERVIEW' ? 'GREETING' : 'GREETING';

    const conversation = await this.prisma.aIConversation.create({
      data: {
        userId,
        type: type as any,
        status: 'ACTIVE',
        phase: initialPhase as any,
        stateJson: {
          exchangeCount: 0,
          phaseExchangeCount: 0,
          extractedData: {},
        },
      },
    });

    // Generate initial greeting
    const systemPrompt = this.buildSystemPrompt(type, 'GREETING', 0);
    const greetingResponse = await this.llmService.streamChat({
      messages: [],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 300,
      onToken: () => {}, // No streaming for initial message
    });

    const initialMessage = await this.prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: greetingResponse.content,
        phase: 'GREETING',
        tokensUsed: greetingResponse.outputTokens,
      },
    });

    // Update token counts
    await this.prisma.aIConversation.update({
      where: { id: conversation.id },
      data: {
        totalTokens: greetingResponse.inputTokens + greetingResponse.outputTokens,
        llmModel: greetingResponse.model,
      },
    });

    return {
      conversationId: conversation.id,
      type: conversation.type,
      status: conversation.status,
      phase: conversation.phase,
      wsUrl: `wss://api.soulmate.ru/ws/ai-chat?conversationId=${conversation.id}`,
      initialMessage: {
        id: initialMessage.id,
        role: initialMessage.role,
        content: initialMessage.content,
        phase: initialMessage.phase,
        createdAt: initialMessage.createdAt,
      },
    };
  }

  /**
   * Get a consultation with message history.
   */
  async getConsultation(userId: string, conversationId: string) {
    const conversation = await this.prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Consultation not found');
    }

    const result: any = {
      conversationId: conversation.id,
      type: conversation.type,
      status: conversation.status,
      phase: conversation.phase,
      startedAt: conversation.startedAt,
      completedAt: conversation.completedAt,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        phase: m.phase,
        metadata: m.metadata,
        createdAt: m.createdAt,
      })),
    };

    if (conversation.extractedValues) {
      result.result = conversation.extractedValues;
    }

    return result;
  }

  /**
   * List user's consultations.
   */
  async listConsultations(userId: string) {
    const conversations = await this.prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        startedAt: true,
        completedAt: true,
      },
    });

    return conversations.map((c) => ({
      conversationId: c.id,
      type: c.type,
      status: c.status,
      startedAt: c.startedAt,
      completedAt: c.completedAt,
    }));
  }

  /**
   * Process a user message in an active conversation.
   * This is the core AI interaction handler.
   *
   * @returns The AI response along with any phase transitions or events
   */
  async processMessage(
    userId: string,
    conversationId: string,
    content: string,
    onToken: (token: string) => void,
  ): Promise<{
    messageId: string;
    content: string;
    phase: string;
    phaseChanged: boolean;
    isCrisis: boolean;
    isComplete: boolean;
    extractedProfile?: ExtractedValueProfile;
  }> {
    const conversation = await this.prisma.aIConversation.findFirst({
      where: { id: conversationId, userId, status: 'ACTIVE' },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      throw new NotFoundException(
        'Active consultation not found',
      );
    }

    // Level 1: Keyword-based crisis detection
    const crisisMarkers = this.crisisDetector.detectKeywords(content);
    if (crisisMarkers.length > 0) {
      return this.handleCrisis(
        conversation,
        userId,
        content,
        crisisMarkers,
        onToken,
      );
    }

    // Save user message
    const userMessage = await this.prisma.aIMessage.create({
      data: {
        conversationId,
        role: 'user',
        content,
        phase: conversation.phase,
      },
    });

    // Get conversation state
    const state = (conversation.stateJson as unknown as ConversationState) || {
      exchangeCount: 0,
      phaseExchangeCount: 0,
      extractedData: {},
    };
    state.exchangeCount++;
    state.phaseExchangeCount++;

    // Determine if phase should transition
    const { shouldTransition, nextPhase } = this.evaluatePhaseTransition(
      conversation.type,
      conversation.phase,
      state.phaseExchangeCount,
    );

    let currentPhase = conversation.phase;
    if (shouldTransition && nextPhase) {
      currentPhase = nextPhase as unknown as typeof conversation.phase;
      state.phaseExchangeCount = 0;
    }

    // Build system prompt for current phase
    const systemPrompt = this.buildSystemPrompt(
      conversation.type,
      currentPhase,
      state.phaseExchangeCount,
    );

    // Build message history for LLM
    const llmMessages: LlmMessage[] = conversation.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    llmMessages.push({ role: 'user', content });

    // Stream LLM response
    const llmResponse = await this.llmService.streamChat({
      messages: llmMessages,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
      onToken,
    });

    // Save assistant message
    const assistantMessage = await this.prisma.aIMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: llmResponse.content,
        phase: currentPhase as any,
        tokensUsed: llmResponse.outputTokens,
      },
    });

    // Update conversation state
    const updateData: any = {
      phase: currentPhase as any,
      stateJson: state,
      totalTokens: {
        increment: llmResponse.inputTokens + llmResponse.outputTokens,
      },
    };

    let isComplete = false;
    let extractedProfile: ExtractedValueProfile | undefined;

    // Check if conversation is complete (CONFIRMATION phase confirmed)
    if (currentPhase === 'CONFIRMATION' && this.isConfirmation(content)) {
      isComplete = true;
      updateData.status = 'COMPLETED';
      updateData.completedAt = new Date();

      // Run value extraction pipeline
      extractedProfile = await this.runExtractionPipeline(
        conversation.id,
        userId,
        conversation.type,
        [...conversation.messages, userMessage],
      );

      if (extractedProfile) {
        updateData.extractedValues = extractedProfile;
      }
    }

    await this.prisma.aIConversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    return {
      messageId: assistantMessage.id,
      content: llmResponse.content,
      phase: currentPhase,
      phaseChanged: shouldTransition,
      isCrisis: false,
      isComplete,
      extractedProfile,
    };
  }

  /**
   * Confirm consultation results and trigger matching.
   */
  async confirmConsultation(
    userId: string,
    conversationId: string,
    corrections?: { requestSummary?: string; preferences?: Record<string, any> },
  ) {
    const conversation = await this.prisma.aIConversation.findFirst({
      where: { id: conversationId, userId, status: 'COMPLETED' },
    });

    if (!conversation) {
      throw new NotFoundException('Completed consultation not found');
    }

    // Apply corrections if provided
    if (corrections) {
      const currentValues = conversation.extractedValues as any;
      if (corrections.requestSummary) {
        currentValues.request_summary = corrections.requestSummary;
      }
      if (corrections.preferences) {
        currentValues.preferences = {
          ...(currentValues.preferences || {}),
          ...corrections.preferences,
        };
      }
      await this.prisma.aIConversation.update({
        where: { id: conversationId },
        data: { extractedValues: currentValues },
      });
    }

    // Increment consultation usage for free users
    await this.prisma.clientSubscription
      .update({
        where: { userId },
        data: { aiConsultationsUsed: { increment: 1 } },
      })
      .catch(() => {
        // Subscription may not exist, ignore
      });

    return {
      confirmed: true,
      nextStep: 'matching',
      matchingUrl: '/api/v1/matching/recommendations',
    };
  }

  private async handleCrisis(
    conversation: any,
    userId: string,
    userContent: string,
    markers: string[],
    onToken: (token: string) => void,
  ) {
    // Save user message
    const userMessage = await this.prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: userContent,
        phase: conversation.phase,
      },
    });

    // Create crisis alert
    const severity = this.crisisDetector.assessSeverity(markers);
    await this.crisisDetector.createCrisisAlert({
      conversationId: conversation.id,
      userId,
      markers,
      messageExcerpt: userContent,
      severity,
    });

    // Stream the fixed crisis response
    const crisisText = CRISIS_RESPONSE;
    const words = crisisText.split(' ');
    for (const word of words) {
      onToken(word + ' ');
    }

    // Save crisis response
    const assistantMessage = await this.prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: crisisText,
        phase: conversation.phase,
        metadata: { crisis: true, markers },
      },
    });

    return {
      messageId: assistantMessage.id,
      content: crisisText,
      phase: conversation.phase,
      phaseChanged: false,
      isCrisis: true,
      isComplete: false,
    };
  }

  /**
   * Build the full system prompt for a given conversation type and phase.
   */
  private buildSystemPrompt(
    type: string,
    phase: string,
    exchangeNumber: number,
  ): string {
    const isSpecialist = type === 'SPECIALIST_INTERVIEW';
    const basePrompt = isSpecialist
      ? SPECIALIST_BASE_PROMPT
      : CLIENT_BASE_PROMPT;
    const phasePrompt = isSpecialist
      ? SPECIALIST_PHASE_PROMPTS[phase] || ''
      : PHASE_PROMPTS[phase] || '';

    return basePrompt
      .replace('{phase}', phase)
      .replace('{exchangeNumber}', exchangeNumber.toString())
      .replace('{specialistType}', '')
      + '\n\n' + phasePrompt;
  }

  /**
   * Evaluate whether the conversation should transition to the next phase.
   */
  private evaluatePhaseTransition(
    type: string,
    currentPhase: string,
    exchangeCount: number,
  ): { shouldTransition: boolean; nextPhase: string | null } {
    const phases = type === 'SPECIALIST_INTERVIEW' ? SPECIALIST_PHASES : CLIENT_PHASES;
    const limits = type === 'SPECIALIST_INTERVIEW' ? SPECIALIST_PHASE_LIMITS : CLIENT_PHASE_LIMITS;

    const phaseLimit = limits[currentPhase];
    if (!phaseLimit) {
      return { shouldTransition: false, nextPhase: null };
    }

    // Transition if we hit the maximum exchanges for this phase
    if (exchangeCount >= phaseLimit.max) {
      const currentIndex = phases.indexOf(currentPhase as any);
      if (currentIndex >= 0 && currentIndex < phases.length - 1) {
        return {
          shouldTransition: true,
          nextPhase: phases[currentIndex + 1],
        };
      }
    }

    return { shouldTransition: false, nextPhase: null };
  }

  /**
   * Run the value extraction pipeline after conversation completion.
   * Extracts values, generates embeddings, and saves the profile.
   */
  private async runExtractionPipeline(
    conversationId: string,
    userId: string,
    conversationType: string,
    messages: any[],
  ): Promise<ExtractedValueProfile | undefined> {
    try {
      // Build conversation text
      const conversationText = messages
        .filter((m) => m.role !== 'system')
        .map((m) => `${m.role === 'user' ? 'Client' : 'Consultant'}: ${m.content}`)
        .join('\n\n');

      // Extract values
      const isSpecialist = conversationType === 'SPECIALIST_INTERVIEW';
      const profile = isSpecialist
        ? await this.valueExtraction.extractSpecialistValues(conversationText)
        : await this.valueExtraction.extractClientValues(conversationText);

      // Save to ValueProfile
      await this.valueProfileService.upsertProfile(userId, {
        ownerType: isSpecialist ? 'SPECIALIST' : 'CLIENT',
        values: profile.values,
        communicationStyle: profile.communicationStyle,
        worldview: profile.worldview,
        professionalValues: profile.professionalValues,
        requestType: profile.requestType,
        requestSummary: profile.requestSummary,
        summaryText: profile.summaryText,
        conversationId,
      });

      this.logger.log(
        `Value profile extracted for user ${userId} from conversation ${conversationId} (confidence: ${profile.confidence})`,
      );

      return profile;
    } catch (error: any) {
      this.logger.error(
        `Value extraction failed for conversation ${conversationId}: ${error.message}`,
      );
      return undefined;
    }
  }

  /**
   * Simple heuristic to detect if user is confirming the summary.
   */
  private isConfirmation(content: string): boolean {
    const confirmPhrases = [
      'da', 'yes', 'confirm', 'correct', 'right', 'ok', 'okay',
      'yes', 'agree', 'that is right', 'everything is correct',
    ];
    const normalized = content.toLowerCase().trim();
    return (
      confirmPhrases.some((p) => normalized.includes(p)) ||
      normalized.length < 20
    );
  }
}
