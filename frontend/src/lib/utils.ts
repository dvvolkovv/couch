import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(date));
}

export function getMatchLabel(score: number): string {
  if (score >= 90) return "Отличное совпадение";
  if (score >= 80) return "Хорошее совпадение";
  if (score >= 70) return "Среднее совпадение";
  return "Возможное совпадение";
}

export function getMatchColor(score: number): string {
  if (score >= 90) return "text-success-600";
  if (score >= 80) return "text-primary-600";
  if (score >= 70) return "text-warning-600";
  return "text-neutral-500";
}

export function getMatchBgColor(score: number): string {
  if (score >= 90) return "bg-gradient-match";
  if (score >= 80) return "bg-primary-500";
  if (score >= 70) return "bg-warning-500";
  return "bg-neutral-400";
}

export function pluralize(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const lastDigit = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (lastDigit > 1 && lastDigit < 5) return forms[1];
  if (lastDigit === 1) return forms[0];
  return forms[2];
}
