export type ThemeId = "paper" | "parchment" | "terminal";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  preview: {
    bg: string;
    primary: string;
    ink: string;
    marginLine: string;
    ruleLine: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: "paper",
    name: "Paper",
    description: "Soft cream with a teal-sage accent. Cool and restful.",
    preview: {
      bg: "hsl(42 28% 97%)",
      primary: "hsl(180 22% 40%)",
      ink: "hsl(210 16% 22%)",
      marginLine: "rgba(195,90,80,0.42)",
      ruleLine: "rgba(160,130,100,0.30)",
    },
  },
  {
    id: "parchment",
    name: "Parchment",
    description: "Warm aged paper with amber accents. Cozy and grounded.",
    preview: {
      bg: "hsl(40 42% 93%)",
      primary: "hsl(28 58% 44%)",
      ink: "hsl(20 28% 18%)",
      marginLine: "rgba(155,95,45,0.42)",
      ruleLine: "rgba(130,95,50,0.22)",
    },
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Amber phosphor on black. IBM PS/2, circa 1990.",
    preview: {
      bg: "hsl(28 22% 5%)",
      primary: "hsl(42 100% 60%)",
      ink: "hsl(40 96% 62%)",
      marginLine: "rgba(255, 176, 0, 0.60)",
      ruleLine: "rgba(220, 145, 0, 0.13)",
    },
  },
];

export const DEFAULT_THEME: ThemeId = "paper";
export const THEME_STORAGE_KEY = "checkout-theme";

export const VALID_THEMES: ThemeId[] = ["paper", "parchment", "terminal"];
