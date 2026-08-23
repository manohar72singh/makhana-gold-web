"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import IconButton from "@mui/material/IconButton";
import { upsertFeaturePillarAction } from "../actions";

interface PillarData {
  id?: number;
  section: string;
  title: string;
  value?: string | null;
  description: string;
  icon: string;
  accentColor?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export function PillarDialog({ pillar, defaultSection = "trust_badge" }: { pillar?: PillarData; defaultSection?: string }) {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(pillar);

  const [formData, setFormData] = useState<PillarData>(
    pillar || {
      section: defaultSection,
      title: "",
      value: "",
      description: "",
      icon: "verified",
      accentColor: "",
      sortOrder: 0,
      isActive: true,
    }
  );

  return (
    <>
      {isEditing ? (
        <IconButton size="small" color="primary" onClick={() => setOpen(true)} title="Edit Pillar">
          <EditIcon fontSize="small" />
        </IconButton>
      ) : (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          {defaultSection === "health_benefit" ? "Add Health Benefit" : "Add Trust Badge"}
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form
          action={async (fd) => {
            await upsertFeaturePillarAction(fd);
            setOpen(false);
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {isEditing ? "Edit Feature Pillar" : "Add New Feature Pillar"}
          </DialogTitle>
          <DialogContent dividers>
            {isEditing && <input type="hidden" name="id" value={pillar?.id} />}
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Pillar Section Type"
                    name="section"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    fullWidth
                    required
                  >
                    <MenuItem value="trust_badge">Trust Badge (Top Store Ribbon)</MenuItem>
                    <MenuItem value="health_benefit">Health Benefit (Superfood Bento)</MenuItem>
                    <MenuItem value="process_pillar">Process Pillar (Heritage Story)</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                    label="Title / Headline"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    fullWidth
                    required
                    helperText="e.g. 100% Organic & Clean or Rich Plant Protein"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Badge / Value Tag (Optional)"
                    name="value"
                    value={formData.value || ""}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    fullWidth
                    helperText="e.g. 16g / 100g, Low GI Rating"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Material Symbol Icon Name"
                    name="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    fullWidth
                    required
                    helperText="e.g. eco, verified, fitness_center, favorite, local_fire_department"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Accent Color Class"
                    name="accentColor"
                    value={formData.accentColor || ""}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    fullWidth
                    helperText="e.g. bg-emerald-500/15 text-emerald-700"
                  />
                </Grid>
              </Grid>

              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
                required
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
                label="Active (Show on Storefront)"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
              {isEditing ? "Save Changes" : "Save Pillar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
