"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api, AppSettings } from "@/lib/api";

interface AppSettingsContextType {
  settings: AppSettings | null;
  refresh: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: null,
  refresh: async () => {},
});

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const refresh = useCallback(async () => {
    try {
      const s = await api.settings.get();
      setSettings(s);
    } catch {}
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    api.settings.get().then((s) => {
      if (!controller.signal.aborted) setSettings(s);
    }).catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <AppSettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
