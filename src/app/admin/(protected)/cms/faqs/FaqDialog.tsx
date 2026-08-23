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
import { upsertFaqItemAction } from "../actions";

interface FaqData {
  id?: number;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export function FaqDialog({ faq }: { faq?: FaqData }) {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(faq);

  const [formData, setFormData] = useState<FaqData>(
    faq || {
      category: "Orders & Shipping",
      question: "",
      answer: "",
      sortOrder: 0,
      isActive: true,
    }
  );

  return (
    <>
      {isEditing ? (
        <IconButton size="small" color="primary" onClick={() => setOpen(true)} title="Edit FAQ">
          <EditIcon fontSize="small" />
        </IconButton>
      ) : (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Add FAQ Item
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form
          action={async (fd) => {
            await upsertFaqItemAction(fd);
            setOpen(false);
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {isEditing ? "Edit FAQ Item" : "Create New FAQ Item"}
          </DialogTitle>
          <DialogContent dividers>
            {isEditing && <input type="hidden" name="id" value={faq?.id} />}
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    fullWidth
                    required
                    helperText="e.g. Orders & Shipping, Quality & Sourcing, Returns & Corporate"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
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
                label="Question"
                name="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                fullWidth
                required
                multiline
                rows={2}
              />

              <TextField
                label="Answer"
                name="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                fullWidth
                required
                multiline
                rows={4}
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
                label="Active (Display on Support &amp; FAQ Page)"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
              {isEditing ? "Save Changes" : "Save FAQ"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
