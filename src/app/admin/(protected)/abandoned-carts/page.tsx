import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { prisma } from "@/lib/db";

export default async function AdminAbandonedCartsPage() {
  // Server Component: evaluated fresh per request, not a re-rendering client
  // hook, so reading the current time here is safe despite the purity lint.
  // eslint-disable-next-line react-hooks/purity
  const cutoff = new Date(Date.now() - 1000 * 60 * 60); // idle for 1+ hour

  const carts = await prisma.cart.findMany({
    where: {
      status: "active",
      customerId: { not: null },
      updatedAt: { lt: cutoff },
      items: { some: {} },
    },
    include: {
      customer: true,
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Abandoned Carts
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Carts idle for over an hour with items still in them — {carts.length} found.
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Cart Value</TableCell>
              <TableCell>Last Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carts.map((c) => {
              const value = c.items.reduce((sum, i) => sum + Number(i.priceAtAdd) * i.quantity, 0);
              return (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {c.customer?.name ?? "—"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.customer?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {c.items.map((i) => i.variant.product.name).join(", ")}
                  </TableCell>
                  <TableCell>₹{value.toFixed(2)}</TableCell>
                  <TableCell>{c.updatedAt.toLocaleString("en-IN")}</TableCell>
                </TableRow>
              );
            })}
            {carts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No abandoned carts right now.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
