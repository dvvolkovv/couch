"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Минимум 8 символов"),
    confirmPassword: z.string().min(8, "Минимум 8 символов"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://138.124.61.221:8080/api/v1";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-lg bg-error-50 border border-error-200 px-6 py-8">
          <h1 className="text-heading-2 text-neutral-900 mb-4">Неверная ссылка</h1>
          <p className="text-body-md text-neutral-600 mb-6">
            Ссылка для сброса пароля недействительна или устарела.
          </p>
          <Link href="/auth/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
            Запросить новую ссылку
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message || "Произошла ошибка");
      }
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка. Попробуйте запросить новую ссылку.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-lg bg-success-50 border border-success-200 px-6 py-8">
          <h1 className="text-heading-2 text-neutral-900 mb-4">Пароль изменён</h1>
          <p className="text-body-md text-neutral-600 mb-6">
            Ваш пароль успешно изменён. Перенаправляем на страницу входа...
          </p>
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-heading-2 text-neutral-900 text-center">Новый пароль</h1>
      <p className="mt-2 text-body-md text-neutral-600 text-center">
        Введите новый пароль для вашего аккаунта
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-body-sm text-error-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="newPassword" className="block text-body-sm font-medium text-neutral-700 mb-1">
            Новый пароль
          </label>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="mt-1 text-caption text-error-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-body-sm font-medium text-neutral-700 mb-1">
            Подтвердите пароль
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-caption text-error-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Сохранение..." : "Изменить пароль"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
