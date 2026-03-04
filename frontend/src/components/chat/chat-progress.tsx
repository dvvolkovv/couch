"use client";

import { CheckCircle2, Circle, ArrowRight, HelpCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { ConsultationPhase } from "@/types";

interface ChatProgressProps {
  currentPhase: ConsultationPhase;
  className?: string;
}

const PHASE_ORDER: ConsultationPhase[] = [
  "GREETING",
  "SITUATION_EXPLORATION",
  "VALUE_ASSESSMENT",
  "FORMAT_PREFERENCES",
  "SUMMARY",
  "CONFIRMATION",
];

const PHASE_LABELS: Record<ConsultationPhase, string> = {
  GREETING: "\u0417\u043D\u0430\u043A\u043E\u043C\u0441\u0442\u0432\u043E",
  SITUATION_EXPLORATION: "\u0412\u0430\u0448 \u0437\u0430\u043F\u0440\u043E\u0441",
  VALUE_ASSESSMENT: "\u0426\u0435\u043D\u043D\u043E\u0441\u0442\u043D\u044B\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044C",
  FORMAT_PREFERENCES: "\u041F\u0440\u0435\u0434\u043F\u043E\u0447\u0442\u0435\u043D\u0438\u044F",
  PROFESSIONAL_BACKGROUND: "\u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043E\u043F\u044B\u0442",
  WORK_STYLE: "\u0421\u0442\u0438\u043B\u044C \u0440\u0430\u0431\u043E\u0442\u044B",
  CASE_QUESTIONS: "\u041A\u0435\u0439\u0441\u043E\u0432\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B",
  SUMMARY: "\u0418\u0442\u043E\u0433\u0438",
  CONFIRMATION: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435",
};

export function ChatProgress({ currentPhase, className }: ChatProgressProps) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const progressPercent =
    currentIndex < 0
      ? 100
      : Math.round(((currentIndex + 0.5) / PHASE_ORDER.length) * 100);

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-body-sm font-medium text-neutral-900">
            {"\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441"}
          </span>
          <span className="text-caption text-neutral-600">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} />
      </div>

      <nav aria-label="\u0428\u0430\u0433\u0438 \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u0438">
        <ol className="space-y-2">
          {PHASE_ORDER.map((phase, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = phase === currentPhase;
            const isPending = index > currentIndex;

            return (
              <li
                key={phase}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-body-sm transition-colors",
                  isCurrent && "bg-primary-50 text-primary-700 font-medium",
                  isCompleted && "text-success-600",
                  isPending && "text-neutral-500"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : isCurrent ? (
                  <ArrowRight className="h-4 w-4 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {index + 1}. {PHASE_LABELS[phase]}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="border-t border-neutral-300 pt-4 space-y-3">
        <p className="text-caption text-neutral-600">
          {"\u041F\u0440\u0438\u043C\u0435\u0440\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F: ~12 \u043C\u0438\u043D"}
        </p>

        <div className="flex items-start gap-2 text-caption text-neutral-600">
          <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            {"\u0412\u0430\u0448\u0438 \u0434\u0430\u043D\u043D\u044B\u0435 \u0432 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438. "}
            <a href="/privacy" className="text-primary-700 hover:underline">
              {"\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435"}
            </a>
          </span>
        </div>

        <button className="flex items-center gap-2 text-caption text-primary-700 hover:underline">
          <HelpCircle className="h-3.5 w-3.5" />
          {"\u0417\u0430\u0447\u0435\u043C \u043D\u0443\u0436\u043D\u0430 \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044F?"}
        </button>
      </div>
    </div>
  );
}
