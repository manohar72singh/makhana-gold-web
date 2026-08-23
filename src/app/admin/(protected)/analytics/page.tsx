import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupeeOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCardOutlined";
import LocalAtmIcon from "@mui/icons-material/LocalAtmOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmptyOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import { prisma } from "@/lib/db";

export default async function AdminAnalyticsPage() {
  const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

  const [orders, orderItems, statusGroups, recentTransactions] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } } },
    }),
  ]);

  // Overall Financial Calculations
  const totalGrossRevenue = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const paidRevenue = paidOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

  // Online Razorpay vs COD Split
  const razorpayOrders = orders.filter(
    (o) => o.paymentReference && !o.paymentReference.toLowerCase().includes("sim")
  );
  const razorpayRevenue = razorpayOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

  const codOrders = orders.filter(
    (o) => !o.paymentReference || o.paymentReference.toLowerCase().includes("sim")
  );
  const codRevenue = codOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

  const razorpayPercent = totalGrossRevenue > 0 ? (razorpayRevenue / totalGrossRevenue) * 100 : 0;
  const codPercent = totalGrossRevenue > 0 ? (codRevenue / totalGrossRevenue) * 100 : 0;

  const avgOrderValue = orders.length ? totalGrossRevenue / orders.length : 0;

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          📊 Store &amp; Payment Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time financial breakdown, Razorpay online payments, and sales metrics (Last 30 Days).
        </Typography>
      </Box>

      {/* KPI STAT CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: "#FAF6EE", borderColor: "#EFE8DA" }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: "#D84315", color: "white", borderRadius: 2, display: "flex" }}>
                <CurrencyRupeeIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Total Revenue
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1C150C" }}>
              ₹{totalGrossRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <TrendingUpIcon fontSize="inherit" /> 30-Day Gross Volume
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: "success.main", color: "white", borderRadius: 2, display: "flex" }}>
                <CheckCircleIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Collected (Paid)
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              ₹{paidRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {paidOrders.length} Paid Transactions
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: "primary.main", color: "white", borderRadius: 2, display: "flex" }}>
                <HourglassEmptyIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Total Orders
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {orders.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              All Channels Combined
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: "info.main", color: "white", borderRadius: 2, display: "flex" }}>
                <CurrencyRupeeIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Avg Order Value
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              ₹{avgOrderValue.toFixed(0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Per Completed Checkout
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* PAYMENT METHODS SPLIT & VOLUME */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        💳 Payment Channel Split (Online Razorpay vs COD)
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box sx={{ p: 1, bgcolor: "primary.50", color: "primary.main", borderRadius: 2, display: "flex" }}>
                  <CreditCardIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Online Prepaid (Razorpay UPI &amp; Cards)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {razorpayOrders.length} orders ({razorpayPercent.toFixed(1)}% of sales)
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                ₹{razorpayRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={razorpayPercent}
              sx={{ height: 8, borderRadius: 4, bgcolor: "grey.100" }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box sx={{ p: 1, bgcolor: "warning.50", color: "warning.dark", borderRadius: 2, display: "flex" }}>
                  <LocalAtmIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Cash on Delivery (COD)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {codOrders.length} orders ({codPercent.toFixed(1)}% of sales)
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                ₹{codRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              color="warning"
              value={codPercent}
              sx={{ height: 8, borderRadius: 4, bgcolor: "grey.100" }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* RECENT TRANSACTIONS LOG & BESTSELLERS */}
      <Grid container spacing={3}>
        {/* Recent Transactions Table */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            📜 Recent Payment Transactions
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Method / Gateway Ref</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{t.orderNumber}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "13px" }}>
                        {t.customer?.name || "Guest"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {t.paymentReference ? (
                        <Chip
                          icon={<CreditCardIcon fontSize="inherit" />}
                          label={t.paymentReference.startsWith("pay_") ? t.paymentReference.slice(0, 14) + "..." : "Razorpay Online"}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: "11px", fontWeight: 600 }}
                        />
                      ) : (
                        <Chip
                          icon={<LocalAtmIcon fontSize="inherit" />}
                          label="Cash on Delivery"
                          size="small"
                          color="default"
                          variant="outlined"
                          sx={{ fontSize: "11px" }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      ₹{Number(t.grandTotal).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.paymentStatus.toUpperCase()}
                        color={t.paymentStatus === "paid" ? "success" : t.paymentStatus === "pending" ? "warning" : "error"}
                        size="small"
                        sx={{ fontSize: "10px", fontWeight: 800 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {recentTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No payment transactions recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Top Products & Order Status Breakdown */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            🏆 Top Selling Flavours
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Units</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.productName}>
                    <TableCell sx={{ fontWeight: 600 }}>{item.productName}</TableCell>
                    <TableCell align="center">{item._sum.quantity}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "primary.main" }}>
                      ₹{item._sum.lineTotal?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {orderItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No sales data yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            📦 Orders by Status
          </Typography>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {statusGroups.map((g) => (
              <Chip key={g.status} label={`${g.status}: ${g._count._all}`} variant="outlined" sx={{ fontWeight: 600 }} />
            ))}
            {statusGroups.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No orders yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
