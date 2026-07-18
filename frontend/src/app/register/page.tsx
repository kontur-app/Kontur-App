"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useAppSettings } from "@/lib/settings";
import { UserPlus } from "lucide-react";

const directions = [
  { value: "backend", label: "Backend" },
  { value: "frontend", label: "Frontend" },
  { value: "smm", label: "SMM" },
  { value: "design", label: "Дизайн" },
  { value: "mobile", label: "Mobile" },
  { value: "devops", label: "DevOps" },
  { value: "qa", label: "QA" },
  { value: "pm", label: "PM" },
  { value: "other", label: "Другое" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { settings } = useAppSettings();
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    email: "",
    direction: "other",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const appName = settings?.app_name || "Kontur";
  const logoUrl = settings?.logo_url || null;
  const secondaryColor = settings?.secondary_color || "#1B2A6B";
  const accentColor = settings?.accent_color || "#7FE0F5";
  const primaryColor = settings?.primary_color || "#F3EFE6";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password2) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        direction: form.direction,
      });
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: secondaryColor }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt={appName} className="w-16 h-16 rounded-2xl object-contain mx-auto mb-4" />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4"
              style={{ backgroundColor: accentColor, color: secondaryColor }}
            >
              {appName.charAt(0)}
            </div>
          )}
          <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
            {appName}
          </h1>
          <p className="mt-2 text-sm" style={{ color: accentColor }}>
            Создать аккаунт
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ backgroundColor: primaryColor }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{ backgroundColor: "#ef444420", color: "#ef4444" }}
              >
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                Имя пользователя *
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                style={{ borderColor: secondaryColor + "30", backgroundColor: primaryColor, color: secondaryColor }}
                placeholder="username"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                  Имя
                </label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                  style={{ borderColor: secondaryColor + "30", backgroundColor: primaryColor, color: secondaryColor }}
                  placeholder="Иван"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                  Фамилия
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                  style={{ borderColor: secondaryColor + "30", backgroundColor: primaryColor, color: secondaryColor }}
                  placeholder="Иванов"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                style={{ borderColor: secondaryColor + "30", backgroundColor: primaryColor, color: secondaryColor }}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                Направление *
              </label>
              <select
                value={form.direction}
                onChange={(e) => setForm({ ...form, direction: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                style={{ borderColor: secondaryColor + "30", backgroundColor: primaryColor, color: secondaryColor }}
              >
                {directions.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                Пароль *
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                style={{ borderColor: secondaryColor + "30", backgroundColor: primaryColor, color: secondaryColor }}
                placeholder="********"
                required
                minLength={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                Повторите пароль *
              </label>
              <input
                type="password"
                value={form.password2}
                onChange={(e) => setForm({ ...form, password2: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                style={{ borderColor: secondaryColor + "30", backgroundColor: primaryColor, color: secondaryColor }}
                placeholder="********"
                required
                minLength={4}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: secondaryColor, color: primaryColor }}
            >
              <UserPlus size={18} />
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: secondaryColor, opacity: 0.6 }}>
              Уже есть аккаунт?{" "}
              <Link href="/login" className="font-medium hover:underline" style={{ color: secondaryColor }}>
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
