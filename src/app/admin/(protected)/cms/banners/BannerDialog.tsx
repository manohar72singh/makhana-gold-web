"use client";

import { useState, useRef } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import CollectionsIcon from "@mui/icons-material/CollectionsOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import IconButton from "@mui/material/IconButton";
import { upsertHeroBannerAction } from "../actions";

interface BannerData {
  id?: number;
  slideKey: string;
  badge: string;
  badgeColor?: string | null;
  title: string;
  highlightTitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string | null;
  secondaryCtaLink?: string | null;
  bgImage: string;
  theme: string;
  socialProof?: string | null;
  showMarketplaces: boolean;
  sortOrder: number;
  isActive: boolean;
}

const PRESET_BANNERS = [
  { label: "Signature Harvest", url: "/images/vibrant/hero.jpg" },
  { label: "Truffle New Launch", url: "/images/vibrant/new-launch.jpg" },
  { label: "Marketplace Prime", url: "/images/banners/marketplace_bottom_banner.jpg" },
  { label: "Royal Gift Bundle", url: "/images/products/heritage-bundle.jpg" },
  { label: "Bihar Wetlands", url: "/images/vibrant/wetlands.jpg" },
  { label: "Pink Salt Bowl", url: "/images/vibrant/pink-salt.jpg" },
];

export function BannerDialog({ banner }: { banner?: BannerData }) {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(banner);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BannerData>(
    banner || {
      slideKey: "",
      badge: "✨ Artisanal Harvest 2026",
      badgeColor: "bg-amber-500/15 border-amber-500/30 text-amber-900",
      title: "Nature's Purest Crunch.",
      highlightTitle: "Now in Gold.",
      description: "Discover our hand-selected, slow-roasted Fox Nuts.",
      ctaText: "Shop The Collection",
      ctaLink: "/shop",
      secondaryCtaText: "Our Story",
      secondaryCtaLink: "/our-story",
      bgImage: "/images/vibrant/hero.jpg",
      theme: "light",
      socialProof: "4.9/5 Rating by 12,000+ Conscious Foodies",
      showMarketplaces: false,
      sortOrder: 0,
      isActive: true,
    }
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "banners");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || "Failed to upload image.");
      }

      setFormData((prev) => ({ ...prev, bgImage: json.url }));
    } catch (err: any) {
      setUploadError(err?.message || "Error uploading image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {isEditing ? (
        <IconButton size="small" color="primary" onClick={() => setOpen(true)} title="Edit Banner">
          <EditIcon fontSize="small" />
        </IconButton>
      ) : (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Add Hero Banner
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <form
          action={async (fd) => {
            await upsertHeroBannerAction(fd);
            setOpen(false);
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {isEditing ? "Edit Hero Banner Slide" : "Create New Hero Banner Slide"}
          </DialogTitle>
          <DialogContent dividers>
            {isEditing && <input type="hidden" name="id" value={banner?.id} />}

            {/* LIVE HERO BANNER SIMULATION PREVIEW */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" sx={{ fontWeight: 700, color: "text.secondary", display: "flex", alignItems: "center", gap: 1 }}>
                <VisibilityIcon fontSize="small" /> Live Banner Preview (As seen on Storefront)
              </Typography>

              <Box
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  minHeight: 220,
                  p: { xs: 2.5, sm: 3.5 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  backgroundImage: `linear-gradient(to right, ${
                    formData.theme === "dark" ? "rgba(18,12,6,0.92), rgba(18,12,6,0.65)" : "rgba(255,255,255,0.95), rgba(255,255,255,0.7)"
                  }), url(${formData.bgImage || "/images/vibrant/hero.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                }}
              >
                {formData.badge && (
                  <Box sx={{ mb: 1.5 }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "16px",
                        backgroundColor: formData.theme === "dark" ? "rgba(217,119,6,0.3)" : "#fef3c7",
                        color: formData.theme === "dark" ? "#fcd34d" : "#78350f",
                        border: "1px solid",
                        borderColor: formData.theme === "dark" ? "rgba(252,211,77,0.4)" : "#fde68a",
                        display: "inline-block",
                      }}
                    >
                      {formData.badge}
                    </span>
                  </Box>
                )}

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: formData.theme === "dark" ? "#ffffff" : "#1c1917",
                    lineHeight: 1.2,
                    mb: 1,
                  }}
                >
                  {formData.title || "Headline Title"}{" "}
                  <span style={{ color: "#d97706" }}>{formData.highlightTitle || "Highlight Text"}</span>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: formData.theme === "dark" ? "rgba(255,255,255,0.85)" : "#57534e",
                    maxWidth: 550,
                    mb: 2,
                    fontSize: "13px",
                  }}
                >
                  {formData.description || "Banner description paragraph"}
                </Typography>

                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "#d97706",
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: "none",
                      px: 2.5,
                      "&:hover": { bgcolor: "#b45309" },
                    }}
                  >
                    {formData.ctaText || "Shop Now"}
                  </Button>
                  {formData.secondaryCtaText && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        color: formData.theme === "dark" ? "#fff" : "#1c1917",
                        borderColor: formData.theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)",
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: "none",
                      }}
                    >
                      {formData.secondaryCtaText}
                    </Button>
                  )}
                </Stack>
              </Box>
            </Box>

            {/* IMAGE PICKER & UPLOADER */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, mb: 3, bgcolor: "grey.50" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <CollectionsIcon fontSize="small" color="primary" /> Banner Background Image
              </Typography>

              {uploadError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {uploadError}
                </Alert>
              )}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center", mb: 2 }}>
                <Box
                  component="img"
                  src={formData.bgImage || "/images/vibrant/hero.jpg"}
                  alt="Selected Background"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/vibrant/hero.jpg";
                  }}
                  sx={{
                    width: 140,
                    height: 80,
                    borderRadius: 2,
                    objectFit: "cover",
                    border: "2px solid",
                    borderColor: "primary.main",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    bgcolor: "grey.200",
                  }}
                />

                <Box sx={{ flex: 1, width: "100%" }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />

                  <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      {uploading ? "Uploading..." : "Upload from Computer"}
                    </Button>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Select an image from your computer (JPG, PNG, WEBP up to 10MB) or click any preset below.
                  </Typography>
                </Box>
              </Stack>

              {/* One-click Presets */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.8 }}>
                  Quick Presets:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.8 }}>
                  {PRESET_BANNERS.map((preset) => (
                    <Chip
                      key={preset.label}
                      label={preset.label}
                      size="small"
                      clickable
                      onClick={() => setFormData({ ...formData, bgImage: preset.url })}
                      color={formData.bgImage === preset.url ? "primary" : "default"}
                      variant={formData.bgImage === preset.url ? "filled" : "outlined"}
                      sx={{ fontWeight: 600, fontSize: "11px" }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Direct Path Input */}
              <TextField
                label="Direct Image URL / Path"
                name="bgImage"
                value={formData.bgImage}
                onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                fullWidth
                required
                size="small"
                sx={{ mt: 2, bgcolor: "white" }}
                helperText="Auto-updates when you upload a file or select a preset."
              />
            </Paper>

            {/* FORM FIELDS */}
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Slide Key (Unique Identifier)"
                    name="slideKey"
                    value={formData.slideKey}
                    onChange={(e) => setFormData({ ...formData, slideKey: e.target.value })}
                    fullWidth
                    required
                    helperText="e.g. signature-harvest, festival-offer, etc."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    select
                    label="Visual Theme"
                    name="theme"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    fullWidth
                  >
                    <MenuItem value="light">Light Theme (Dark text)</MenuItem>
                    <MenuItem value="dark">Dark Theme (White/Gold text)</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label="Sort Order"
                    name="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Badge Text"
                    name="badge"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    fullWidth
                    helperText="e.g. ✨ Artisanal Harvest 2026 • 100% Wetland Superfood"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Badge CSS Color Class (Optional)"
                    name="badgeColor"
                    value={formData.badgeColor || ""}
                    onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                    fullWidth
                    helperText="e.g. bg-amber-500/25 border-amber-400/50 text-amber-300"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Main Headline (Primary Line)"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    fullWidth
                    required
                    helperText="e.g. Nature's Purest Crunch."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Highlighted Sub-Headline (Colored Line)"
                    name="highlightTitle"
                    value={formData.highlightTitle}
                    onChange={(e) => setFormData({ ...formData, highlightTitle: e.target.value })}
                    fullWidth
                    required
                    helperText="e.g. Now in Gold."
                  />
                </Grid>
              </Grid>

              <TextField
                label="Slide Description / Paragraph"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                fullWidth
                required
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Primary CTA Text"
                    name="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Primary CTA Link"
                    name="ctaLink"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Secondary CTA Text (Optional)"
                    name="secondaryCtaText"
                    value={formData.secondaryCtaText || ""}
                    onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Secondary CTA Link (Optional)"
                    name="secondaryCtaLink"
                    value={formData.secondaryCtaLink || ""}
                    onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                label="Social Proof / Trust Line"
                name="socialProof"
                value={formData.socialProof || ""}
                onChange={(e) => setFormData({ ...formData, socialProof: e.target.value })}
                fullWidth
                helperText="e.g. 4.9/5 Rating by 12,000+ Conscious Foodies across India"
              />

              <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="showMarketplaces"
                      value="true"
                      checked={formData.showMarketplaces}
                      onChange={(e) => setFormData({ ...formData, showMarketplaces: e.target.checked })}
                    />
                  }
                  label="Show Quick-Commerce / Marketplace Logos"
                />
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      value="true"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active (Live on Storefront)"
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
              {isEditing ? "Save Changes" : "Publish Banner"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
