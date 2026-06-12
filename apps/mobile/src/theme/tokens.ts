export type ThemeMode = "light" | "dark";

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
};

export type TypographyTokens = {
  title: number;
  heading: number;
  body: number;
  caption: number;
  lineHeightTight: number;
  lineHeightNormal: number;
};

export type AppTheme = {
  mode: ThemeMode;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
};

export const lightColors: ColorTokens = {
  background: "#F7F9FC",
  surface: "#FFFFFF",
  surfaceElevated: "#F1F5FA",
  border: "#DDE3EA",
  textPrimary: "#101828",
  textSecondary: "#475467",
  textMuted: "#98A2B3",
  accent: "#2563EB",
  success: "#12B76A",
  warning: "#F79009",
  danger: "#F04438",
  info: "#2563EB"
};

export const darkColors: ColorTokens = {
  background: "#0D1117",
  surface: "#161B22",
  surfaceElevated: "#1F2630",
  border: "#30363D",
  textPrimary: "#F0F6FC",
  textSecondary: "#8B949E",
  textMuted: "#6E7681",
  accent: "#4F8EF7",
  success: "#34C759",
  warning: "#F5A623",
  danger: "#FF5A5F",
  info: "#4F8EF7"
};

const typography: TypographyTokens = {
  title: 30,
  heading: 22,
  body: 16,
  caption: 13,
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5
};

const sharedTheme = {
  typography,
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 44
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18
  }
};

export const themes: Record<ThemeMode, AppTheme> = {
  light: {
    ...sharedTheme,
    mode: "light",
    colors: lightColors
  },
  dark: {
    ...sharedTheme,
    mode: "dark",
    colors: darkColors
  }
};
