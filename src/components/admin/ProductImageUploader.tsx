"use client";

import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export interface ProductImageItem {
  id?: number;
  url: string;
  isPrimary?: boolean;
  altText?: string;
}

const PRESET_PRODUCT_IMAGES = [
  { label: "Pink Salt Tin", url: "/images/vibrant/hero.jpg" },
  { label: "Black Truffle Pack", url: "/images/vibrant/new-launch.jpg" },
  { label: "Pouch Packaging", url: "/images/banners/marketplace_bottom_banner.jpg" },
  { label: "Gourmet Flavours", url: "/images/vibrant/flavour-truffle.jpg" },
];

export function ProductImageUploader({
  initialImages = [],
}: {
  initialImages?: ProductImageItem[];
}) {
  const [images, setImages] = useState<ProductImageItem[]>(
    initialImages.length > 0
      ? initialImages
      : [{ url: "/images/vibrant/hero.jpg", isPrimary: true }]
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("folder", "products");
      for (let i = 0; i < files.length; i++) {
        data.append("files", files[i]);
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to upload images.");
      }

      const newUrls: string[] = json.urls || (json.url ? [json.url] : []);
      const newImageItems: ProductImageItem[] = newUrls.map((u, idx) => ({
        url: u,
        isPrimary: images.length === 0 && idx === 0,
      }));

      setImages((prev) => [...prev, ...newImageItems]);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddPreset = (url: string) => {
    if (images.some((img) => img.url === url)) return;
    setImages((prev) => [
      ...prev,
      { url, isPrimary: prev.length === 0 },
    ]);
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Hidden input for Form submission */}
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />

      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
        📸 Product Gallery &amp; Photos ({images.length} Images)
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Upload multiple photos from your device. Click the star (⭐) on any photo to set it as the main cover photo.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* UPLOAD ACTIONS STRIP */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, mb: 2.5, bgcolor: "#FAF6EE", borderColor: "#EFE8DA" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <Button
              variant="contained"
              startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{
                bgcolor: "#1C150C",
                "&:hover": { bgcolor: "#3A2E1E" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              {uploading ? "Uploading Photos..." : "Upload Photos from Computer"}
            </Button>
            <Typography variant="caption" color="text.secondary">
              (Multi-select supported, JPG/PNG/WEBP up to 15MB)
            </Typography>
          </Stack>

          {/* Quick Presets */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#8B5A2B", display: "flex", alignItems: "center", gap: 0.5 }}>
              <AutoAwesomeIcon fontSize="inherit" /> Presets:
            </Typography>
            {PRESET_PRODUCT_IMAGES.map((p) => (
              <Chip
                key={p.url}
                label={p.label}
                size="small"
                onClick={() => handleAddPreset(p.url)}
                sx={{ cursor: "pointer", bgcolor: "white", fontSize: "11px", fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* LIVE IMAGE PREVIEW GRID */}
      {images.length > 0 ? (
        <Grid container spacing={2}>
          {images.map((img, idx) => (
            <Grid key={idx} size={{ xs: 6, sm: 4, md: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  position: "relative",
                  border: "2px solid",
                  borderColor: img.isPrimary ? "#D84315" : "divider",
                  boxShadow: img.isPrimary ? "0 4px 14px rgba(216,67,21,0.2)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {/* Primary Cover Badge */}
                {img.isPrimary && (
                  <Chip
                    label="⭐ Main Cover"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      bgcolor: "#D84315",
                      color: "white",
                      fontWeight: 800,
                      fontSize: "10px",
                      zIndex: 2,
                    }}
                  />
                )}

                {/* Thumbnail Image */}
                <Box
                  component="img"
                  src={img.url}
                  alt={`Product Preview ${idx + 1}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/vibrant/hero.jpg";
                  }}
                  sx={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                    display: "block",
                    bgcolor: "grey.100",
                  }}
                />

                {/* Image Controls Bar */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    p: 1,
                    bgcolor: "white",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid #EFE8DA",
                  }}
                >
                  <Button
                    size="small"
                    startIcon={img.isPrimary ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                    onClick={() => setPrimaryImage(idx)}
                    sx={{
                      textTransform: "none",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: img.isPrimary ? "#D84315" : "text.secondary",
                      p: 0.5,
                    }}
                  >
                    {img.isPrimary ? "Primary" : "Set Primary"}
                  </Button>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeImage(idx)}
                    sx={{ p: 0.5 }}
                    title="Remove Photo"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            borderStyle: "dashed",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No photos added yet. Click &quot;Upload Photos from Computer&quot; above to add your first product image.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
