"use client";

import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SpecialistCard } from "@/components/specialists/specialist-card";
import { SpecialistFilters } from "@/components/specialists/specialist-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { CatalogFilters, SpecialistListItem } from "@/types";

// Demo data
const DEMO_SPECIALISTS: SpecialistListItem[] = [
  {
    id: "spec-1",
    firstName: "\u0415\u043B\u0435\u043D\u0430",
    lastName: "\u0418.",
    type: "PSYCHOLOGIST",
    verified: true,
    avatarUrl: undefined,
    specializations: ["\u0422\u0440\u0435\u0432\u043E\u0436\u043D\u043E\u0441\u0442\u044C", "\u0412\u044B\u0433\u043E\u0440\u0430\u043D\u0438\u0435"],
    approaches: ["\u041A\u041F\u0422", "\u0413\u0435\u0448\u0442\u0430\u043B\u044C\u0442"],
    sessionPrice: 4000,
    workFormats: ["online"],
    averageRating: 4.8,
    totalReviews: 127,
    matchScore: 92,
    nearestAvailableSlot: "2026-03-05T14:00:00+03:00",
    topValues: ["\u0420\u0430\u0437\u0432\u0438\u0442\u0438\u0435", "\u041E\u0441\u043E\u0437\u043D\u0430\u043D\u043D\u043E\u0441\u0442\u044C", "\u0411\u0430\u043B\u0430\u043D\u0441"],
  },
  {
    id: "spec-2",
    firstName: "\u041E\u043B\u044C\u0433\u0430",
    lastName: "\u0421.",
    type: "PSYCHOLOGIST",
    verified: true,
    avatarUrl: undefined,
    specializations: ["\u041E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u044F", "\u0421\u0430\u043C\u043E\u043E\u0446\u0435\u043D\u043A\u0430"],
    approaches: ["\u042D\u043A\u0437\u0438\u0441\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u0430\u044F"],
    sessionPrice: 3500,
    workFormats: ["online"],
    averageRating: 4.6,
    totalReviews: 84,
    matchScore: 87,
    nearestAvailableSlot: "2026-03-06T10:00:00+03:00",
    topValues: ["\u042D\u043C\u043F\u0430\u0442\u0438\u044F", "\u0413\u043B\u0443\u0431\u0438\u043D\u0430"],
  },
  {
    id: "spec-3",
    firstName: "\u0418\u0432\u0430\u043D",
    lastName: "\u041F.",
    type: "COACH",
    verified: true,
    avatarUrl: undefined,
    specializations: ["\u041A\u0430\u0440\u044C\u0435\u0440\u0430", "\u041B\u0438\u0434\u0435\u0440\u0441\u0442\u0432\u043E"],
    approaches: ["\u041A\u043E\u0443\u0447\u0438\u043D\u0433", "\u041A\u041F\u0422"],
    sessionPrice: 5000,
    workFormats: ["online", "hybrid"],
    averageRating: 4.9,
    totalReviews: 56,
    matchScore: 78,
    nearestAvailableSlot: "2026-03-04T16:00:00+03:00",
    topValues: ["\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430"],
  },
  {
    id: "spec-4",
    firstName: "\u0410\u043D\u043D\u0430",
    lastName: "\u041A.",
    type: "PSYCHOLOGIST",
    verified: true,
    avatarUrl: undefined,
    specializations: ["\u0412\u044B\u0433\u043E\u0440\u0430\u043D\u0438\u0435", "\u0421\u0442\u0440\u0435\u0441\u0441"],
    approaches: ["\u041A\u041F\u0422"],
    sessionPrice: 3500,
    workFormats: ["online"],
    averageRating: 4.9,
    totalReviews: 28,
    matchScore: 95,
    nearestAvailableSlot: "2026-03-04T16:00:00+03:00",
    topValues: ["\u0420\u0430\u0437\u0432\u0438\u0442\u0438\u0435", "\u0421\u0432\u043E\u0431\u043E\u0434\u0430"],
  },
  {
    id: "spec-5",
    firstName: "\u041C\u0430\u0440\u0438\u044F",
    lastName: "\u0412.",
    type: "PSYCHOTHERAPIST",
    verified: false,
    avatarUrl: undefined,
    specializations: ["\u0414\u0435\u043F\u0440\u0435\u0441\u0441\u0438\u044F", "\u0422\u0440\u0435\u0432\u043E\u0436\u043D\u043E\u0441\u0442\u044C"],
    approaches: ["\u041F\u0441\u0438\u0445\u043E\u0430\u043D\u0430\u043B\u0438\u0437"],
    sessionPrice: 6000,
    workFormats: ["offline"],
    averageRating: 4.7,
    totalReviews: 42,
    matchScore: 71,
    nearestAvailableSlot: "2026-03-07T11:00:00+03:00",
    topValues: ["\u0413\u043B\u0443\u0431\u0438\u043D\u0430", "\u041F\u0440\u0438\u043D\u044F\u0442\u0438\u0435"],
  },
  {
    id: "spec-6",
    firstName: "\u0414\u043C\u0438\u0442\u0440\u0438\u0439",
    lastName: "\u041B.",
    type: "COACH",
    verified: true,
    avatarUrl: undefined,
    specializations: ["\u041C\u043E\u0442\u0438\u0432\u0430\u0446\u0438\u044F", "\u0426\u0435\u043B\u0438"],
    approaches: ["\u041A\u043E\u0443\u0447\u0438\u043D\u0433"],
    sessionPrice: 4500,
    workFormats: ["online"],
    averageRating: 4.5,
    totalReviews: 31,
    matchScore: 82,
    nearestAvailableSlot: "2026-03-05T09:00:00+03:00",
    topValues: ["\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435", "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442"],
  },
];

const SORT_OPTIONS = [
  { value: "match_score", label: "\u041F\u043E \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u044E" },
  { value: "rating", label: "\u041F\u043E \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0443" },
  { value: "price_asc", label: "\u041F\u043E \u0446\u0435\u043D\u0435 \u2191" },
  { value: "price_desc", label: "\u041F\u043E \u0446\u0435\u043D\u0435 \u2193" },
  { value: "reviews", label: "\u041F\u043E \u043E\u0442\u0437\u044B\u0432\u0430\u043C" },
];

export default function CatalogPage() {
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match_score");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Apply filters to demo data
  const filteredSpecialists = DEMO_SPECIALISTS.filter((s) => {
    if (
      filters.type &&
      filters.type.length > 0 &&
      !filters.type.includes(s.type)
    )
      return false;
    if (filters.priceMin && s.sessionPrice < filters.priceMin) return false;
    if (filters.priceMax && s.sessionPrice > filters.priceMax) return false;
    if (
      filters.format &&
      filters.format !== "all" &&
      !s.workFormats.includes(filters.format as any)
    )
      return false;
    if (filters.ratingMin && s.averageRating < filters.ratingMin) return false;
    if (
      searchQuery &&
      !`${s.firstName} ${s.lastName} ${s.specializations.join(" ")} ${s.approaches.join(" ")}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "match_score":
        return (b.matchScore || 0) - (a.matchScore || 0);
      case "rating":
        return b.averageRating - a.averageRating;
      case "price_asc":
        return a.sessionPrice - b.sessionPrice;
      case "price_desc":
        return b.sessionPrice - a.sessionPrice;
      case "reviews":
        return b.totalReviews - a.totalReviews;
      default:
        return 0;
    }
  });

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-1 text-neutral-900">
        {"\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u043E\u0432"}
      </h1>

      <div className="mt-6 flex gap-8">
        {/* Desktop filters sidebar */}
        <aside className="hidden md:block w-72 shrink-0">
          <div className="sticky top-24">
            <SpecialistFilters filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search + Sort bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder={"\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0438\u043C\u0435\u043D\u0438 \u0438\u043B\u0438 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-400 bg-white py-2.5 pl-10 pr-4 text-body-sm text-neutral-950 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                aria-label="\u041F\u043E\u0438\u0441\u043A \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u043E\u0432"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <Button
                variant="secondary"
                size="sm"
                className="md:hidden"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {"\u0424\u0438\u043B\u044C\u0442\u0440\u044B"}
              </Button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-body-sm text-neutral-600 hidden sm:inline"
                >
                  {"\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430:"}
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-neutral-400 bg-white px-3 py-2 text-body-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="mt-4 text-body-sm text-neutral-600">
            {"\u041D\u0430\u0439\u0434\u0435\u043D\u043E: "}{filteredSpecialists.length}{" \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u043E\u0432"}
          </p>

          {/* Cards grid */}
          <div className="mt-6 grid gap-4 md:gap-6 lg:grid-cols-2">
            {filteredSpecialists.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} />
            ))}
          </div>

          {/* Empty state */}
          {filteredSpecialists.length === 0 && (
            <div className="mt-16 text-center">
              <Search className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-4 text-heading-4 text-neutral-900">
                {"\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u043E\u0432 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E"}
              </h3>
              <p className="mt-2 text-body-sm text-neutral-600 max-w-md mx-auto">
                {"\u041F\u043E \u0432\u0430\u0448\u0438\u043C \u043A\u0440\u0438\u0442\u0435\u0440\u0438\u044F\u043C \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u043E\u0432 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0440\u0430\u0441\u0448\u0438\u0440\u0438\u0442\u044C \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D \u0446\u0435\u043D \u0438\u043B\u0438 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0444\u0438\u043B\u044C\u0442\u0440\u044B."}
              </p>
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => {
                  setFilters({});
                  setSearchQuery("");
                }}
              >
                {"\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0444\u0438\u043B\u044C\u0442\u0440\u044B"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters sheet */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="\u0424\u0438\u043B\u044C\u0442\u0440\u044B"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading-4 text-neutral-900">{"\u0424\u0438\u043B\u044C\u0442\u0440\u044B"}</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                aria-label="\u0417\u0430\u043A\u0440\u044B\u0442\u044C"
              >
                <X className="h-6 w-6 text-neutral-600" />
              </button>
            </div>
            <SpecialistFilters filters={filters} onChange={setFilters} />
            <div className="mt-6 sticky bottom-0 bg-white pt-4 pb-2 border-t border-neutral-300">
              <Button
                className="w-full"
                onClick={() => setShowMobileFilters(false)}
              >
                {"\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C "}{filteredSpecialists.length}{" \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u043E\u0432"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
