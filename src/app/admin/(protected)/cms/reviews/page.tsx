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
import Rating from "@mui/material/Rating";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import BlockIcon from "@mui/icons-material/Block";
import { prisma } from "@/lib/db";
import { updateReviewStatusAction, deleteReviewAction } from "../actions";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Storefront Reviews &amp; Testimonials
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Moderate customer product reviews. Approved reviews appear automatically in the &ldquo;Praise From Conscious Pantries&rdquo; carousel on the homepage and product pages.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Rating &amp; Title</TableCell>
              <TableCell>Review Feedback</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.customer?.name || "Verified Customer"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.customer?.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {r.product?.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Rating value={r.rating} readOnly size="small" sx={{ mb: 0.5 }} />
                  {r.title && (
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "12px" }}>
                      {r.title}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 320 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "13px" }}>
                    &ldquo;{r.body}&rdquo;
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: "12px" }}>
                  {r.createdAt.toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell>
                  <Chip
                    label={r.isApproved ? "Approved (Live)" : "Pending / Hidden"}
                    color={r.isApproved ? "success" : "warning"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                    <form action={updateReviewStatusAction} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="isApproved" value={String(!r.isApproved)} />
                      <Button
                        type="submit"
                        size="small"
                        variant="outlined"
                        color={r.isApproved ? "warning" : "success"}
                        startIcon={r.isApproved ? <BlockIcon /> : <CheckCircleIcon />}
                        sx={{ textTransform: "none", fontSize: "11px", borderRadius: 2 }}
                      >
                        {r.isApproved ? "Unapprove" : "Approve"}
                      </Button>
                    </form>
                    <form action={deleteReviewAction} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button
                        type="submit"
                        size="small"
                        color="error"
                        sx={{ minWidth: 32, p: 0.5 }}
                        title="Delete Review"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </form>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No customer reviews found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
