// src/contexts/SiteSettingsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const DEFAULT = {
  menu_soal: true,
  menu_materi: true,
  menu_paket: true,
  menu_latihan: true,
};

const SiteSettingsContext = createContext(DEFAULT);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT);

  useEffect(() => {
    api.get("/settings").then(r => setSettings({ ...DEFAULT, ...(r || {}) })).catch(() => {});
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext) ?? DEFAULT;
}

export { DEFAULT as SITE_SETTINGS_DEFAULT };
