"use client";

import { useState, useRef } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { sendBroadcastAction } from "./actions";

interface BroadcastCounts {
  customersCount: number;
  subscribersCount: number;
  communityCount: number;
  customers: Array<{ email: string; name: string | null }>;
}

const PRESET_TEMPLATES = [
  {
    key: "festive_discount",
    label: "20% Privilege Discount",
    subject: "Exclusive Privilege: Enjoy 20% Off Your Artisanal Harvest ✨",
    badge: "🎁 LIMITED PRIVILEGE • 20% OFF",
    headline: "A Special Harvest Privilege Just For You",
    message:
      "As a cherished member of the Makhana Gold family, we are delighted to extend an exclusive 20% festive privilege on our complete collection of slow-roasted fox nuts.\n\nHand-selected from generational wetland farms in Bihar, every batch is dry-roasted to perfection with zero palm oil and pure natural seasonings. Elevate your daily mindfulness snacking today.",
    couponCode: "FESTIVE20",
    ctaText: "Claim 20% Privilege Now",
    ctaUrl: "/shop",
    bannerImageUrl: "/images/vibrant/hero.jpg",
  },
  {
    key: "new_launch",
    label: "New Flavour Launch",
    subject: "Introducing Limited Reserve: Black Truffle & Aged Herb Makhana 🌿",
    badge: "🔥 NEW LAUNCH • LIMITED RESERVE",
    headline: "Gourmet Elegance: Black Truffle & Aged Herb",
    message:
      "We are thrilled to unveil our newest culinary masterpiece — Italian Summer Truffle & Aged Mediterranean Herbs Fox Nuts.\n\nCrafted in limited first-batch quantities of only 500 tins, this limited edition delivers deep earthy umami paired with our signature feather-light crunch.",
    couponCode: "GOLDEN15",
    ctaText: "Explore New Launch",
    ctaUrl: "/shop",
    bannerImageUrl: "/images/vibrant/new-launch.jpg",
  },
  {
    key: "harvest_announcement",
    label: "Fresh Harvest 2026",
    subject: "Fresh 2026 Origin Harvest Is Here — Makhana Gold Announcement 🌾",
    badge: "✨ ARTISANAL HARVEST 2026",
    headline: "Pure Origin Fox Nuts • Freshly Roasted",
    message:
      "Our 2026 wetland harvest has officially landed from Bihar! Sourced sustainably with 100% traceability, our fox nuts are packed with 16g/100g clean plant protein, zero gluten, and heart-friendly minerals.\n\nStock up your pantry with fresh seasonal crunch today.",
    couponCode: "FREESHIP",
    ctaText: "Shop Fresh Harvest",
    ctaUrl: "/shop",
    bannerImageUrl: "/images/banners/marketplace_bottom_banner.jpg",
  },
];

export function BroadcastFormClient({ counts }: { counts: BroadcastCounts }) {
  const [audience, setAudience] = useState<"all_customers" | "all_subscribers" | "entire_community" | "individual">("entire_community");
  const [targetEmail, setTargetEmail] = useState("");
  const [subject, setSubject] = useState("Special Harvest Privilege from Makhana Gold ✨");
  const [badge, setBadge] = useState("✨ EXCLUSIVE PRIVILEGE");
  const [headline, setHeadline] = useState("Artisanal Harvest Privilege");
  const [message, setMessage] = useState(
    "We are delighted to share our newest seasonal harvest updates with our conscious pantry community.\n\nDiscover slow-roasted fox nuts crafted with generational wisdom and pure natural Himalayan pink salt seasonings."
  );
  const [couponCode, setCouponCode] = useState("GOLDEN15");
  const [ctaText, setCtaText] = useState("Shop The Collection");
  const [ctaUrl, setCtaUrl] = useState("/shop");
  const [bannerImageUrl, setBannerImageUrl] = useState("/images/vibrant/hero.jpg");

  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyPreset = (presetKey: string) => {
    const found = PRESET_TEMPLATES.find((p) => p.key === presetKey);
    if (found) {
      setSubject(found.subject);
      setBadge(found.badge);
      setHeadline(found.headline);
      setMessage(found.message);
      setCouponCode(found.couponCode);
      setCtaText(found.ctaText);
      setCtaUrl(found.ctaUrl);
      setBannerImageUrl(found.bannerImageUrl);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "broadcasts");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || "Failed to upload banner image.");
      }

      setBannerImageUrl(json.url);
    } catch (err: any) {
      alert(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResultMessage(null);

    try {
      const formData = new FormData();
      formData.set("audience", audience);
      formData.set("targetEmail", targetEmail);
      formData.set("subject", subject);
      formData.set("badge", badge);
      formData.set("headline", headline);
      formData.set("message", message);
      formData.set("couponCode", couponCode);
      formData.set("ctaText", ctaText);
      formData.set("ctaUrl", ctaUrl);
      formData.set("bannerImageUrl", bannerImageUrl);

      const res = await sendBroadcastAction(formData);
      setResultMessage({
        type: "success",
        text: `Broadcast sent successfully to ${res.recipientCount} recipient(s).`,
      });
    } catch (err: any) {
      setResultMessage({
        type: "error",
        text: err?.message || "Failed to dispatch broadcast.",
      });
    } finally {
      setSending(false);
    }
  };

  const currentRecipientCount =
    audience === "entire_community"
      ? counts.communityCount
      : audience === "all_customers"
      ? counts.customersCount
      : audience === "all_subscribers"
      ? counts.subscribersCount
      : 1;

  return (
    <Box component="form" onSubmit={handleSend}>
      {resultMessage && (
        <Alert severity={resultMessage.type} sx={{ mb: 3, borderRadius: 2 }}>
          {resultMessage.text}
        </Alert>
      )}

      {/* 1-CLICK CAMPAIGN PRESETS */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3, bgcolor: "grey.50" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
              <AutoAwesomeIcon fontSize="small" color="primary" /> 1-Click Campaign Presets
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Load ready-made luxury marketing email templates with one click:
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {PRESET_TEMPLATES.map((p) => (
              <Button
                key={p.key}
                size="small"
                variant="outlined"
                onClick={() => applyPreset(p.key)}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, fontSize: "12px", bgcolor: "white" }}
              >
                {p.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* LEFT COLUMN: BROADCAST COMPOSER */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Broadcast Message Details
            </Typography>

            <Stack spacing={2.5}>
              {/* Audience Selector */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                  Target Audience Segment
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => setAudience("entire_community")}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor: audience === "entire_community" ? "primary.main" : "divider",
                        bgcolor: audience === "entire_community" ? "primary.50" : "white",
                        transition: "all 0.2s",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <PeopleIcon color={audience === "entire_community" ? "primary" : "action"} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Entire Community
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Customers + Subscribers ({counts.communityCount})
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => setAudience("all_customers")}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor: audience === "all_customers" ? "primary.main" : "divider",
                        bgcolor: audience === "all_customers" ? "primary.50" : "white",
                        transition: "all 0.2s",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <MarkEmailReadIcon color={audience === "all_customers" ? "primary" : "action"} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Registered Customers
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            All Store Accounts ({counts.customersCount})
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => setAudience("all_subscribers")}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor: audience === "all_subscribers" ? "primary.main" : "divider",
                        bgcolor: audience === "all_subscribers" ? "primary.50" : "white",
                        transition: "all 0.2s",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <PeopleIcon color={audience === "all_subscribers" ? "primary" : "action"} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Newsletter Subscribers
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Active Subscribers ({counts.subscribersCount})
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => setAudience("individual")}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor: audience === "individual" ? "primary.main" : "divider",
                        bgcolor: audience === "individual" ? "primary.50" : "white",
                        transition: "all 0.2s",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <MarkEmailReadIcon color={audience === "individual" ? "primary" : "action"} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Single Specific Email
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Send to 1 customer only
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Individual Target Email Field */}
              {audience === "individual" && (
                <TextField
                  label="Target Recipient Email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  fullWidth
                  required
                  placeholder="customer@example.com"
                  helperText="Type any valid email address or select an existing customer below"
                  select={counts.customers.length > 0}
                >
                  {counts.customers.map((c) => (
                    <MenuItem key={c.email} value={c.email}>
                      {c.name ? `${c.name} (${c.email})` : c.email}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {/* Email Subject Line */}
              <TextField
                label="Email Subject Line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
                required
                helperText="Appears in recipient inbox subject line"
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Announcement Badge (Optional)"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    fullWidth
                    helperText="e.g. 🎁 LIMITED PRIVILEGE • 20% OFF"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Promo Code Pill (Optional)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    fullWidth
                    helperText="e.g. FESTIVE20 or GOLDEN15"
                  />
                </Grid>
              </Grid>

              {/* Main Headline */}
              <TextField
                label="Email Headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                fullWidth
                required
              />

              {/* Message Body */}
              <TextField
                label="Message Body / Announcement Text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                rows={5}
                fullWidth
                required
                helperText="Separate paragraphs with a blank line. Personalized name will be automatically prepended."
              />

              {/* Call to Action Button */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="CTA Button Label"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    fullWidth
                    helperText="e.g. Shop The Collection"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="CTA Button Link"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    fullWidth
                    helperText="e.g. /shop or https://makhanagold.com/offers"
                  />
                </Grid>
              </Grid>

              {/* Banner Image */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                  Optional Email Header Banner Image
                </Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outlined"
                    startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    Upload Image
                  </Button>
                  <TextField
                    size="small"
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    placeholder="/images/vibrant/hero.jpg"
                    fullWidth
                  />
                </Stack>
              </Box>

              {/* Dispatch Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={sending}
                startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                {sending
                  ? `Dispatching to ${currentRecipientCount} Recipient(s)...`
                  : `Send Broadcast Now (${currentRecipientCount} Recipients)`}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: LIVE SIMULATOR PREVIEW */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ position: "sticky", top: 80 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
              <VisibilityIcon fontSize="small" color="primary" /> Live Email Inbox Simulation
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#FAF6EE",
                p: 2,
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
              }}
            >
              {/* Email Client Top Bar */}
              <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 2, mb: 2, border: "1px solid #EFE8DA" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  <strong>Subject:</strong> {subject}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  <strong>From:</strong> Makhana Gold Concierge &lt;mmakhanaltd@gmail.com&gt;
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  <strong>To:</strong> {audience === "individual" ? targetEmail || "customer@example.com" : `${audience} (${currentRecipientCount} recipients)`}
                </Typography>
              </Box>

              {/* Rendered Email Card */}
              <Box sx={{ bgcolor: "white", borderRadius: 2.5, overflow: "hidden", border: "1px solid #EFE8DA" }}>
                {/* Brand Banner */}
                <Box sx={{ bgcolor: "#150D04", py: 2.5, px: 2, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ color: "#F5E6CC", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase", fontSize: "16px" }}>
                    Makhana Gold
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#D4AF37", letterSpacing: 2, textTransform: "uppercase", fontSize: "9px" }}>
                    Artisanal Heritage • Modern Wellness
                  </Typography>
                </Box>

                {/* Banner Image */}
                {bannerImageUrl && (
                  <Box
                    component="img"
                    src={bannerImageUrl}
                    alt="Banner Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/vibrant/hero.jpg";
                    }}
                    sx={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }}
                  />
                )}

                {/* Body Content */}
                <Box sx={{ p: 2.5, textAlign: "center" }}>
                  {badge && (
                    <Chip
                      label={badge}
                      size="small"
                      sx={{
                        mb: 1.5,
                        fontWeight: 800,
                        fontSize: "10px",
                        bgcolor: "#FFF3E0",
                        color: "#D84315",
                        border: "1px solid #FFE0B2",
                      }}
                    />
                  )}

                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#1C150C", fontSize: "17px", lineHeight: 1.3, mb: 1 }}>
                    {headline}
                  </Typography>

                  <Typography variant="caption" sx={{ color: "#8B5A2B", fontWeight: 700, display: "block", mb: 1.5 }}>
                    Namaste Eleanor Vance,
                  </Typography>

                  <Box sx={{ textAlign: "left", bgcolor: "#FCFAF6", p: 1.5, borderRadius: 2, border: "1px solid #F1ECE1", mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#594D3B", fontSize: "12px", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                      {message}
                    </Typography>
                  </Box>

                  {couponCode && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: "2px dashed #D4AF37",
                        bgcolor: "#FAF6EE",
                        mb: 2,
                        maxWidth: 260,
                        mx: "auto",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "#8B5A2B", fontWeight: 700, textTransform: "uppercase", fontSize: "9px" }}>
                        Promo Code
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: "monospace", fontWeight: 800, color: "#D84315", letterSpacing: 2 }}>
                        {couponCode}
                      </Typography>
                    </Box>
                  )}

                  {ctaText && (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        bgcolor: "#D84315",
                        color: "white",
                        fontWeight: 700,
                        borderRadius: 2,
                        textTransform: "none",
                        px: 3,
                        py: 0.8,
                        fontSize: "12px",
                      }}
                    >
                      {ctaText} →
                    </Button>
                  )}
                </Box>

                {/* Email Footer */}
                <Box sx={{ p: 1.5, bgcolor: "#FAF6EE", textAlign: "center", borderTop: "1px solid #EFE8DA" }}>
                  <Typography variant="caption" sx={{ color: "#8A7B6B", fontSize: "10px", display: "block" }}>
                    Makhana Gold India • 100% Certified Bihar Wetland Foxnuts
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
