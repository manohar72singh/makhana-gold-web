"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import IconButton from "@mui/material/IconButton";
import { upsertCertificationAction } from "../actions";

interface CertificationData {
  id?: number;
  name: string;
  issuingBody: string;
  certificateNumber?: string | null;
  validUntil?: string | null; // yyyy-mm-dd
  documentUrl?: string | null;
  badgeImage?: string | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const data = new FormData();
  data.append("file", file);
  data.append("folder", folder);

  const res = await fetch("/api/admin/upload", { method: "POST", body: data });
  const json = await res.json();
  if (!res.ok || !json.url) {
    throw new Error(json.error || "Upload failed.");
  }
  return json.url;
}

export function CertificationDialog({ certification }: { certification?: CertificationData }) {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(certification);

  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingBadge, setUploadingBadge] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CertificationData>(
    certification || {
      name: "",
      issuingBody: "",
      certificateNumber: "",
      validUntil: "",
      documentUrl: "",
      badgeImage: "",
      description: "",
      sortOrder: 0,
      isActive: true,
    }
  );

  async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    setUploadError(null);
    try {
      const url = await uploadFile(file, "certifications");
      setFormData((prev) => ({ ...prev, documentUrl: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error uploading document.");
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleBadgeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBadge(true);
    setUploadError(null);
    try {
      const url = await uploadFile(file, "certifications");
      setFormData((prev) => ({ ...prev, badgeImage: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error uploading badge image.");
    } finally {
      setUploadingBadge(false);
    }
  }

  return (
    <>
      {isEditing ? (
        <IconButton size="small" color="primary" onClick={() => setOpen(true)} title="Edit Certification">
          <EditIcon fontSize="small" />
        </IconButton>
      ) : (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Add Certification
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form
          action={async (fd) => {
            await upsertCertificationAction(fd);
            setOpen(false);
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {isEditing ? "Edit Certification" : "Add New Certification"}
          </DialogTitle>
          <DialogContent dividers>
            {isEditing && <input type="hidden" name="id" value={certification?.id} />}
            <input type="hidden" name="documentUrl" value={formData.documentUrl || ""} />
            <input type="hidden" name="badgeImage" value={formData.badgeImage || ""} />

            {uploadError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
                {uploadError}
              </Alert>
            )}

            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Certification Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                helperText="e.g. FSSAI License, ISO 22000 — Food Safety Management System"
              />

              <TextField
                label="Issuing Body"
                name="issuingBody"
                value={formData.issuingBody}
                onChange={(e) => setFormData({ ...formData, issuingBody: e.target.value })}
                fullWidth
                required
                helperText="e.g. Food Safety and Standards Authority of India (FSSAI)"
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Certificate Number"
                    name="certificateNumber"
                    value={formData.certificateNumber || ""}
                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                    fullWidth
                    placeholder="Leave blank if not yet issued"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Valid Until"
                    name="validUntil"
                    type="date"
                    value={formData.validUntil || ""}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                helperText="Shown on the certificate card — scope of license, business covered, etc."
              />

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Certificate Document (PDF)
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={uploadingDoc ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    disabled={uploadingDoc}
                    sx={{ textTransform: "none" }}
                  >
                    {uploadingDoc ? "Uploading…" : "Upload PDF"}
                    <input type="file" hidden accept="application/pdf" onChange={handleDocumentUpload} />
                  </Button>
                  {formData.documentUrl && (
                    <Typography variant="caption" color="success.main" sx={{ wordBreak: "break-all" }}>
                      ✓ {formData.documentUrl.split("/").pop()}
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Badge / Logo Image (Optional)
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={uploadingBadge ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    disabled={uploadingBadge}
                    sx={{ textTransform: "none" }}
                  >
                    {uploadingBadge ? "Uploading…" : "Upload Image"}
                    <input type="file" hidden accept="image/*" onChange={handleBadgeUpload} />
                  </Button>
                  {formData.badgeImage && (
                    <Typography variant="caption" color="success.main" sx={{ wordBreak: "break-all" }}>
                      ✓ {formData.badgeImage.split("/").pop()}
                    </Typography>
                  )}
                </Stack>
              </Box>

              <TextField
                label="Sort Order"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                sx={{ maxWidth: 160 }}
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
                label="Active (Display on Certifications Page)"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploadingDoc || uploadingBadge}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              {isEditing ? "Save Changes" : "Save Certification"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
