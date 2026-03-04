"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { formatPrice, getMatchColor } from "@/lib/utils";
import { useConsultationStore } from "@/store/consultation-store";
import type { MatchRecommendation } from "@/types";

export default function MatchingPage() {
  const { conversationId } = useConsultationStore();
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await apiClient.post("/matching/recommendations", {
          conversationId,
          limit: 5,
        });
        const result = data.data || data;
        setRecommendations(result.recommendations || []);
      } catch {
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-container px-4 py-8 md:px-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <div className="text-center mb-8">
        <Sparkles className="mx-auto h-10 w-10 text-primary-500" />
        <h1 className="mt-4 text-heading-1 text-neutral-900">Ваши рекомендации</h1>
        <p className="mt-2 text-body-lg text-neutral-600">
          Специалисты, подобранные по совпадению ценностей
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-body-lg text-neutral-600">
            Рекомендации пока не сгенерированы. Пройдите ИИ-консультацию.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/consultation">Начать консультацию</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div
              key={rec.specialistId}
              className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-heading-5">
                      {rec.specialist.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white text-caption font-bold">
                    #{rec.rank}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-heading-4 text-neutral-900">
                      {rec.specialist.firstName} {rec.specialist.lastName}
                    </h3>
                    <span className={`text-heading-5 font-bold ${getMatchColor(rec.matchScore)}`}>
                      {rec.matchScore}%
                    </span>
                  </div>
                  <p className="text-body-sm text-neutral-600">{rec.specialist.type}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating rating={rec.specialist.averageRating} size="sm" />
                    <span className="text-body-sm">{rec.specialist.averageRating.toFixed(1)}</span>
                    <span className="text-body-sm text-neutral-500">
                      ({rec.specialist.totalReviews})
                    </span>
                    <span className="text-neutral-400">&#8226;</span>
                    <span className="text-body-sm font-medium">{formatPrice(rec.specialist.sessionPrice)}</span>
                  </div>
                </div>
              </div>

              {rec.explanation && (
                <div className="mt-4 rounded-lg bg-primary-50 p-4">
                  <p className="text-body-sm font-medium text-primary-900">{rec.explanation.summary}</p>
                  <ul className="mt-2 space-y-1">
                    {rec.explanation.points.map((point, i) => (
                      <li key={i} className="text-body-sm text-primary-800 flex items-start gap-2">
                        <span className="text-primary-500 mt-1">&#8226;</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/catalog/${rec.specialistId}`}>Подробнее</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/catalog/${rec.specialistId}/book`}>
                    Записаться <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
