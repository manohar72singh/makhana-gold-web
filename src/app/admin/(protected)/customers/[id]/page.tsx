import Link from "next/link";
import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { prisma } from "@/lib/db";

export default async function AdminCustomerDetailPage({
  params,
}: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const customerId = Number(id);

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      addresses: true,
      wishlists: { include: { product: true } },
    },
  });
  if (!customer) notFound();

  const ltv = customer.orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {customer.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {customer.email} {customer.phone ? `• ${customer.phone}` : ""}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Total Orders
            </Typography>
            <Typography variant="h5">{customer.orders.length}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Lifetime Value
            </Typography>
            <Typography variant="h5">₹{ltv.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Wishlist Items
            </Typography>
            <Typography variant="h5">{customer.wishlists.length}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Addresses
            </Typography>
            <Typography variant="h5">{customer.addresses.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order History
        </Typography>
        {customer.orders.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No orders yet.
          </Typography>
        ) : (
          customer.orders.map((o) => (
            <Stack
              key={o.id}
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Link href={`/admin/orders/${o.orderNumber}`} style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                  {o.orderNumber}
                </Typography>
              </Link>
              <Chip label={o.status} size="small" />
              <Typography variant="body2">₹{o.grandTotal.toString()}</Typography>
            </Stack>
          ))
        )}
      </Paper>
    </>
  );
}
