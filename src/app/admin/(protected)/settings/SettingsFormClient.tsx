"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import StoreIcon from "@mui/icons-material/StorefrontOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import ShareIcon from "@mui/icons-material/ShareOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlineOutlined";
import PaymentIcon from "@mui/icons-material/PaymentOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Chip from "@mui/material/Chip";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import LockResetIcon from "@mui/icons-material/LockResetOutlined";
import { updateSiteSettingsAction } from "./actions";
import { changeAdminPasswordAction } from "./password-actions";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
  adminUser?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export function SettingsFormClient({ initialSettings, adminUser }: SettingsFormProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordState, setPasswordState] = useState<{
    submitting: boolean;
    success: boolean;
    error: string | null;
  }>({ submitting: false, success: false, error: null });
  const [settings, setSettings] = useState<Record<string, string>>({
    // Announcement Bar
    announcement_enabled: initialSettings.announcement_enabled ?? "true",
    announcement_badge: initialSettings.announcement_badge ?? "Special Privilege:",
    announcement_text: initialSettings.announcement_text ?? "Get 15% OFF your first harvest",
    announcement_coupon: initialSettings.announcement_coupon ?? "GOLDEN15",
    announcement_shipping_text: initialSettings.announcement_shipping_text ?? "🚚 Free Shipping on Orders ₹500+",
    announcement_link: initialSettings.announcement_link ?? "/shop",

    // Store Branding & Support
    store_name: initialSettings.store_name ?? "Makhana Gold",
    store_tagline: initialSettings.store_tagline ?? "Artisanal Heritage • Modern Wellness",
    store_description:
      initialSettings.store_description ??
      "Artisanal Heritage • Modern Wellness. Sourced responsibly from generational wetland farms in Bihar, slow-roasted to golden crispness.",
    support_email: initialSettings.support_email ?? "mmakhanaltd@gmail.com",
    support_phone: initialSettings.support_phone ?? "+91 60016 84216",
    support_whatsapp: initialSettings.support_whatsapp ?? "916001684216",
    support_hours: initialSettings.support_hours ?? "Mon — Sat from 9:30 AM to 6:30 PM IST",
    studio_address:
      initialSettings.studio_address ??
      "Makhana Gold Pvt. Ltd., Connaught Place, New Delhi, 110001, India",

    // Commerce & Shipping
    free_shipping_threshold: initialSettings.free_shipping_threshold ?? "500",
    standard_shipping_rate: initialSettings.standard_shipping_rate ?? "60",
    fssai_license: initialSettings.fssai_license ?? "10021022000123",
    gstin_number: initialSettings.gstin_number ?? "10AAACM1234F1Z5",

    // Social Media & Marketing
    social_instagram: initialSettings.social_instagram ?? "https://instagram.com",
    social_whatsapp: initialSettings.social_whatsapp ?? "https://wa.me/916001684216",
    social_facebook: initialSettings.social_facebook ?? "https://facebook.com",
    social_twitter: initialSettings.social_twitter ?? "https://twitter.com",
    newsletter_coupon: initialSettings.newsletter_coupon ?? "GOLDEN15",
    newsletter_title: initialSettings.newsletter_title ?? "The Gold Privilege Club",
    newsletter_description:
      initialSettings.newsletter_description ??
      "Join for 15% off your first order, private festive pre-sales, and curated culinary recipes.",
  });

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSavedSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateSiteSettingsAction(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 5000);
  };

  const handlePasswordChange = async () => {
    setPasswordState({ submitting: true, success: false, error: null });
    const result = await changeAdminPasswordAction(passwordFields);
    if (result.success) {
      setPasswordState({ submitting: false, success: true, error: null });
      setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordState((prev) => ({ ...prev, success: false })), 5000);
    } else {
      setPasswordState({ submitting: false, success: false, error: result.error || "Something went wrong." });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {savedSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Store settings successfully saved! All storefront pages have been updated in real time.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, idx) => setTabIndex(idx)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "grey.50" }}
        >
          <Tab icon={<CampaignIcon />} iconPosition="start" label="Announcement Bar" sx={{ fontWeight: 600 }} />
          <Tab icon={<StoreIcon />} iconPosition="start" label="Branding &amp; Support" sx={{ fontWeight: 600 }} />
          <Tab icon={<LocalShippingIcon />} iconPosition="start" label="Shipping &amp; Legal" sx={{ fontWeight: 600 }} />
          <Tab icon={<PaymentIcon />} iconPosition="start" label="Payment Gateway" sx={{ fontWeight: 600 }} />
          <Tab icon={<ShareIcon />} iconPosition="start" label="Social &amp; Newsletter" sx={{ fontWeight: 600 }} />
          <Tab icon={<PersonIcon />} iconPosition="start" label="Admin Profile" sx={{ fontWeight: 600 }} />
        </Tabs>

        {/* TAB 0: Announcement Bar */}
        {tabIndex === 0 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Top Announcement Bar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Control the prominent royal notification ribbon at the very top of all storefront pages.
            </Typography>

            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    name="announcement_enabled"
                    value="true"
                    checked={settings.announcement_enabled === "true"}
                    onChange={(e) => handleChange("announcement_enabled", e.target.checked ? "true" : "false")}
                  />
                }
                label="Enable Top Announcement Bar"
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Highlight Badge"
                    name="announcement_badge"
                    value={settings.announcement_badge}
                    onChange={(e) => handleChange("announcement_badge", e.target.value)}
                    fullWidth
                    helperText="e.g. Special Privilege:"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    label="Announcement Text"
                    name="announcement_text"
                    value={settings.announcement_text}
                    onChange={(e) => handleChange("announcement_text", e.target.value)}
                    fullWidth
                    helperText="e.g. Get 15% OFF your first harvest"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Promo Coupon Pill"
                    name="announcement_coupon"
                    value={settings.announcement_coupon}
                    onChange={(e) => handleChange("announcement_coupon", e.target.value)}
                    fullWidth
                    helperText="e.g. GOLDEN15"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    label="Free Shipping Notice"
                    name="announcement_shipping_text"
                    value={settings.announcement_shipping_text}
                    onChange={(e) => handleChange("announcement_shipping_text", e.target.value)}
                    fullWidth
                    helperText="e.g. 🚚 Free Shipping on Orders ₹500+"
                  />
                </Grid>
              </Grid>

              <TextField
                label="Banner Link URL"
                name="announcement_link"
                value={settings.announcement_link}
                onChange={(e) => handleChange("announcement_link", e.target.value)}
                fullWidth
                helperText="Destination URL when customer clicks the announcement bar"
              />
            </Stack>
          </Box>
        )}

        {/* TAB 1: Branding & Support */}
        {tabIndex === 1 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Store Branding &amp; Concierge Contact
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure public-facing brand details, customer care email, phone numbers, and studio address.
            </Typography>

            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Store Brand Name"
                    name="store_name"
                    value={settings.store_name}
                    onChange={(e) => handleChange("store_name", e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Brand Tagline"
                    name="store_tagline"
                    value={settings.store_tagline}
                    onChange={(e) => handleChange("store_tagline", e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                label="Footer Brand Description / Story"
                name="store_description"
                value={settings.store_description}
                onChange={(e) => handleChange("store_description", e.target.value)}
                multiline
                rows={2}
                fullWidth
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Support Concierge Email"
                    name="support_email"
                    value={settings.support_email}
                    onChange={(e) => handleChange("support_email", e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Customer Support Phone"
                    name="support_phone"
                    value={settings.support_phone}
                    onChange={(e) => handleChange("support_phone", e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="WhatsApp Chat Number (with country code)"
                    name="support_whatsapp"
                    value={settings.support_whatsapp}
                    onChange={(e) => handleChange("support_whatsapp", e.target.value)}
                    fullWidth
                    helperText="e.g. 916001684216 (without + sign)"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Operating / Support Hours"
                    name="support_hours"
                    value={settings.support_hours}
                    onChange={(e) => handleChange("support_hours", e.target.value)}
                    fullWidth
                    helperText="e.g. Mon — Sat from 9:30 AM to 6:30 PM IST"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Experience Studio / Registered Address"
                    name="studio_address"
                    value={settings.studio_address}
                    onChange={(e) => handleChange("studio_address", e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Stack>
          </Box>
        )}

        {/* TAB 2: Shipping & Legal */}
        {tabIndex === 2 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Commerce Thresholds &amp; Legal Compliance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure minimum free shipping cart values, standard delivery fees, and regulatory licenses.
            </Typography>

            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Free Shipping Minimum Order Value (₹)"
                    name="free_shipping_threshold"
                    type="number"
                    value={settings.free_shipping_threshold}
                    onChange={(e) => handleChange("free_shipping_threshold", e.target.value)}
                    fullWidth
                    helperText="Orders at or above this amount get 100% free delivery"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Standard Delivery Flat Rate (₹)"
                    name="standard_shipping_rate"
                    type="number"
                    value={settings.standard_shipping_rate}
                    onChange={(e) => handleChange("standard_shipping_rate", e.target.value)}
                    fullWidth
                    helperText="Delivery fee charged for orders below free shipping threshold"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="FSSAI Food Safety License Number"
                    name="fssai_license"
                    value={settings.fssai_license}
                    onChange={(e) => handleChange("fssai_license", e.target.value)}
                    fullWidth
                    helperText="Mandatory food authority certification code"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="GSTIN Registered Tax Number"
                    name="gstin_number"
                    value={settings.gstin_number}
                    onChange={(e) => handleChange("gstin_number", e.target.value)}
                    fullWidth
                    helperText="Official 15-digit GST identification number"
                  />
                </Grid>
              </Grid>
            </Stack>
          </Box>
        )}

        {/* TAB 3: Payment Gateway */}
        {tabIndex === 3 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Razorpay Online Payment Gateway
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Accept payments across India via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets.
            </Typography>

            <Stack spacing={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  bgcolor: "#fcf8f2",
                  borderColor: "#f5d0a9",
                }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#92400e" }}>
                      Gateway Status: Ready for Production Keys
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: "13px" }}>
                      To enable real live payments, put your Razorpay API keys in your project root <code>.env</code> file.
                    </Typography>
                  </Box>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Auto-Detection Active"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2, border: "1px solid #e5e7eb" }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block" }}>
                        1. KEY ID (.env)
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600, color: "primary.main", mt: 0.5 }}>
                        RAZORPAY_KEY_ID = rzp_live_... / rzp_test_...
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2, border: "1px solid #e5e7eb" }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block" }}>
                        2. KEY SECRET (.env)
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600, color: "primary.main", mt: 0.5 }}>
                        RAZORPAY_KEY_SECRET = ********************
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Webhook URL Box */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Webhook Notification Endpoint (For Razorpay Dashboard)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "13px" }}>
                  Add this webhook URL in your <a href="https://dashboard.razorpay.com/app/webhooks" target="_blank" rel="noopener noreferrer" style={{ color: "#d97706", fontWeight: 600 }}>Razorpay Dashboard → Webhooks</a> to automatically capture payments and confirm orders:
                </Typography>

                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "grey.100",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600, fontSize: "13px" }}>
                    /api/webhooks/razorpay
                  </Typography>
                  <Button
                    type="button"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/razorpay`);
                      setCopiedWebhook(true);
                      setTimeout(() => setCopiedWebhook(false), 3000);
                    }}
                    sx={{ textTransform: "none", fontSize: "12px" }}
                  >
                    {copiedWebhook ? "Copied!" : "Copy Full URL"}
                  </Button>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    <strong>Active Events to Subscribe:</strong> <code>payment.captured</code>, <code>order.paid</code>
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          </Box>
        )}

        {/* TAB 4: Social & Newsletter */}
        {tabIndex === 4 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Social Media Channels &amp; Newsletter Perks
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connect your official social media profiles and customize the footer newsletter offer.
            </Typography>

            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Instagram URL"
                    name="social_instagram"
                    value={settings.social_instagram}
                    onChange={(e) => handleChange("social_instagram", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="WhatsApp Chat Link"
                    name="social_whatsapp"
                    value={settings.social_whatsapp}
                    onChange={(e) => handleChange("social_whatsapp", e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Facebook Page URL"
                    name="social_facebook"
                    value={settings.social_facebook}
                    onChange={(e) => handleChange("social_facebook", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Twitter / X Profile URL"
                    name="social_twitter"
                    value={settings.social_twitter}
                    onChange={(e) => handleChange("social_twitter", e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Privilege Club Welcome Coupon Code"
                    name="newsletter_coupon"
                    value={settings.newsletter_coupon}
                    onChange={(e) => handleChange("newsletter_coupon", e.target.value)}
                    fullWidth
                    helperText="Coupon automatically issued to new subscribers (e.g. GOLDEN15)"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Newsletter Header"
                    name="newsletter_title"
                    value={settings.newsletter_title}
                    onChange={(e) => handleChange("newsletter_title", e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                label="Newsletter Description"
                name="newsletter_description"
                value={settings.newsletter_description}
                onChange={(e) => handleChange("newsletter_description", e.target.value)}
                multiline
                rows={2}
                fullWidth
              />
            </Stack>
          </Box>
        )}

        {/* TAB 5: Admin Profile */}
        {tabIndex === 5 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Admin Profile &amp; Role
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Current authenticated administrator session details.
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, maxWidth: 500, mb: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="body2">
                  <strong>Name:</strong> {adminUser?.name || "Store Administrator"}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {adminUser?.email || "admin@makhanagold.test"}
                </Typography>
                <Typography variant="body2">
                  <strong>Access Role:</strong> {adminUser?.role || "super_admin"}
                </Typography>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, maxWidth: 500 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Update the password for this admin login.
              </Typography>

              {passwordState.success && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                  Password updated successfully.
                </Alert>
              )}
              {passwordState.error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {passwordState.error}
                </Alert>
              )}

              <Stack spacing={2}>
                <TextField
                  label="Current Password"
                  type="password"
                  value={passwordFields.currentPassword}
                  onChange={(e) => setPasswordFields((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  fullWidth
                  autoComplete="current-password"
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={passwordFields.newPassword}
                  onChange={(e) => setPasswordFields((prev) => ({ ...prev, newPassword: e.target.value }))}
                  fullWidth
                  autoComplete="new-password"
                  helperText="Minimum 8 characters"
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={passwordFields.confirmPassword}
                  onChange={(e) => setPasswordFields((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  fullWidth
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<LockResetIcon />}
                  onClick={handlePasswordChange}
                  disabled={passwordState.submitting}
                  sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                >
                  {passwordState.submitting ? "Updating…" : "Update Password"}
                </Button>
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Bottom Save Bar */}
        <Box
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "grey.50",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            sx={{ borderRadius: 2, px: 4, textTransform: "none", fontWeight: 700 }}
          >
            Save All Settings
          </Button>
        </Box>
      </Paper>
    </form>
  );
}
