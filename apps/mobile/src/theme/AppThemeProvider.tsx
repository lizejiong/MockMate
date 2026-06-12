import { createContext, PropsWithChildren, useMemo } from "react";
import { useColorScheme } from "react-native";

import { AppTheme, themes } from "./tokens";

export const AppThemeContext = createContext<AppTheme>(themes.light);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();

  const theme = useMemo(() => {
    return colorScheme === "dark" ? themes.dark : themes.light;
  }, [colorScheme]);

  return <AppThemeContext.Provider value={theme}>{children}</AppThemeContext.Provider>;
}
