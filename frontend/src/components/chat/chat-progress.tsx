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
  GREETING: "Знакомство",
  SITUATION_EXPLORATION: "Ваш запрос",
  VALUE_ASSESSMENT: "Ценностный профиль",
  FORMAT_PREFERENCES: "Предпочтения",
  PROFESSIONAL_BACKGROUND: "Профессиональный опыт",
  WORK_STYLE: "Стиль работы",
  CASE_QUESTIONS: "Кейсовые вопросы",
  SUMMARY: "Итоги",
  CONFIRMATION: "Подтверждение",
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
            {"Прогресс"}
          </span>
          <span className="text-caption text-neutral-600">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} />
      </div>

      <nav aria-label="Шаги консультации">
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
          {"Примерное время: ~12 мин"}
        </p>

        <div className="flex items-start gap-2 text-caption text-neutral-600">
          <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            {"Ваши данные в безопасности. "}
            <a href="/privacy" className="text-primary-700 hover:underline">
              {"Подробнее"}
            </a>
          </span>
        </div>

        <button className="flex items-center gap-2 text-caption text-primary-700 hover:underline">
          <HelpCircle className="h-3.5 w-3.5" />
          {"Зачем нужна консультация?"}
        </button>
      </div>
    </div>
  );
}
