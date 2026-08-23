import Link from "next/link";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import { prisma } from "@/lib/db";

const STATUS_COLOR: Record<string, "success" | "default" | "warning" | "error" | "info"> = {
  pending: "default",
  confirmed: "info",
  processing: "warning",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
  returned: "error",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {orders.length} orders
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} hover>
                <TableCell>
                  <Link href={`/admin/orders/${o.orderNumber}`} style={{ textDecoration: "none" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} color="primary.main">
                      {o.orderNumber}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>{o.customer.name ?? o.customer.email}</TableCell>
                <TableCell>{o.items.length}</TableCell>
                <TableCell>₹{o.grandTotal.toString()}</TableCell>
                <TableCell>
                  <Chip
                    label={o.paymentStatus}
                    size="small"
                    color={o.paymentStatus === "paid" ? "success" : "default"}
                  />
                </TableCell>
                <TableCell>
                  <Chip label={o.status} size="small" color={STATUS_COLOR[o.status]} />
                </TableCell>
                <TableCell>{o.createdAt.toLocaleDateString("en-IN")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
