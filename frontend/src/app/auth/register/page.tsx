"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

const registerSchema = z.object({
  firstName: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, error } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        role: "CLIENT",
      });
      setSuccess(true);
    } catch {
      // error is set in store
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-heading-2 text-neutral-900">Проверьте почту</h1>
        <p className="mt-4 text-body-md text-neutral-600">
          Мы отправили письмо с подтверждением на ваш email. Перейдите по ссылке в письме, чтобы активировать аккаунт.
        </p>
        <Button className="mt-8" asChild>
          <Link href="/auth/login">Перейти ко входу</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-heading-2 text-neutral-900 text-center">Регистрация</h1>
      <p className="mt-2 text-body-md text-neutral-600 text-center">
        Создайте аккаунт для подбора специалиста
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-body-sm text-error-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="firstName" className="block text-body-sm font-medium text-neutral-700 mb-1">
            Имя
          </label>
          <Input
            id="firstName"
            type="text"
            placeholder="Марина"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="mt-1 text-caption text-error-600">{errors.firstName.message}</p>
          )}
        </div>

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

        <div>
          <label htmlFor="password" className="block text-body-sm font-medium text-neutral-700 mb-1">
            Пароль
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Минимум 8 символов"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-caption text-error-600">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </Button>

        <p className="text-caption text-neutral-500 text-center">
          Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности и условиями использования
        </p>
      </form>

      <p className="mt-6 text-center text-body-sm text-neutral-600">
        Уже есть аккаунт?{" "}
        <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
          Войти
        </Link>
      </p>
    </div>
  );
}
