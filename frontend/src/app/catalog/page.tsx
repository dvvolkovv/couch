"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SpecialistCard } from "@/components/specialists/specialist-card";
import { SpecialistFilters } from "@/components/specialists/specialist-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { CatalogFilters, SpecialistListItem } from "@/types";

const SORT_OPTIONS = [
  { value: "match_score", label: "По совпадению" },
  { value: "rating", label: "По рейтингу" },
  { value: "price_asc", label: "По цене ↑" },
  { value: "price_desc", label: "По цене ↓" },
  { value: "reviews", label: "По отзывам" },
];

export default function CatalogPage() {
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match_score");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [specialists, setSpecialists] = useState<SpecialistListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchSpecialists = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.type?.length) params.type = filters.type.join(",");
      if (filters.priceMin) params.priceMin = String(filters.priceMin);
      if (filters.priceMax) params.priceMax = String(filters.priceMax);
      if (filters.format && filters.format !== "all") params.format = filters.format;
      if (filters.ratingMin) params.ratingMin = String(filters.ratingMin);
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sortBy = sortBy;

      const response = await apiClient.get("/catalog/specialists", { params });
      console.log("Catalog API response:", JSON.stringify(response.data).slice(0, 200));
      const data = response.data;
      const items = data.data || data;
      setSpecialists(Array.isArray(items) ? items : []);
      setTotal(data.pagination?.total ?? (Array.isArray(items) ? items.length : 0));
    } catch (err) {
      console.error("Catalog fetch error:", err);
      setSpecialists([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, sortBy]);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-1 text-neutral-900">Каталог специалистов</h1>

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
                placeholder="Поиск по имени или специализации..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-400 bg-white py-2.5 pl-10 pr-4 text-body-sm text-neutral-950 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                aria-label="Поиск специалистов"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="md:hidden"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Фильтры
              </Button>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-body-sm text-neutral-600 hidden sm:inline">
                  Сортировка:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-neutral-400 bg-white px-3 py-2 text-body-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <p className="mt-4 text-body-sm text-neutral-600">
            Найдено: {total} специалистов
          </p>

          {/* Loading skeletons */}
          {loading ? (
            <div className="mt-6 grid gap-4 md:gap-6 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-neutral-300 bg-white p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 md:gap-6 lg:grid-cols-2">
                {specialists.map((specialist) => (
                  <SpecialistCard key={specialist.id} specialist={specialist} />
                ))}
              </div>

              {specialists.length === 0 && (
                <div className="mt-16 text-center">
                  <Search className="mx-auto h-12 w-12 text-neutral-400" />
                  <h3 className="mt-4 text-heading-4 text-neutral-900">Специалистов не найдено</h3>
                  <p className="mt-2 text-body-sm text-neutral-600 max-w-md mx-auto">
                    По вашим критериям специалистов не найдено. Попробуйте расширить диапазон цен или изменить фильтры.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-6"
                    onClick={() => { setFilters({}); setSearchQuery(""); }}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Фильтры">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading-4 text-neutral-900">Фильтры</h2>
              <button onClick={() => setShowMobileFilters(false)} aria-label="Закрыть">
                <X className="h-6 w-6 text-neutral-600" />
              </button>
            </div>
            <SpecialistFilters filters={filters} onChange={setFilters} />
            <div className="mt-6 sticky bottom-0 bg-white pt-4 pb-2 border-t border-neutral-300">
              <Button className="w-full" onClick={() => setShowMobileFilters(false)}>
                Показать результаты
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
