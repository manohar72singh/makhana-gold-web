"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { muiTheme } from "@/lib/muiTheme";

// The theme object (createTheme() output) contains functions (transitions.create,
// alpha/lighten/darken, etc.) that cannot cross the Server -> Client Component
// serialization boundary as a prop. Creating/using it entirely inside this
// "use client" module avoids ever passing it down from a Server Component.
export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
