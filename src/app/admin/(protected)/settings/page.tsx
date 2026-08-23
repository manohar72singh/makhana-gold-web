import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { adminAuth } from "@/lib/auth-admin";
import { getSiteSettings } from "@/lib/content";
import { SettingsFormClient } from "./SettingsFormClient";

export default async function AdminSettingsPage() {
  const [session, settings] = await Promise.all([
    adminAuth(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Storefront Settings &amp; Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure announcements, store branding, contact concierge, shipping rules, tax compliance, and social channels.
        </Typography>
      </Box>

      <SettingsFormClient
        initialSettings={settings}
        adminUser={{
          name: session?.user?.name,
          email: session?.user?.email,
          role: session?.user?.role,
        }}
      />
    </>
  );
}
