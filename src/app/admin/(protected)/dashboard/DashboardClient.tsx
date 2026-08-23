"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

// Icons
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupeeOutlined";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBagOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCardOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmberOutlined";
import AddBoxIcon from "@mui/icons-material/AddBoxOutlined";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInboxOutlined";
import LocalOfferIcon from "@mui/icons-material/LocalOfferOutlined";
import ViewCarouselIcon from "@mui/icons-material/ViewCarouselOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgentOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";

interface DashboardData {
  stats: {
    totalRevenue: number;
    paidRevenue: number;
    totalOrders: number;
    pendingFulfillment: number;
    totalCustomers: number;
    newsletterSubscribers: number;
    totalProducts: number;
    lowStockCount: number;
    newInquiriesCount: number;
    razorpayRevenue: number;
    codRevenue: number;
  };
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    grandTotal: number;
    status: string;
    paymentStatus: string;
    paymentReference: string | null;
    createdAt: string;
    itemsCount: number;
  }>;
  topProducts: Array<{
    name: string;
    unitsSold: number;
    revenue: number;
  }>;
  recentBroadcasts: Array<{
    id: number;
    subject: string;
    audience: string;
    recipientCount: number;
    createdAt: string;
  }>;
  lowStockItems: Array<{
    productName: string;
    variantName: string;
    stock: number;
  }>;
}

export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    
    // Auto-refresh data every 30 seconds for live updates
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 600);
  };

  const { stats, recentOrders, topProducts, recentBroadcasts, lowStockItems } = data;
  const razorpayPercent = stats.totalRevenue > 0 ? (stats.razorpayRevenue / stats.totalRevenue) * 100 : 0;
  const codPercent = stats.totalRevenue > 0 ? (stats.codRevenue / stats.totalRevenue) * 100 : 0;

  return (
    <Box sx={{ pb: 6 }}>
      {/* 🟢 TOP REAL-TIME COMMAND HEADER */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1C150C" }}>
              Makhana Gold Master Command
            </Typography>
            <Chip
              label="🟢 Live Store Online"
              size="small"
              sx={{
                bgcolor: "success.50",
                color: "success.dark",
                fontWeight: 700,
                fontSize: "11px",
                border: "1px solid",
                borderColor: "success.light",
              }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Real-time financial pulse, live order pipeline, and master store controls.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", md: "inline" } }}>
              Live Sync: {lastUpdated}
            </Typography>
          )}
          <Tooltip title="Refresh Realtime Data">
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{ bgcolor: "white", border: "1px solid #EFE8DA", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}
            >
              <RefreshIcon
                fontSize="small"
                sx={{
                  animation: isRefreshing ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
                }}
              />
            </IconButton>
          </Tooltip>
          <Button
            component={Link}
            href="/admin/products/new"
            variant="contained"
            startIcon={<AddBoxIcon />}
            sx={{
              bgcolor: "#D84315",
              "&:hover": { bgcolor: "#BF360C" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(216,67,21,0.25)",
            }}
          >
            New Product
          </Button>
        </Stack>
      </Stack>

      {/* ⚡ 1-CLICK QUICK ACTION LAUNCHPAD */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
          mb: 4,
          bgcolor: "#FAF6EE",
          borderColor: "#EFE8DA",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#8B5A2B", textTransform: "uppercase", fontSize: "11px", letterSpacing: 1 }}>
            ⚡ Master Quick Launchpad:
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button
              component={Link}
              href="/admin/broadcast"
              size="small"
              variant="outlined"
              startIcon={<ForwardToInboxIcon />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "white", borderColor: "#E0D7C6" }}
            >
              Send Broadcast Email
            </Button>
            <Button
              component={Link}
              href="/admin/orders"
              size="small"
              variant="outlined"
              startIcon={<LocalShippingIcon />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "white", borderColor: "#E0D7C6" }}
            >
              Manage Orders ({stats.pendingFulfillment} Pending)
            </Button>
            <Button
              component={Link}
              href="/admin/coupons"
              size="small"
              variant="outlined"
              startIcon={<LocalOfferIcon />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "white", borderColor: "#E0D7C6" }}
            >
              Coupons &amp; Offers
            </Button>
            <Button
              component={Link}
              href="/admin/cms/banners"
              size="small"
              variant="outlined"
              startIcon={<ViewCarouselIcon />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "white", borderColor: "#E0D7C6" }}
            >
              Storefront Hero Banners
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 📊 6-METRIC EXECUTIVE KPI GRID */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Gross Revenue */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 0.8, bgcolor: "#D84315", color: "white", borderRadius: 1.5, display: "flex" }}>
                <CurrencyRupeeIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Gross Revenue
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1C150C" }}>
              ₹{stats.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
            </Typography>
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <TrendingUpIcon fontSize="inherit" /> All Orders
            </Typography>
          </Paper>
        </Grid>

        {/* Collected Razorpay */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 0.8, bgcolor: "primary.main", color: "white", borderRadius: 1.5, display: "flex" }}>
                <CreditCardIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Razorpay Online
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
              ₹{stats.razorpayRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Prepaid Volume
            </Typography>
          </Paper>
        </Grid>

        {/* Orders Pipeline */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 0.8, bgcolor: "info.main", color: "white", borderRadius: 1.5, display: "flex" }}>
                <ShoppingBagIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Total Orders
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {stats.totalOrders}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lifetime Transactions
            </Typography>
          </Paper>
        </Grid>

        {/* Pending Fulfillment */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              height: "100%",
              borderColor: stats.pendingFulfillment > 0 ? "warning.main" : "divider",
              bgcolor: stats.pendingFulfillment > 0 ? "warning.50" : "white",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 0.8, bgcolor: "warning.main", color: "white", borderRadius: 1.5, display: "flex" }}>
                <LocalShippingIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "warning.dark", textTransform: "uppercase" }}>
                Need Dispatch
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, color: stats.pendingFulfillment > 0 ? "warning.dark" : "text.primary" }}>
              {stats.pendingFulfillment}
            </Typography>
            <Typography variant="caption" sx={{ color: "warning.dark", fontWeight: 600 }}>
              Pending Fulfillment
            </Typography>
          </Paper>
        </Grid>

        {/* Customer Base */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 0.8, bgcolor: "success.main", color: "white", borderRadius: 1.5, display: "flex" }}>
                <PeopleIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Community
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {stats.totalCustomers + stats.newsletterSubscribers}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stats.totalCustomers} Users / {stats.newsletterSubscribers} Subs
            </Typography>
          </Paper>
        </Grid>

        {/* Attention Alerts */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              height: "100%",
              borderColor: stats.lowStockCount > 0 || stats.newInquiriesCount > 0 ? "error.light" : "divider",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 0.8, bgcolor: stats.lowStockCount > 0 ? "error.main" : "grey.500", color: "white", borderRadius: 1.5, display: "flex" }}>
                <WarningAmberIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Store Alerts
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, color: stats.lowStockCount > 0 ? "error.main" : "text.primary" }}>
              {stats.lowStockCount + stats.newInquiriesCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stats.lowStockCount} Low Stock / {stats.newInquiriesCount} Leads
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <Grid container spacing={3}>
        {/* LEFT COLUMN: LIVE ORDERS & REVENUE SPLIT */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Live Recent Orders Feed */}
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
            <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid", borderColor: "divider" }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  🛍️ Live Order Processing Feed
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Recent customer purchases across online &amp; COD channels
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/admin/orders"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                View All Orders
              </Button>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Mode</TableCell>
                  <TableCell>Order Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>
                      <Link href={`/admin/orders/${o.orderNumber}`} style={{ color: "#D84315", textDecoration: "none" }}>
                        {o.orderNumber}
                      </Link>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {o.itemsCount} item(s)
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
                        {o.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {o.createdAt}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#1C150C" }}>
                      ₹{o.grandTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {o.paymentReference ? (
                        <Chip
                          icon={<CreditCardIcon fontSize="inherit" />}
                          label={o.paymentStatus === "paid" ? "Razorpay Paid" : "Razorpay Pending"}
                          size="small"
                          color={o.paymentStatus === "paid" ? "success" : "warning"}
                          variant="outlined"
                          sx={{ fontSize: "10px", fontWeight: 700 }}
                        />
                      ) : (
                        <Chip
                          label="Cash on Delivery"
                          size="small"
                          color="default"
                          variant="outlined"
                          sx={{ fontSize: "10px" }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={o.status.toUpperCase()}
                        size="small"
                        color={
                          o.status === "delivered"
                            ? "success"
                            : o.status === "shipped"
                            ? "info"
                            : o.status === "processing"
                            ? "primary"
                            : o.status === "pending"
                            ? "warning"
                            : "error"
                        }
                        sx={{ fontSize: "10px", fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        href={`/admin/orders/${o.orderNumber}`}
                        size="small"
                        variant="text"
                        sx={{ textTransform: "none", fontSize: "12px", fontWeight: 700 }}
                      >
                        Manage →
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No orders placed yet. As customers shop, they appear here in real-time.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          {/* Payment Split Breakdown Bar */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              💳 Revenue Distribution by Payment Gateway
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: "#FAF6EE", borderRadius: 2, border: "1px solid #EFE8DA" }}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      Razorpay Online (UPI/Cards)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      ₹{stats.razorpayRevenue.toFixed(0)} ({razorpayPercent.toFixed(0)}%)
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={razorpayPercent} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: "#FAF6EE", borderRadius: 2, border: "1px solid #EFE8DA" }}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "warning.dark" }}>
                      Cash on Delivery (COD)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      ₹{stats.codRevenue.toFixed(0)} ({codPercent.toFixed(0)}%)
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" color="warning" value={codPercent} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: ACTION RADAR, BROADCASTS & TOP SELLERS */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Urgent Action Radar */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
              <WarningAmberIcon color="warning" fontSize="small" /> Store Action Radar
            </Typography>

            <Stack spacing={1.5}>
              {stats.pendingFulfillment > 0 ? (
                <Box sx={{ p: 1.5, bgcolor: "warning.50", borderRadius: 2, border: "1px solid", borderColor: "warning.light" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "warning.dark" }}>
                    🚨 {stats.pendingFulfillment} order(s) awaiting shipment
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Pack and assign AWB tracking numbers to dispatch.
                  </Typography>
                  <Button
                    component={Link}
                    href="/admin/fulfillment"
                    size="small"
                    variant="contained"
                    color="warning"
                    sx={{ textTransform: "none", fontSize: "11px", fontWeight: 700, py: 0.5 }}
                  >
                    Go to Fulfillment Center
                  </Button>
                </Box>
              ) : (
                <Box sx={{ p: 1.5, bgcolor: "success.50", borderRadius: 2, border: "1px solid", borderColor: "success.light" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "success.dark" }}>
                    ✓ All orders fulfilled! Zero dispatch backlog.
                  </Typography>
                </Box>
              )}

              {stats.newInquiriesCount > 0 && (
                <Box sx={{ p: 1.5, bgcolor: "info.50", borderRadius: 2, border: "1px solid", borderColor: "info.light" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "info.dark" }}>
                    💬 {stats.newInquiriesCount} new customer inquiry lead(s)
                  </Typography>
                  <Button
                    component={Link}
                    href="/admin/inquiries"
                    size="small"
                    variant="text"
                    color="info"
                    sx={{ textTransform: "none", fontSize: "11px", fontWeight: 700, p: 0 }}
                  >
                    Reply to Leads →
                  </Button>
                </Box>
              )}

              {lowStockItems.length > 0 && (
                <Box sx={{ p: 1.5, bgcolor: "error.50", borderRadius: 2, border: "1px solid", borderColor: "error.light" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "error.dark", mb: 0.5 }}>
                    ⚠️ Low Stock Warning (&lt;10 units)
                  </Typography>
                  {lowStockItems.slice(0, 3).map((item, idx) => (
                    <Typography key={idx} variant="caption" sx={{ display: "block", color: "error.dark" }}>
                      • {item.productName} ({item.variantName}): <strong>{item.stock} left</strong>
                    </Typography>
                  ))}
                  <Button
                    component={Link}
                    href="/admin/inventory"
                    size="small"
                    variant="text"
                    color="error"
                    sx={{ textTransform: "none", fontSize: "11px", fontWeight: 700, p: 0, mt: 0.5 }}
                  >
                    Restock Warehouse →
                  </Button>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Top Selling Products Leaderboard */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              🏆 Top Selling Harvest Picks
            </Typography>
            <Stack spacing={1.5}>
              {topProducts.map((p, idx) => (
                <Box key={p.name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
                    #{idx + 1} {p.name}
                  </Typography>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main" }}>
                      ₹{p.revenue.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.unitsSold} units
                    </Typography>
                  </Box>
                </Box>
              ))}
              {topProducts.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  Sales leaderboard will populate with customer orders.
                </Typography>
              )}
            </Stack>
          </Paper>

          {/* Recent Broadcast Campaigns */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                📢 Recent Broadcasts
              </Typography>
              <Button component={Link} href="/admin/broadcast" size="small" sx={{ textTransform: "none", fontSize: "12px", fontWeight: 700 }}>
                New Campaign
              </Button>
            </Box>
            <Stack spacing={1.5}>
              {recentBroadcasts.map((b) => (
                <Box key={b.id} sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 2, border: "1px solid #ECE4D8" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "12px", lineHeight: 1.3, mb: 0.5 }}>
                    {b.subject}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Chip label={b.audience} size="small" sx={{ fontSize: "10px", height: 20 }} />
                    <Typography variant="caption" color="text.secondary">
                      {b.recipientCount} sent • {b.createdAt}
                    </Typography>
                  </Stack>
                </Box>
              ))}
              {recentBroadcasts.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No marketing broadcasts sent yet.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
