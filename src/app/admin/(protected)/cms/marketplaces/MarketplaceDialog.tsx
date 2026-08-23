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
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import IconButton from "@mui/material/IconButton";
import { upsertMarketplaceLinkAction } from "../actions";

interface MarketplaceData {
  id?: number;
  name: string;
  platformKey: string;
  url: string;
  badgeText?: string | null;
  borderHover?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export function MarketplaceDialog({ marketplace }: { marketplace?: MarketplaceData }) {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(marketplace);

  const [formData, setFormData] = useState<MarketplaceData>(
    marketplace || {
      name: "",
      platformKey: "",
      url: "",
      badgeText: "10-Minute Delivery",
      borderHover: "hover:border-amber-500",
      sortOrder: 0,
      isActive: true,
    }
  );

  return (
    <>
      {isEditing ? (
        <IconButton size="small" color="primary" onClick={() => setOpen(true)} title="Edit Marketplace Link">
          <EditIcon fontSize="small" />
        </IconButton>
      ) : (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Add Marketplace Partner
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form
          action={async (fd) => {
            await upsertMarketplaceLinkAction(fd);
            setOpen(false);
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {isEditing ? "Edit Marketplace Partner" : "Add Marketplace Partner"}
          </DialogTitle>
          <DialogContent dividers>
            {isEditing && <input type="hidden" name="id" value={marketplace?.id} />}
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Partner Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    fullWidth
                    required
                    helperText="e.g. Amazon Prime, Blinkit (10 Mins)"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Platform Key (Slug)"
                    name="platformKey"
                    value={formData.platformKey}
                    onChange={(e) => setFormData({ ...formData, platformKey: e.target.value })}
                    fullWidth
                    required
                    helperText="e.g. amazon, blinkit, zepto, instamart, flipkart"
                  />
                </Grid>
              </Grid>

              <TextField
                label="Direct Product / Brand Store URL"
                name="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                fullWidth
                required
                helperText="e.g. https://www.amazon.in/s?k=Makhana+Gold or https://blinkit.com"
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Badge / Feature Tag"
                    name="badgeText"
                    value={formData.badgeText || ""}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    fullWidth
                    helperText="e.g. Prime 1-Day Delivery, 10-Min Drop"
                  />
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

              <TextField
                label="Border Hover Class"
                name="borderHover"
                value={formData.borderHover || ""}
                onChange={(e) => setFormData({ ...formData, borderHover: e.target.value })}
                fullWidth
                helperText="e.g. hover:border-[#FF9900], hover:border-[#0C831F]"
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
                label="Active (Display on Homepage &amp; Footer)"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
              {isEditing ? "Save Changes" : "Save Partner"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
