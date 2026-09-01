import Link from "next/link";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { prisma } from "@/lib/db";
import { adjustStockAction } from "./actions";

const PAGE_SIZE = 20;

export default async function AdminInventoryPage({
  searchParams,
}: PageProps<"/admin/inventory">) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [totalCount, stock, totalOnHandAgg, outOfStock, lowStockRows] = await Promise.all([
    prisma.inventoryStock.count(),
    prisma.inventoryStock.findMany({
      include: { variant: { include: { product: true } }, warehouse: true },
      orderBy: { quantityOnHand: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.inventoryStock.aggregate({ _sum: { quantityOnHand: true } }),
    prisma.inventoryStock.count({ where: { quantityOnHand: 0 } }),
    prisma.$queryRaw<
      { c: bigint }[]
    >`SELECT COUNT(*) as c FROM inventory_stock WHERE quantity_on_hand > 0 AND quantity_on_hand <= reorder_threshold`,
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const totalOnHand = totalOnHandAgg._sum.quantityOnHand ?? 0;
  const lowStock = Number(lowStockRows[0]?.c ?? 0);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Inventory Control
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage stock levels across all warehouses.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Total Stock On Hand
            </Typography>
            <Typography variant="h4">{totalOnHand}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid", borderLeftColor: "secondary.main" }}>
            <Typography variant="overline" color="text.secondary">
              Low Stock SKUs
            </Typography>
            <Typography variant="h4">{lowStock}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid", borderLeftColor: "#D84315" }}>
            <Typography variant="overline" color="text.secondary">
              Out of Stock
            </Typography>
            <Typography variant="h4">{outOfStock}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Adjust</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stock.map((s) => {
              const status =
                s.quantityOnHand === 0 ? "out" : s.quantityOnHand <= s.reorderThreshold ? "low" : "ok";
              return (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {s.variant.product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.variant.packSize}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{s.variant.sku}</TableCell>
                  <TableCell>{s.warehouse.name}</TableCell>
                  <TableCell>{s.quantityOnHand}</TableCell>
                  <TableCell>
                    <Chip
                      label={status === "ok" ? "In Stock" : status === "low" ? "Low Stock" : "Out of Stock"}
                      size="small"
                      color={status === "ok" ? "success" : status === "low" ? "warning" : "error"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                      <form action={adjustStockAction}>
                        <input type="hidden" name="stockId" value={s.id} />
                        <input type="hidden" name="delta" value={-10} />
                        <IconButton size="small" type="submit">
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </form>
                      <form action={adjustStockAction}>
                        <input type="hidden" name="stockId" value={s.id} />
                        <input type="hidden" name="delta" value={10} />
                        <IconButton size="small" type="submit">
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </form>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mt: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Page {page} of {totalPages} ({totalCount} items)
          </Typography>
          <Stack direction="row" spacing={1}>
            {page > 1 && (
              <Link href={`/admin/inventory?page=${page - 1}`} style={{ textDecoration: "none" }}>
                <Button variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: 2 }}>
                  ← Previous
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/inventory?page=${page + 1}`} style={{ textDecoration: "none" }}>
                <Button variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: 2 }}>
                  Next →
                </Button>
              </Link>
            )}
          </Stack>
        </Stack>
      )}
    </>
  );
}
