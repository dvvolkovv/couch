"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const forgotPasswordSchema = z.object({
  email: z.string().email("Некорректный email"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://138.124.61.221:8080/api/v1";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message || "Произошла ошибка");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-lg bg-success-50 border border-success-200 px-6 py-8">
          <h1 className="text-heading-2 text-neutral-900 mb-4">Письмо отправлено</h1>
          <p className="text-body-md text-neutral-600 mb-6">
            Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля. Проверьте вашу почту.
          </p>
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Вернуться ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-heading-2 text-neutral-900 text-center">Сброс пароля</h1>
      <p className="mt-2 text-body-md text-neutral-600 text-center">
        Введите email, и мы отправим ссылку для сброса пароля
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-body-sm text-error-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-body-sm font-medium text-neutral-700 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="marina@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-caption text-error-600">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Отправка..." : "Отправить ссылку"}
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-neutral-600">
        Вспомнили пароль?{" "}
        <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
          Войти
        </Link>
      </p>
    </div>
  );
}
