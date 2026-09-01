import Link from "next/link";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Pagination from "@mui/material/Pagination";
import { prisma } from "@/lib/db";

const STATUS_COLOR: Record<string, "success" | "default" | "warning"> = {
  active: "success",
  draft: "warning",
  archived: "default",
};

const PAGE_SIZE = 8;

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [totalCount, products] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      include: {
        category: true,
        variants: { include: { inventoryStock: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        attributes: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Box sx={{ pb: 6 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 3 }}
      >
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Products &amp; Catalog Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total {totalCount} active items across Makhana, Sattu, and Poha collections.
          </Typography>
        </div>
        <Link href="/admin/products/new" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#D84315",
              "&:hover": { bgcolor: "#BF360C" },
              borderRadius: 2,
              fontWeight: 800,
              textTransform: "none",
            }}
          >
            + Add New Product
          </Button>
        </Link>
      </Stack>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#FAF6EE" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Barcode</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Price Range</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Stock Units</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => {
              const prices = p.variants.map((v) => Number(v.price));
              const min = prices.length ? Math.min(...prices) : 0;
              const max = prices.length ? Math.max(...prices) : 0;
              const totalStock = p.variants.reduce(
                (sum, v) => sum + v.inventoryStock.reduce((sSum, s) => sSum + s.quantityOnHand, 0),
                0
              );
              const barcode = p.attributes.find((a) => a.key === "barcode")?.value || "—";
              const primaryImg = p.images[0]?.url || "/images/vibrant/hero.jpg";

              return (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                      <Avatar
                        src={primaryImg}
                        variant="rounded"
                        sx={{ width: 44, height: 44, bgcolor: "#FAF6EE" }}
                      />
                      <Box>
                        <Link href={`/admin/products/${p.id}`} style={{ textDecoration: "none" }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", "&:hover": { color: "#D84315" } }}>
                            {p.name}
                          </Typography>
                        </Link>
                        <Typography variant="caption" color="text.secondary">
                          {p.variants.length} variant(s)
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={p.category?.name ?? "Superfood"}
                      size="small"
                      sx={{ bgcolor: "#FAF6EE", fontWeight: 700, fontSize: "11px" }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                      {barcode}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#D84315" }}>
                      {prices.length ? (min === max ? `₹${min}` : `₹${min} – ₹${max}`) : "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: totalStock === 0 ? "error.main" : totalStock <= 15 ? "warning.main" : "success.main",
                      }}
                    >
                      {totalStock} units
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip label={p.status} size="small" color={STATUS_COLOR[p.status]} sx={{ fontWeight: 700 }} />
                  </TableCell>

                  <TableCell align="right">
                    <Link href={`/admin/products/${p.id}`} style={{ textDecoration: "none" }}>
                      <Button size="small" variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}>
                        Edit →
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Admin Pagination Controls */}
      {totalPages > 1 && (
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mt: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Page {page} of {totalPages} ({totalCount} items)
          </Typography>
          <Stack direction="row" spacing={1}>
            {page > 1 && (
              <Link href={`/admin/products?page=${page - 1}`} style={{ textDecoration: "none" }}>
                <Button variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: 2 }}>
                  ← Previous
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/products?page=${page + 1}`} style={{ textDecoration: "none" }}>
                <Button variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: 2 }}>
                  Next →
                </Button>
              </Link>
            )}
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
