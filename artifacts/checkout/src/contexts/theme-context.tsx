import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ThemeId, DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "paper" || stored === "parchment") {
        document.documentElement.setAttribute("data-theme", stored);
        return stored as ThemeId;
      }
    } catch {}
    document.documentElement.setAttribute("data-theme", DEFAULT_THEME);
    return DEFAULT_THEME;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
