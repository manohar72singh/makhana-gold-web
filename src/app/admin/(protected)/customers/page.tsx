import Link from "next/link";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";
import { prisma } from "@/lib/db";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { orders: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Customers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {customers.length} customers
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Lifetime Value</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((c) => {
              const ltv = c.orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
              return (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Link href={`/admin/customers/${c.id}`} style={{ textDecoration: "none" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} color="primary.main">
                        {c.name ?? "—"}
                      </Typography>
                    </Link>
                  </TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.orders.length}</TableCell>
                  <TableCell>₹{ltv.toFixed(2)}</TableCell>
                  <TableCell>{c.createdAt.toLocaleDateString("en-IN")}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
