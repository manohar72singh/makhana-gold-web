import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { prisma } from "@/lib/db";
import { BroadcastFormClient } from "./BroadcastFormClient";
import { deleteBroadcastLogAction } from "./actions";

export default async function AdminBroadcastPage() {
  const [customers, subscribers, logs] = await Promise.all([
    prisma.customer.findMany({
      select: { email: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.newsletterSubscriber.findMany({
      where: { status: "active" },
      select: { email: true },
    }),
    prisma.broadcastLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const customerEmails = new Set(customers.map((c) => c.email.toLowerCase()));
  const uniqueCommunityCount = new Set([
    ...customers.map((c) => c.email.toLowerCase()),
    ...subscribers.map((s) => s.email.toLowerCase()),
  ]).size;

  const counts = {
    customersCount: customers.length,
    subscribersCount: subscribers.length,
    communityCount: uniqueCommunityCount,
    customers,
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          📢 Email Broadcast &amp; Notification Engine
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dispatch luxury marketing announcements, festival offers, and store notices in 1-click to all customers, newsletter subscribers, or individual recipients.
        </Typography>
      </Box>

      {/* Main Composer & Live Preview */}
      <BroadcastFormClient counts={counts} />

      {/* Broadcast History & Logs Table */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <MarkEmailReadIcon color="primary" /> Recent Sent Broadcasts History
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject &amp; Headline</TableCell>
              <TableCell>Audience Target</TableCell>
              <TableCell align="center">Recipients</TableCell>
              <TableCell>Coupon Attached</TableCell>
              <TableCell>Dispatched By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {log.subject}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {log.headline}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      log.audience === "entire_community"
                        ? "Entire Community"
                        : log.audience === "all_customers"
                        ? "All Customers"
                        : log.audience === "all_subscribers"
                        ? "Newsletter Subscribers"
                        : `Individual (${log.targetEmail})`
                    }
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ fontWeight: 600, textTransform: "capitalize", fontSize: "11px" }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip label={log.recipientCount} size="small" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell>
                  {log.couponCode ? (
                    <Chip label={log.couponCode} size="small" color="success" sx={{ fontWeight: 700 }} />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      None
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: "13px" }}>
                    {log.sentByAdmin || "Admin"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: "12px", color: "text.secondary" }}>
                  {log.createdAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.status === "sent" ? "Dispatched" : "Failed"}
                    color={log.status === "sent" ? "success" : "error"}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: "11px" }}
                  />
                </TableCell>
                <TableCell align="right">
                  <form action={deleteBroadcastLogAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={log.id} />
                    <Button
                      type="submit"
                      size="small"
                      color="error"
                      sx={{ minWidth: 32, p: 0.5 }}
                      title="Delete History Log"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No previous broadcast logs found. Compose your first campaign above to notify your community.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
