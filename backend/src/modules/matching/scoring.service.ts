import { Injectable, Logger } from '@nestjs/common';

/**
 * Matching scoring service implements the weighted multi-factor matching formula:
 *
 * MatchScore = w1*ValueMatch + w2*StyleMatch + w3*ApproachMatch + w4*WorldviewMatch + w5*SpecializationRelevance
 *
 * Weights:
 *   w1 = 0.30 (value match)
 *   w2 = 0.20 (communication style)
 *   w3 = 0.25 (approach match)
 *   w4 = 0.15 (worldview)
 *   w5 = 0.10 (specialization relevance)
 */
@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  private readonly WEIGHTS = {
    valueMatch: 0.30,
    styleMatch: 0.20,
    approachMatch: 0.25,
    worldviewMatch: 0.15,
    specializationRelevance: 0.10,
  };

  /**
   * Compute the total match score between a client and specialist profile.
   * Returns a score 0-100 and a breakdown of individual components.
   */
  computeMatchScore(params: {
    clientValues: Record<string, number>;
    clientStyle: Record<string, number>;
    clientWorldview?: Record<string, number>;
    clientRequestType?: string;
    clientRequestSummary?: string;
    specialistValues: Record<string, number>;
    specialistStyle: Record<string, number>;
    specialistWorldview?: Record<string, number>;
    specialistProfessionalValues?: Record<string, number>;
    specialistSpecializations: string[];
    specialistApproaches: string[];
  }): { score: number; breakdown: Record<string, number> } {
    const valueMatch = this.computeValueMatch(
      params.clientValues,
      params.specialistValues,
    );

    const styleMatch = this.computeStyleMatch(
      params.clientStyle,
      params.specialistStyle,
    );

    const approachMatch = this.computeApproachMatch(
      params.clientStyle,
      params.specialistProfessionalValues,
    );

    const worldviewMatch = this.computeWorldviewMatch(
      params.clientWorldview,
      params.specialistWorldview,
    );

    const specializationRelevance = this.computeSpecializationRelevance(
      params.clientRequestType,
      params.clientRequestSummary,
      params.specialistSpecializations,
    );

    const totalScore =
      this.WEIGHTS.valueMatch * valueMatch +
      this.WEIGHTS.styleMatch * styleMatch +
      this.WEIGHTS.approachMatch * approachMatch +
      this.WEIGHTS.worldviewMatch * worldviewMatch +
      this.WEIGHTS.specializationRelevance * specializationRelevance;

    return {
      score: Math.round(totalScore * 100),
      breakdown: {
        valueMatch: Math.round(valueMatch * 100) / 100,
        communicationStyleMatch: Math.round(styleMatch * 100) / 100,
        approachMatch: Math.round(approachMatch * 100) / 100,
        worldviewMatch: Math.round(worldviewMatch * 100) / 100,
        specializationRelevance: Math.round(specializationRelevance * 100) / 100,
      },
    };
  }

  /**
   * Cosine similarity between client and specialist value vectors.
   */
  private computeValueMatch(
    clientValues: Record<string, number>,
    specialistValues: Record<string, number>,
  ): number {
    const keys = Object.keys(clientValues);
    const clientVec = keys.map((k) => clientValues[k] || 0.5);
    const specVec = keys.map((k) => specialistValues[k] || 0.5);
    return this.cosineSimilarity(clientVec, specVec);
  }

  /**
   * Inverted Euclidean distance for communication style matching.
   */
  private computeStyleMatch(
    clientStyle: Record<string, number>,
    specialistStyle: Record<string, number>,
  ): number {
    const keys = [
      'directive_vs_supportive',
      'analytical_vs_intuitive',
      'structured_vs_free',
      'past_vs_future',
    ];

    const sumSquares = keys.reduce((sum, key) => {
      const clientVal = clientStyle[key] ?? 0.5;
      const specVal = specialistStyle[key] ?? 0.5;
      const diff = clientVal - specVal;
      return sum + diff * diff;
    }, 0);

    const maxDistance = Math.sqrt(keys.length);
    const distance = Math.sqrt(sumSquares);
    return 1 - distance / maxDistance;
  }

  /**
   * Approach match evaluates alignment between client preferences
   * and specialist's professional values (depth, evidence, structure).
   */
  private computeApproachMatch(
    clientStyle: Record<string, number>,
    specialistProfValues?: Record<string, number>,
  ): number {
    if (!specialistProfValues) return 0.5;

    let score = 0;
    let factors = 0;

    // Past-oriented client -> deep-working specialist
    const pastFuture = clientStyle.past_vs_future ?? 0.5;
    if (pastFuture < 0.4) {
      score += 1 - Math.abs((specialistProfValues.depth_vs_speed ?? 0.5) - 0.8);
      factors++;
    } else if (pastFuture > 0.6) {
      score += 1 - Math.abs((specialistProfValues.depth_vs_speed ?? 0.5) - 0.3);
      factors++;
    }

    // Analytical client -> evidence-based specialist
    const analytical = clientStyle.analytical_vs_intuitive ?? 0.5;
    if (analytical < 0.4) {
      score +=
        1 - Math.abs((specialistProfValues.evidence_vs_intuition ?? 0.5) - 0.2);
      factors++;
    } else if (analytical > 0.6) {
      score +=
        1 - Math.abs((specialistProfValues.evidence_vs_intuition ?? 0.5) - 0.8);
      factors++;
    }

    // Structure preference alignment
    const structured = clientStyle.structured_vs_free ?? 0.5;
    const boundaries = specialistProfValues.boundaries_strict_vs_flexible ?? 0.5;
    const structDiff = Math.abs(structured - (1 - boundaries));
    score += 1 - structDiff;
    factors++;

    return factors > 0 ? score / factors : 0.5;
  }

  /**
   * Worldview match: average absolute difference, inverted.
   */
  private computeWorldviewMatch(
    clientWorldview?: Record<string, number>,
    specialistWorldview?: Record<string, number>,
  ): number {
    if (!clientWorldview || !specialistWorldview) return 0.5;

    const keys = Object.keys(clientWorldview);
    if (keys.length === 0) return 0.5;

    const diffs = keys.map((k) =>
      Math.abs((clientWorldview[k] ?? 0.5) - (specialistWorldview[k] ?? 0.5)),
    );

    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return 1 - avgDiff;
  }

  /**
   * Specialization relevance: keyword overlap heuristic.
   * In production, use embedding similarity.
   */
  private computeSpecializationRelevance(
    requestType?: string,
    requestSummary?: string,
    specialistSpecs?: string[],
  ): number {
    if (!requestSummary || !specialistSpecs || specialistSpecs.length === 0) {
      return 0.5;
    }

    const summaryLower = requestSummary.toLowerCase();
    const matchCount = specialistSpecs.filter((spec) =>
      summaryLower.includes(spec.toLowerCase()),
    ).length;

    // More matches = higher relevance, normalize
    return Math.min(1, matchCount / Math.max(specialistSpecs.length * 0.3, 1));
  }

  /**
   * Cosine similarity between two numeric vectors.
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
  }
}
