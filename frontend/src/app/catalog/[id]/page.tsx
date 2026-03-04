"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { formatPrice, getMatchColor, getMatchLabel } from "@/lib/utils";
import type { Specialist } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  PSYCHOLOGIST: "Психолог",
  COACH: "Коуч",
  PSYCHOTHERAPIST: "Психотерапевт",
};

export default function SpecialistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialist = async () => {
      try {
        const { data } = await apiClient.get(`/specialists/${params.id}`);
        setSpecialist(data.data || data);
      } catch {
        setSpecialist(null);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchSpecialist();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-container px-4 py-8 md:px-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="flex gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="mx-auto max-w-container px-4 py-16 text-center">
        <h1 className="text-heading-2 text-neutral-900">Специалист не найден</h1>
        <Button className="mt-6" asChild>
          <Link href="/catalog">Вернуться в каталог</Link>
        </Button>
      </div>
    );
  }

  const initials = `${specialist.firstName[0]}${specialist.lastName?.[0] || ""}`;

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-body-sm text-neutral-600 hover:text-neutral-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </button>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              {specialist.avatarUrl && <AvatarImage src={specialist.avatarUrl} alt={specialist.firstName} />}
              <AvatarFallback className="text-heading-3">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-heading-2 text-neutral-900">
                  {specialist.firstName} {specialist.lastName}
                </h1>
                {specialist.verified && <ShieldCheck className="h-6 w-6 text-primary-500" />}
              </div>
              <p className="text-body-lg text-neutral-700">{TYPE_LABELS[specialist.type] || specialist.type}</p>
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={specialist.averageRating} size="sm" />
                <span className="text-body-md font-medium">{specialist.averageRating.toFixed(1)}</span>
                <span className="text-body-sm text-neutral-500">({specialist.totalReviews} отзывов)</span>
              </div>
              <p className="mt-1 text-body-sm text-neutral-600">
                Опыт: {specialist.experienceYears} лет
              </p>
            </div>
          </div>

          {specialist.bio && (
            <div>
              <h2 className="text-heading-4 text-neutral-900 mb-2">О специалисте</h2>
              <p className="text-body-md text-neutral-700 whitespace-pre-wrap">{specialist.bio}</p>
            </div>
          )}

          <div>
            <h2 className="text-heading-4 text-neutral-900 mb-2">Подходы</h2>
            <div className="flex flex-wrap gap-2">
              {specialist.approaches.map((a) => (
                <Badge key={a} variant="outline">{a}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-heading-4 text-neutral-900 mb-2">Специализации</h2>
            <div className="flex flex-wrap gap-2">
              {specialist.specializations.map((s) => (
                <Badge key={s} variant="default">{s}</Badge>
              ))}
            </div>
          </div>

          {specialist.education && (
            <div>
              <h2 className="text-heading-4 text-neutral-900 mb-2">Образование</h2>
              <p className="text-body-md text-neutral-700">{specialist.education}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card">
            <p className="text-heading-3 text-neutral-900">{formatPrice(specialist.sessionPrice)}</p>
            <p className="text-body-sm text-neutral-600">за сессию {specialist.sessionDuration} мин</p>

            {specialist.matchScore !== undefined && specialist.matchScore !== null && (
              <div className="mt-4 rounded-lg bg-neutral-50 px-4 py-3 text-center">
                <span className={`text-heading-4 font-bold ${getMatchColor(specialist.matchScore)}`}>
                  {specialist.matchScore}%
                </span>
                <p className={`text-caption ${getMatchColor(specialist.matchScore)}`}>
                  {getMatchLabel(specialist.matchScore)}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2 text-body-sm text-neutral-600">
              {specialist.workFormats.map((f) => (
                <span key={f} className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {f === "online" ? "Онлайн" : f === "offline" ? "Офлайн" : "Гибрид"}
                </span>
              ))}
            </div>

            <Button className="w-full mt-6" asChild>
              <Link href={`/catalog/${specialist.id}/book`}>Записаться</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
