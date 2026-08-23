import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";

// MUI is scoped to this (admin) layout only — the storefront stays pure
// Tailwind, so CssBaseline never resets/fights the hand-tuned mockup styles.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <AdminThemeProvider>{children}</AdminThemeProvider>
    </AppRouterCacheProvider>
  );
}
