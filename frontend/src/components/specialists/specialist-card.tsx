"use client";

import Link from "next/link";
import { ShieldCheck, Star, Clock, MapPin } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { ValueTags } from "@/components/ui/value-tags";
import { cn, formatPrice, getMatchColor, getMatchLabel, formatShortDate } from "@/lib/utils";
import type { SpecialistListItem } from "@/types";

const TYPE_LABELS = {
  PSYCHOLOGIST: "\u041F\u0441\u0438\u0445\u043E\u043B\u043E\u0433",
  COACH: "\u041A\u043E\u0443\u0447",
  PSYCHOTHERAPIST: "\u041F\u0441\u0438\u0445\u043E\u0442\u0435\u0440\u0430\u043F\u0435\u0432\u0442",
};

interface SpecialistCardProps {
  specialist: SpecialistListItem;
  className?: string;
}

export function SpecialistCard({ specialist, className }: SpecialistCardProps) {
  const {
    id,
    firstName,
    lastName,
    type,
    verified,
    avatarUrl,
    specializations,
    approaches,
    sessionPrice,
    workFormats,
    averageRating,
    totalReviews,
    matchScore,
    nearestAvailableSlot,
    topValues,
  } = specialist;

  const initials = `${firstName[0]}${lastName?.[0] || ""}`;
  const formatLabel =
    workFormats.includes("online")
      ? "\u041E\u043D\u043B\u0430\u0439\u043D"
      : workFormats.includes("offline")
        ? "\u041E\u0444\u043B\u0430\u0439\u043D"
        : "\u0413\u0438\u0431\u0440\u0438\u0434";

  return (
    <Card
      className={cn(
        "p-4 md:p-6 hover:shadow-card-hover transition-all duration-200",
        className
      )}
    >
      {/* Top section: avatar + info */}
      <div className="flex gap-4">
        <Link href={`/catalog/${id}`} className="shrink-0" aria-hidden="true" tabIndex={-1}>
          <Avatar className="h-16 w-16 md:h-20 md:w-20">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
            )}
            <AvatarFallback className="text-heading-5">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <Link
              href={`/catalog/${id}`}
              className="text-heading-5 text-neutral-900 hover:text-primary-700 transition-colors truncate"
            >
              {firstName} {lastName}
            </Link>
            {verified && (
              <ShieldCheck
                className="h-5 w-5 shrink-0 text-primary-500"
                aria-label="\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D"
              />
            )}
          </div>
          <p className="text-body-sm text-neutral-700">
            {TYPE_LABELS[type]}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {approaches.slice(0, 3).map((a) => (
              <Badge key={a} variant="outline" className="text-[11px]">
                {a}
              </Badge>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-body-sm font-medium text-neutral-800">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-caption text-neutral-500">
              ({totalReviews})
            </span>
          </div>
        </div>
      </div>

      {/* Match score */}
      {matchScore !== undefined && matchScore !== null && (
        <div className="mt-4">
          <div className="flex items-center gap-3 rounded-lg bg-neutral-50 px-4 py-2.5">
            <div className="flex-1">
              <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-match transition-all duration-700"
                  style={{ width: `${matchScore}%` }}
                />
              </div>
            </div>
            <span
              className={cn(
                "text-heading-6 font-bold whitespace-nowrap",
                getMatchColor(matchScore)
              )}
            >
              {matchScore}%
            </span>
          </div>
          <p
            className={cn(
              "mt-1 text-center text-caption font-medium",
              getMatchColor(matchScore)
            )}
          >
            {getMatchLabel(matchScore)}
          </p>
        </div>
      )}

      {/* Details */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-body-sm text-neutral-700">
        <span className="font-semibold text-neutral-900">
          {formatPrice(sessionPrice)}
        </span>
        <span className="text-neutral-400">&bull;</span>
        <span>{formatLabel}</span>
        {nearestAvailableSlot && (
          <>
            <span className="text-neutral-400">&bull;</span>
            <span className="flex items-center gap-1 text-success-600">
              <Clock className="h-3.5 w-3.5" />
              {formatShortDate(nearestAvailableSlot)}
            </span>
          </>
        )}
      </div>

      {/* Value tags */}
      {topValues && topValues.length > 0 && (
        <div className="mt-3">
          <ValueTags tags={topValues} variant="secondary" limit={3} />
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <Button variant="secondary" size="sm" className="flex-1" asChild>
          <Link href={`/catalog/${id}`}>{"\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435"}</Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/catalog/${id}/book`}>{"\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C"}</Link>
        </Button>
      </div>
    </Card>
  );
}
