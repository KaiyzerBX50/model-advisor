import { createContext, useContext } from "react";

// --- Theme context ---

export const ThemeContext = createContext<{ dark: boolean }>({ dark: true });

export function useTheme() {
  return useContext(ThemeContext);
}

// --- Simple dark/light toggle ---

export function t(dark: boolean, darkCls: string, lightCls: string): string {
  return dark ? darkCls : lightCls;
}

// --- Declarative theme class selector ---

interface ThemeClasses {
  dark: string;
  light: string;
}

export function themeClass(
  dark: boolean,
  active: boolean,
  activeClasses: ThemeClasses,
  inactiveClasses: ThemeClasses,
): string {
  const classes = active ? activeClasses : inactiveClasses;
  return dark ? classes.dark : classes.light;
}

// --- Score color utility ---

const SCORE_COLORS = [
  { min: 80, cls: "bg-emerald-500" },
  { min: 60, cls: "bg-blue-500" },
  { min: 40, cls: "bg-amber-500" },
  { min: 0, cls: "bg-zinc-500" },
] as const;

export function scoreColor(score: number): string {
  return SCORE_COLORS.find(c => score >= c.min)!.cls;
}
