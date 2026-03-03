import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Two-level crisis detection:
 * Level 1: Keyword detection (instant, in-app)
 * Level 2: LLM analysis (via system prompt in every call)
 */

const CRISIS_KEYWORDS_RU = [
  // Suicide
  'покончить с собой', 'не хочу жить', 'суицид', 'самоубийство',
  'убить себя', 'конец жизни', 'нет смысла жить', 'лучше бы меня не было',
  'прыгну', 'повешусь', 'таблетки выпить', 'хочу умереть',
  // Self-harm
  'режу себя', 'причиняю себе боль', 'бью себя',
  // Violence
  'бьет меня', 'избивает', 'насилует', 'угрожает убить',
  'боюсь за свою жизнь',
  // Acute state
  'голоса в голове', 'не могу отличить реальность',
  'паранойя', 'слежка за мной',
];

const CRISIS_KEYWORDS_EN = [
  'kill myself', 'suicide', 'want to die', 'end my life',
  'no reason to live', 'self-harm', 'cutting myself',
  'hurt myself', 'beating me', 'domestic violence',
];

@Injectable()
export class CrisisDetectorService {
  private readonly logger = new Logger(CrisisDetectorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Level 1: Instant keyword-based crisis detection.
   * Returns detected crisis markers or empty array.
   */
  detectKeywords(message: string): string[] {
    const normalized = message.toLowerCase();
    const allKeywords = [...CRISIS_KEYWORDS_RU, ...CRISIS_KEYWORDS_EN];

    const found = allKeywords.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );

    return found;
  }

  /**
   * Create a crisis alert record in the database and notify admins.
   */
  async createCrisisAlert(params: {
    conversationId: string;
    userId: string;
    markers: string[];
    messageExcerpt?: string;
    severity: 'high' | 'critical';
  }): Promise<void> {
    const alert = await this.prisma.crisisAlert.create({
      data: {
        conversationId: params.conversationId,
        userId: params.userId,
        severity: params.severity,
        markers: params.markers,
        messageExcerpt: params.messageExcerpt
          ? params.messageExcerpt.substring(0, 200)
          : null,
        status: 'new',
      },
    });

    this.logger.error(
      `CRISIS ALERT created: ${alert.id} for user ${params.userId}, severity: ${params.severity}, markers: ${params.markers.join(', ')}`,
    );

    // Update conversation status
    await this.prisma.aIConversation.update({
      where: { id: params.conversationId },
      data: { crisisDetected: true, status: 'CRISIS' },
    });

    // In production: send Telegram notification, email to admin
  }

  /**
   * Determine severity based on detected markers.
   */
  assessSeverity(markers: string[]): 'high' | 'critical' {
    const criticalPatterns = [
      'суицид', 'самоубийство', 'убить себя', 'покончить с собой',
      'хочу умереть', 'kill myself', 'suicide',
      'угрожает убить', 'насилует',
    ];

    const hasCritical = markers.some((marker) =>
      criticalPatterns.some((p) => marker.includes(p)),
    );

    return hasCritical ? 'critical' : 'high';
  }
}
