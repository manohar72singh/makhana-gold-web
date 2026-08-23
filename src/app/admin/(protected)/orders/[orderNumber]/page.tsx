import Link from "next/link";
import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { prisma } from "@/lib/db";
import { updateOrderStatusAction, dispatchCourierOrderAction } from "../actions";
import { ControlledSelectField } from "@/components/admin/ControlledSelectField";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

const COURIER_OPTIONS = [
  { value: "Delhivery Express Surface", label: "Delhivery Express (Surface / Air)" },
  { value: "Shiprocket Air Priority", label: "Shiprocket (Air Priority)" },
  { value: "Bluedart Express", label: "Blue Dart (Express Air)" },
  { value: "DTDC Premium", label: "DTDC (Premium Courier)" },
];

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/orders/[orderNumber]">) {
  const { orderNumber } = await params;

  const order = await prisma.order.findFirst({
    where: { orderNumber },
    include: {
      customer: true,
      items: true,
      shippingAddress: true,
      statusHistory: { orderBy: { createdAt: "desc" }, include: { changedByAdmin: true } },
    },
  });
  if (!order) notFound();

  const isShipped = order.status === "shipped" || order.status === "delivered";

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 3 }}
      >
        <div>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Order #{order.orderNumber}
            </Typography>
            <Chip
              label={order.status.toUpperCase()}
              color={
                order.status === "delivered"
                  ? "success"
                  : order.status === "shipped"
                  ? "primary"
                  : order.status === "cancelled"
                  ? "error"
                  : "warning"
              }
              size="small"
              sx={{ fontWeight: 800 }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Placed on {order.createdAt.toLocaleString("en-IN")} • Payment: {order.paymentStatus === "paid" ? "PREPAID" : "COD"} ({order.paymentStatus.toUpperCase()})
          </Typography>
        </div>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Link
            href={`/api/shipping-label/${order.orderNumber}`}
            target="_blank"
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="outlined"
              sx={{
                borderColor: "#1C150C",
                color: "#1C150C",
                "&:hover": { borderColor: "#D84315", color: "#D84315", bgcolor: "#FAF6EE" },
                fontWeight: 800,
                borderRadius: 2,
                textTransform: "none",
                px: 2.5,
              }}
            >
              📦 Print 4x6 Shipping Label ↗
            </Button>
          </Link>

          <Link
            href={`/api/invoice/${order.orderNumber}`}
            target="_blank"
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="contained"
              sx={{
                bgcolor: "#D84315",
                "&:hover": { bgcolor: "#BF360C" },
                fontWeight: 800,
                borderRadius: 2,
                textTransform: "none",
                px: 2.5,
              }}
            >
              🖨️ Print GST Tax Invoice ↗
            </Button>
          </Link>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Left Column: Items & Customer Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </Typography>
            {order.items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                sx={{ justifyContent: "space-between", py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
              >
                <div>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.productName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pack: {item.variantName} • Qty: {item.quantity}
                  </Typography>
                </div>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  ₹{Number(item.lineTotal).toFixed(2)}
                </Typography>
              </Stack>
            ))}

            <Stack spacing={1} sx={{ pt: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">₹{Number(order.subtotal).toFixed(2)}</Typography>
              </Stack>
              {Number(order.discountTotal) > 0 && (
                <Stack direction="row" sx={{ justifyContent: "space-between", color: "success.main" }}>
                  <Typography variant="body2">Discounts (Coupon &amp; Prepaid UPI)</Typography>
                  <Typography variant="body2">-₹{Number(order.discountTotal).toFixed(2)}</Typography>
                </Stack>
              )}
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Shipping Fee</Typography>
                <Typography variant="body2">
                  {Number(order.shippingTotal) === 0 ? "FREE" : `₹${Number(order.shippingTotal).toFixed(2)}`}
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">GST (5%)</Typography>
                <Typography variant="body2">₹{Number(order.taxTotal).toFixed(2)}</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Grand Total</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#D84315" }}>
                  ₹{Number(order.grandTotal).toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer &amp; Delivery Destination
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Email: {order.customer.email} • Phone: {order.customer.phone || "N/A"}
            </Typography>
            {order.shippingAddress && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Shipping Address
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                  <strong>{order.shippingAddress.pincode}</strong>
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Logistics Dispatch & Status History */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* 🚚 1-Click Courier Fulfillment Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              mb: 3,
              bgcolor: isShipped ? "#FAF6EE" : "#fff",
              border: isShipped ? "2px solid #D84315" : "1px solid rgba(0,0,0,0.12)",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#1C150C" }}>
                🚚 Courier Fulfillment &amp; AWB
              </Typography>
            </Stack>

            {isShipped ? (
              <Stack spacing={1.5}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Carrier:</strong> {order.courierPartner || "Delhivery Express"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>AWB Tracking #:</strong>{" "}
                  <code style={{ background: "#eee", padding: "2px 6px", borderRadius: 4, fontWeight: "bold" }}>
                    {order.trackingNumber || "N/A"}
                  </code>
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Link
                  href={`/track?order=${order.orderNumber}`}
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: "#25D366", "&:hover": { bgcolor: "#1EBE5D" }, textTransform: "none", fontWeight: 700 }}
                  >
                    📍 Live Public Tracking View ↗
                  </Button>
                </Link>
              </Stack>
            ) : (
              <Stack component="form" action={dispatchCourierOrderAction} spacing={2}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="orderNumber" value={order.orderNumber} />
                <Typography variant="body2" color="text.secondary">
                  Generate courier Airway Bill (AWB), dispatch package, and automatically email tracking link to customer.
                </Typography>
                <ControlledSelectField
                  name="courierPartner"
                  label="Select Courier Partner"
                  defaultValue="Delhivery Express Surface"
                  options={COURIER_OPTIONS}
                  fullWidth
                />
                <TextField
                  name="trackingNumber"
                  label="AWB Tracking # (Leave blank for auto-generate)"
                  placeholder="e.g. DEL-849204912"
                  fullWidth
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: "#1C150C",
                    "&:hover": { bgcolor: "#D84315" },
                    fontWeight: 800,
                    textTransform: "none",
                    py: 1.2,
                  }}
                >
                  ⚡ Generate AWB &amp; Mark Dispatched
                </Button>
              </Stack>
            )}
          </Paper>

          {/* Standard Status Update Card */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Update Order Status
            </Typography>
            <Stack component="form" action={updateOrderStatusAction} spacing={2}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <ControlledSelectField
                name="status"
                label="Status"
                defaultValue={order.status}
                options={STATUSES.map((s) => ({ value: s, label: s }))}
                fullWidth
              />
              <TextField name="note" label="Note (optional)" fullWidth multiline rows={2} />
              <Button type="submit" variant="outlined" sx={{ textTransform: "none", fontWeight: 700 }}>
                Update Status
              </Button>
            </Stack>
          </Paper>

          {/* Status Timeline History */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status Audit History
            </Typography>
            {order.statusHistory.map((h) => (
              <Stack key={h.id} sx={{ mb: 2, pb: 1, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                  {h.status}
                </Typography>
                {h.note && (
                  <Typography variant="body2" color="text.secondary">
                    {h.note}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {h.createdAt.toLocaleString("en-IN")}
                  {h.changedByAdmin ? ` • Admin: ${h.changedByAdmin.name}` : ""}
                </Typography>
              </Stack>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
