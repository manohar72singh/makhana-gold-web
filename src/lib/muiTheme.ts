import { createTheme } from "@mui/material/styles";

/**
 * MUI theme mirroring the Tailwind tokens in src/app/globals.css, which in
 * turn mirror stitch_makhana_gold_design_system/premium_editorial_d2c/DESIGN.md.
 * Scoped to the (admin) route group only — the storefront stays pure Tailwind.
 */
export const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#735c00",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#964900",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ba1a1a",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#ff8928",
    },
    background: {
      default: "#fcf9f8",
      paper: "#ffffff",
    },
    text: {
      primary: "#1b1c1c",
      secondary: "#4d4635",
    },
    divider: "#d0c5af",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
    h1: { fontFamily: "var(--font-playfair-display), serif", fontWeight: 700 },
    h2: { fontFamily: "var(--font-playfair-display), serif", fontWeight: 600 },
    h3: { fontFamily: "var(--font-playfair-display), serif", fontWeight: 600 },
    h4: { fontFamily: "var(--font-playfair-display), serif", fontWeight: 600 },
    h5: { fontFamily: "var(--font-playfair-display), serif", fontWeight: 600 },
    h6: { fontFamily: "var(--font-playfair-display), serif", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});
