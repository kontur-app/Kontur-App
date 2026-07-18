"use client";

import { useEffect, useState, useRef } from "react";
import { api, AppSettings } from "@/lib/api";
import { useAppSettings } from "@/lib/settings";
import { Upload, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { refresh } = useAppSettings();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [appName, setAppName] = useState("Kontur");
  const [primaryColor, setPrimaryColor] = useState("#F3EFE6");
  const [secondaryColor, setSecondaryColor] = useState("#1B2A6B");
  const [accentColor, setAccentColor] = useState("#7FE0F5");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.settings.get().then((s) => {
      setSettings(s);
      setAppName(s.app_name);
      setPrimaryColor(s.primary_color);
      setSecondaryColor(s.secondary_color);
      setAccentColor(s.accent_color);
      if (s.logo_url) setLogoPreview(s.logo_url);
    }).catch(() => {});
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const data: Record<string, string> = {
      app_name: appName,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
    };

    if (logoFile) {
      const formData = new FormData();
      formData.append("logo", logoFile);
      Object.entries(data).forEach(([k, v]) => formData.append(k, v));

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const settingsId = settings?.id || 1;
      await fetch(`${API_BASE}/settings/${settingsId}/`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
    } else {
      await api.settings.update(data);
    }

    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: secondaryColor }}>
          Настройки
        </h1>
        <p className="mt-1 text-sm" style={{ color: secondaryColor, opacity: 0.7 }}>
          Настройка внешнего вида приложения
        </p>
      </div>

      {/* Logo */}
      <div className="rounded-xl border-2 p-6" style={{ borderColor: secondaryColor + "15" }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: secondaryColor }}>
          Логотип и название
        </h2>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div
            className="w-32 h-32 rounded-2xl flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden"
            style={{ borderColor: secondaryColor + "30" }}
            onClick={() => fileInputRef.current?.click()}
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center">
                <Upload size={24} className="mx-auto mb-1" style={{ color: secondaryColor, opacity: 0.4 }} />
                <p className="text-xs" style={{ color: secondaryColor, opacity: 0.4 }}>Загрузить</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
              Название приложения
            </label>
            <input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
              style={{ borderColor: secondaryColor + "20", backgroundColor: primaryColor, color: secondaryColor }}
              placeholder="Название"
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="rounded-xl border-2 p-6" style={{ borderColor: secondaryColor + "15" }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: secondaryColor }}>
          Цветовая схема
        </h2>
        <div className="space-y-4">
          {[
            { label: "Основной цвет (фон)", value: primaryColor, onChange: setPrimaryColor },
            { label: "Вторичный цвет (текст, контур)", value: secondaryColor, onChange: setSecondaryColor },
            { label: "Дополнительный цвет", value: accentColor, onChange: setAccentColor },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                  {c.label}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={c.value}
                    onChange={(e) => c.onChange(e.target.value)}
                    className="w-10 h-10 rounded-lg border-2 cursor-pointer"
                    style={{ borderColor: secondaryColor + "20" }}
                  />
                  <input
                    value={c.value}
                    onChange={(e) => c.onChange(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none font-mono"
                    style={{ borderColor: secondaryColor + "20", backgroundColor: primaryColor, color: secondaryColor }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border-2 p-6" style={{ borderColor: secondaryColor + "15" }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: secondaryColor }}>
          Предпросмотр
        </h2>
        <div className="rounded-xl p-6 border-2" style={{ backgroundColor: primaryColor, borderColor: secondaryColor + "30" }}>
          <div className="flex items-center gap-3 mb-4">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                style={{ backgroundColor: accentColor, color: secondaryColor }}
              >
                {appName.charAt(0) || "K"}
              </div>
            )}
            <span className="text-xl font-bold" style={{ color: secondaryColor }}>
              {appName || "Kontur"}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: secondaryColor, color: primaryColor }}>
              Кнопка
            </div>
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium border-2" style={{ borderColor: accentColor, color: secondaryColor }}>
              Вторая кнопка
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
        style={{ backgroundColor: secondaryColor, color: primaryColor }}
      >
        {saved ? (
          <><CheckCircle2 size={18} /> Сохранено!</>
        ) : (
          <><Save size={18} /> Сохранить настройки</>
        )}
      </button>
    </div>
  );
}
