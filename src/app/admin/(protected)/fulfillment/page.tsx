import Link from "next/link";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import PrintIcon from "@mui/icons-material/PrintOutlined";
import ReceiptIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNewOutlined";
import { prisma } from "@/lib/db";
import { dispatchOrderAwbAction } from "./actions";

export default async function AdminFulfillmentPage() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["confirmed", "processing", "shipped"] } },
    include: { customer: true, items: true, shippingAddress: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <div>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
            Logistics &amp; Order Fulfillment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Orders awaiting processing, packing, or in transit — <strong>{orders.length}</strong> in queue.
          </Typography>
        </div>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ship To</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Courier / AWB</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} hover>
                <TableCell>
                  <Link href={`/admin/orders/${o.orderNumber}`} style={{ textDecoration: "none" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} color="primary.main">
                      {o.orderNumber}
                    </Typography>
                  </Link>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {o.customer.name || "Customer"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {o.customer.phone || o.customer.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  {o.shippingAddress ? (
                    <div>
                      <Typography variant="body2">
                        {o.shippingAddress.city}, {o.shippingAddress.state}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                        PIN: {o.shippingAddress.pincode}
                      </Typography>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {o.items.length} item(s)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ₹{Number(o.grandTotal).toLocaleString("en-IN")}
                  </Typography>
                </TableCell>
                <TableCell>
                  {o.trackingNumber ? (
                    <div>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocalShippingIcon sx={{ fontSize: 16, color: "primary.main" }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {o.courierPartner || "Delhivery"}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary", display: "block" }}>
                        {o.trackingNumber}
                      </Typography>
                    </div>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      Awaiting Assignment
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={o.status.toUpperCase()}
                    size="small"
                    color={o.status === "shipped" ? "success" : o.status === "processing" ? "info" : "warning"}
                    sx={{ fontWeight: 700, fontSize: "10.5px" }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", alignItems: "center" }}>
                    {o.status !== "shipped" ? (
                      <form action={dispatchOrderAwbAction} style={{ display: "inline-flex", gap: "6px" }}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <select
                          name="courier"
                          defaultValue="Delhivery Express"
                          style={{
                            fontSize: "12px",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            outline: "none",
                            background: "#fff",
                          }}
                        >
                          <option value="Delhivery Express">Delhivery Air</option>
                          <option value="Shiprocket Direct">Shiprocket Express</option>
                          <option value="BlueDart Air">Blue Dart Air</option>
                        </select>
                        <Button
                          type="submit"
                          size="small"
                          variant="contained"
                          sx={{ textTransform: "none", fontSize: "12px", borderRadius: "8px", fontWeight: 700 }}
                        >
                          Dispatch &amp; AWB
                        </Button>
                      </form>
                    ) : (
                      <>
                        <Tooltip title="Print Barcode Shipping Label">
                          <IconButton
                            size="small"
                            component="a"
                            href={`/api/shipping-label/${o.orderNumber}`}
                            target="_blank"
                            color="primary"
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download GST Invoice">
                          <IconButton
                            size="small"
                            component="a"
                            href={`/api/invoice/${o.orderNumber}`}
                            target="_blank"
                            color="primary"
                          >
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Live Track on Storefront">
                          <IconButton
                            size="small"
                            component="a"
                            href={`/track?order=${o.orderNumber}`}
                            target="_blank"
                            color="secondary"
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No orders currently in the fulfillment queue.
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
