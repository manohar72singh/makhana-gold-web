import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { prisma } from "@/lib/db";
import { updateInquiryStatusAction } from "./actions";

export default async function AdminInquiriesPage() {
  const [inquiries, subscribers] = await Promise.all([
    prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Customer Inquiries &amp; Leads
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Direct customer inquiries, corporate gifting leads, and newsletter subscribers.
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Total Inquiries
            </Typography>
            <Typography variant="h4">{inquiries.length}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid", borderLeftColor: "warning.main" }}
          >
            <Typography variant="overline" color="text.secondary">
              New / Pending
            </Typography>
            <Typography variant="h4">
              {inquiries.filter((i) => i.status === "new").length}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid", borderLeftColor: "success.main" }}
          >
            <Typography variant="overline" color="text.secondary">
              Newsletter Subscribers
            </Typography>
            <Typography variant="h4">{subscribers.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Inquiries Table */}
      <Typography variant="h6" gutterBottom>
        Contact &amp; Corporate Inquiries
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, mb: 5 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inquiries.map((inq) => (
              <TableRow key={inq.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {inq.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {inq.email}
                  </Typography>
                  {inq.phone && (
                    <Typography variant="caption" color="text.secondary">
                      {inq.phone}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{inq.subject}</TableCell>
                <TableCell sx={{ maxWidth: 320 }}>
                  <Typography variant="body2" sx={{ fontSize: "12px", color: "text.secondary" }}>
                    {inq.message}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={inq.status}
                    size="small"
                    color={
                      inq.status === "resolved"
                        ? "success"
                        : inq.status === "in_progress"
                        ? "warning"
                        : "info"
                    }
                  />
                </TableCell>
                <TableCell sx={{ fontSize: "12px" }}>
                  {inq.createdAt.toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell align="right">
                  {inq.status !== "resolved" ? (
                    <form action={updateInquiryStatusAction} style={{ display: "inline" }}>
                      <input type="hidden" name="inquiryId" value={inq.id} />
                      <input type="hidden" name="status" value="resolved" />
                      <Button
                        type="submit"
                        size="small"
                        variant="outlined"
                        color="success"
                        sx={{ textTransform: "none", fontSize: "11px", borderRadius: 2 }}
                      >
                        Mark Resolved
                      </Button>
                    </form>
                  ) : (
                    <Chip label="Completed" size="small" variant="outlined" color="success" />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  No customer inquiries received yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Newsletter Subscribers Table */}
      <Typography variant="h6" gutterBottom>
        Newsletter Subscribers
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Coupon Dispatched</TableCell>
              <TableCell>Subscribed Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscribers.map((sub) => (
              <TableRow key={sub.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{sub.email}</TableCell>
                <TableCell>
                  <Chip
                    label={sub.status}
                    size="small"
                    color={sub.status === "active" ? "success" : "default"}
                  />
                </TableCell>
                <TableCell sx={{ textTransform: "capitalize" }}>{sub.source}</TableCell>
                <TableCell sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                  {sub.couponSent || "GOLDEN15"}
                </TableCell>
                <TableCell sx={{ fontSize: "12px" }}>
                  {sub.createdAt.toLocaleDateString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
            {subscribers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  No newsletter subscribers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
