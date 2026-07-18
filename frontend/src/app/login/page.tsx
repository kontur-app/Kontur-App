"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useAppSettings } from "@/lib/settings";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { settings } = useAppSettings();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    setLoading(true);
    try {
      await login(username, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
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
            Вход в систему
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ backgroundColor: primaryColor }}>
          <form onSubmit={handleSubmit} className="space-y-5">
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
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none"
                style={{ borderColor: secondaryColor + "30", backgroundColor: primaryColor, color: secondaryColor }}
                placeholder="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none"
                style={{ borderColor: secondaryColor + "30", backgroundColor: primaryColor, color: secondaryColor }}
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: secondaryColor, color: primaryColor }}
            >
              <LogIn size={18} />
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: secondaryColor, opacity: 0.6 }}>
              Нет аккаунта?{" "}
              <Link href="/register" className="font-medium hover:underline" style={{ color: secondaryColor }}>
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
