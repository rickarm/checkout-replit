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
    name: "PS/2",
    description: "WordPerfect blue on white. Doogie Howser's journal, circa 1989.",
    preview: {
      bg: "hsl(240 100% 25%)",
      primary: "hsl(0 0% 100%)",
      ink: "hsl(0 0% 100%)",
      marginLine: "rgba(85, 85, 255, 0.70)",
      ruleLine: "rgba(100, 100, 255, 0.20)",
    },
  },
];

export const DEFAULT_THEME: ThemeId = "paper";
export const THEME_STORAGE_KEY = "checkout-theme";

export const VALID_THEMES: ThemeId[] = ["paper", "parchment", "terminal"];
