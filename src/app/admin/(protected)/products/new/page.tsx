import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { prisma } from "@/lib/db";
import { createProductAction } from "../actions";
import { ControlledSelectField } from "@/components/admin/ControlledSelectField";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { PackagingLabelStudio } from "@/components/admin/PackagingLabelStudio";

const STATUS_OPTIONS = [
  { value: "active", label: "Active (Published on Store)" },
  { value: "draft", label: "Draft (Hidden)" },
  { value: "archived", label: "Archived" },
];

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Add New Artisan Product
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a new fox nut product, upload high-resolution photos, configure pricing, and assign inventory.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, maxWidth: 900 }}>
        <Stack component="form" action={createProductAction} spacing={3.5}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Basic Information
          </Typography>

          <TextField
            name="name"
            label="Product Title / Name"
            placeholder="e.g. Himalayan Pink Salt Slow-Roasted Fox Nuts"
            required
            fullWidth
            helperText="Appears on the storefront product card and header"
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledSelectField
                name="categoryId"
                label="Product Category"
                required
                defaultValue={String(categories[0]?.id ?? "")}
                options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledSelectField
                name="status"
                label="Publication Status"
                defaultValue="active"
                options={STATUS_OPTIONS}
                fullWidth
              />
            </Grid>
          </Grid>

          <TextField
            name="description"
            label="Product Story & Description"
            placeholder="Describe the roast process, harvest origin, and tasting notes..."
            multiline
            rows={4}
            fullWidth
          />

          {/* MULTI-IMAGE UPLOADER & PREVIEW COMPONENT */}
          <ProductImageUploader />

          {/* PACKAGING ARTWORK, BARCODE & SMART QR STUDIO */}
          <PackagingLabelStudio productSlug="new-makhana-harvest" initialBarcode="8901911366891" />

          <Typography variant="h6" sx={{ fontWeight: 800, pt: 1 }}>
            Initial Pack Variant &amp; Pricing
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="packSize"
                label="Pack Size"
                required
                defaultValue="100g Jar"
                placeholder="e.g. 100g, 250g Tin, 500g Pack"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="price"
                label="Selling Price (₹)"
                type="number"
                required
                defaultValue={299}
                fullWidth
                helperText="Actual customer price"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="compareAtPrice"
                label="MRP / Strike-through Price (₹)"
                type="number"
                defaultValue={399}
                fullWidth
                helperText="Optional discount display"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="sku"
                label="SKU Code"
                defaultValue={`MG-SALT-${Math.floor(100 + Math.random() * 900)}`}
                fullWidth
                helperText="Unique inventory identifier"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="stockQuantity"
                label="Initial Stock Quantity (Units)"
                type="number"
                defaultValue={150}
                required
                fullWidth
                helperText="Warehouse inventory units available"
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              py: 1.5,
              bgcolor: "#D84315",
              "&:hover": { bgcolor: "#BF360C" },
              borderRadius: 2,
              fontWeight: 800,
              fontSize: "15px",
              textTransform: "none",
            }}
          >
            Publish Product to Store →
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
