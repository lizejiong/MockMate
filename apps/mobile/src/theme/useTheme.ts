import { useContext } from "react";

import { AppThemeContext } from "./AppThemeProvider";

export function useTheme() {
  return useContext(AppThemeContext);
}
