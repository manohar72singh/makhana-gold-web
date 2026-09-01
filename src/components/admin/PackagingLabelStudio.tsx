"use client";

import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";

// Icons
import QrCode2Icon from "@mui/icons-material/QrCode2Outlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface PackagingLabelStudioProps {
  productSlug?: string;
  initialBarcode?: string;
  initialArtworkUrl?: string;
}

export function PackagingLabelStudio({
  productSlug = "himalayan-pink-salt-makhana",
  initialBarcode = "8901911366891",
  initialArtworkUrl = "",
}: PackagingLabelStudioProps) {
  const [barcode, setBarcode] = useState(initialBarcode);
  const [artworkUrl, setArtworkUrl] = useState(initialArtworkUrl);
  const [barcodeImg, setBarcodeImg] = useState<string>("");
  const [qrImg, setQrImg] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrDestination = typeof window !== "undefined"
    ? `${window.location.origin}/product/${productSlug}?source=packet_qr&promo=REFILL15`
    : `https://makhanagold.com/product/${productSlug}?source=packet_qr&promo=REFILL15`;

  useEffect(() => {
    generateCodes();
  }, [barcode, productSlug]);

  const generateCodes = async () => {
    if (!barcode) return;
    setGenerating(true);
    try {
      const res = await fetch(
        `/api/admin/barcode?barcode=${encodeURIComponent(barcode)}&qrUrl=${encodeURIComponent(qrDestination)}`
      );
      const json = await res.json();
      if (json.success) {
        setBarcodeImg(json.barcodeDataUrl);
        setQrImg(json.qrDataUrl);
      }
    } catch (err) {
      console.error("Failed to generate codes:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleArtworkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingArtwork(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "packaging");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || "Failed to upload packaging artwork");
      }

      setArtworkUrl(json.url);
    } catch (err: any) {
      alert(err?.message || "Upload failed");
    } finally {
      setUploadingArtwork(false);
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Hidden inputs to bind to the parent form */}
      <input type="hidden" name="barcode" value={barcode} />
      <input type="hidden" name="packagingArtworkUrl" value={artworkUrl} />

      <Typography variant="h6" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <QrCode2Icon color="primary" /> Packaging Artwork, Barcode (EAN-13) &amp; Smart QR Studio
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2.5 }}>
        Generate print-ready retail EAN-13 barcodes, customer re-order QR codes, and upload packet/pamphlet design artwork.
      </Typography>

      <Grid container spacing={3}>
        {/* LEFT: BARCODE & QR GENERATOR */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%", bgcolor: "#FAF6EE", borderColor: "#EFE8DA" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: "#1C150C" }}>
              Barcode &amp; Smart QR Code Generator
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="EAN-13 Retail Barcode Number"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="8901911366891"
                fullWidth
                size="small"
                helperText="12 or 13-digit retail barcode for FMCG retail stores (Blinkit/Zepto/Supermarkets)"
              />

              {/* RENDERED BARCODE & QR PREVIEW */}
              <Grid container spacing={2} sx={{ alignItems: "center" }}>
                {/* EAN Barcode Card */}
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      textAlign: "center",
                      borderRadius: 2,
                      bgcolor: "white",
                      borderColor: "#E0D7C6",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                      EAN-13 Retail Barcode
                    </Typography>
                    {generating ? (
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    ) : barcodeImg ? (
                      <Box
                        component="img"
                        src={barcodeImg}
                        alt="EAN-13 Barcode"
                        sx={{ maxWidth: "100%", height: 65, objectFit: "contain", display: "block", mx: "auto" }}
                      />
                    ) : (
                      <Typography variant="caption" color="error">Invalid Barcode</Typography>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadImage(barcodeImg, `barcode_${barcode}.png`)}
                      disabled={!barcodeImg}
                      sx={{ mt: 1.5, fontSize: "11px", textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                    >
                      Download Barcode PNG
                    </Button>
                  </Paper>
                </Grid>

                {/* Smart QR Code Card */}
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      textAlign: "center",
                      borderRadius: 2,
                      bgcolor: "white",
                      borderColor: "#E0D7C6",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                      Smart Packet QR
                    </Typography>
                    {generating ? (
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    ) : qrImg ? (
                      <Box
                        component="img"
                        src={qrImg}
                        alt="Smart Packet QR Code"
                        sx={{ width: 75, height: 75, objectFit: "contain", display: "block", mx: "auto" }}
                      />
                    ) : null}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadImage(qrImg, `qr_${productSlug}.png`)}
                      disabled={!qrImg}
                      sx={{ mt: 1, fontSize: "11px", textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                    >
                      Download QR
                    </Button>
                  </Paper>
                </Grid>
              </Grid>

              {/* QR Destination Preview */}
              <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 2, border: "1px solid #EFE8DA" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#8B5A2B", display: "block" }}>
                  Customer Mobile Scan Destination:
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", wordBreak: "break-all" }}>
                  {qrDestination}
                </Typography>
                <Chip
                  icon={<AutoAwesomeIcon fontSize="inherit" />}
                  label="Auto-Applies 15% Re-Order Discount (REFILL15)"
                  size="small"
                  color="success"
                  sx={{ mt: 1, fontWeight: 700, fontSize: "10px" }}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT: PACKAGING ARTWORK & PAMPHLET UPLOADER */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%", bgcolor: "white" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Packaging Pouch Design &amp; Pamphlet Artwork
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Upload your pouch front/back design, marketing pamphlet, or printing layout for this product.
            </Typography>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              style={{ display: "none" }}
              onChange={handleArtworkUpload}
            />

            {artworkUrl ? (
              <Box>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    overflow: "hidden",
                    border: "2px solid #EFE8DA",
                    mb: 2,
                    position: "relative",
                  }}
                >
                  <Box
                    component="img"
                    src={artworkUrl}
                    alt="Packaging Artwork"
                    sx={{ width: "100%", maxHeight: 220, objectFit: "contain", bgcolor: "#FAF6EE", display: "block" }}
                  />
                </Paper>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={uploadingArtwork ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingArtwork}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                  >
                    Replace Artwork
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    onClick={() => setArtworkUrl("")}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Paper
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  borderStyle: "dashed",
                  borderColor: "#D4AF37",
                  bgcolor: "#FCFAF6",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#FAF6EE" },
                  transition: "all 0.2s",
                }}
              >
                {uploadingArtwork ? (
                  <CircularProgress size={32} sx={{ color: "#D84315", my: 2 }} />
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 40, color: "#D84315", mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1C150C" }}>
                      Upload Pouch Artwork or Pamphlet
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click to browse JPG, PNG or PDF packaging files
                    </Typography>
                  </>
                )}
              </Paper>
            )}

            <Alert severity="info" sx={{ mt: 2.5, borderRadius: 2, fontSize: "12px" }}>
              <strong>Printer Tip:</strong> Both Barcode and QR code are generated at 300 DPI high resolution, ready to insert directly into Adobe Illustrator / CorelDraw packaging print plates.
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
