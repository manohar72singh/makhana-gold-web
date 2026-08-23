import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { prisma } from "@/lib/db";
import { updateProductAction, deleteProductAction } from "../actions";
import { ControlledSelectField } from "@/components/admin/ControlledSelectField";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { PackagingLabelStudio } from "@/components/admin/PackagingLabelStudio";

const STATUS_OPTIONS = [
  { value: "active", label: "Active (Published on Store)" },
  { value: "draft", label: "Draft (Hidden)" },
  { value: "archived", label: "Archived" },
];

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const productId = Number(id);

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: { include: { inventoryStock: true } },
        images: { orderBy: { sortOrder: "asc" } },
        attributes: true,
        category: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const initialImages = product.images.map((img) => ({
    id: img.id,
    url: img.url,
    isPrimary: img.isPrimary,
    altText: img.altText || product.name,
  }));

  const barcodeAttr = product.attributes.find((a) => a.key === "barcode");
  const artworkAttr = product.attributes.find((a) => a.key === "packaging_artwork");

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          ✏️ Edit Product: {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update product details, manage image gallery photos, generate packaging barcodes &amp; QR codes, and view variants.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, maxWidth: 900, mb: 4 }}>
        <Stack component="form" action={updateProductAction} spacing={3.5}>
          <input type="hidden" name="productId" value={product.id} />

          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            📦 Basic Information
          </Typography>

          <TextField
            name="name"
            label="Product Title / Name"
            defaultValue={product.name}
            required
            fullWidth
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledSelectField
                name="categoryId"
                label="Category"
                required
                defaultValue={String(product.categoryId ?? "")}
                options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledSelectField
                name="status"
                label="Status"
                defaultValue={product.status}
                options={STATUS_OPTIONS}
                fullWidth
              />
            </Grid>
          </Grid>

          <TextField
            name="description"
            label="Description"
            multiline
            rows={4}
            defaultValue={product.description ?? ""}
            fullWidth
          />

          {/* 📸 MULTI-IMAGE UPLOADER & PREVIEW */}
          <ProductImageUploader initialImages={initialImages} />

          {/* 🏷️ PACKAGING ARTWORK, BARCODE & SMART QR STUDIO */}
          <PackagingLabelStudio
            productSlug={product.slug}
            initialBarcode={barcodeAttr?.value || "8901911366891"}
            initialArtworkUrl={artworkAttr?.value || ""}
          />

          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#D84315",
                "&:hover": { bgcolor: "#BF360C" },
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                px: 4,
                py: 1.5,
              }}
            >
              Save Product &amp; Packaging Changes
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
        🏷️ Variants &amp; Stock Summary
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", mb: 4, maxWidth: 900 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Pack Size</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock on Hand</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {product.variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell sx={{ fontFamily: "monospace", fontWeight: 700 }}>{v.sku}</TableCell>
                <TableCell>{v.packSize}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>₹{v.price.toString()}</TableCell>
                <TableCell>
                  {v.inventoryStock.reduce((sum, s) => sum + s.quantityOnHand, 0)} units
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <form action={deleteProductAction}>
        <input type="hidden" name="productId" value={product.id} />
        <Button type="submit" color="error" variant="outlined" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}>
          Delete Product
        </Button>
      </form>
    </Box>
  );
}
