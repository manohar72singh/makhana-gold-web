import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
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
import { updateReturnStatusAction } from "./actions";
import { ControlledSelectField } from "@/components/admin/ControlledSelectField";

const RETURN_STATUS_OPTIONS = [
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "refunded", label: "Refunded" },
];

const STATUS_COLOR: Record<string, "warning" | "success" | "error" | "default"> = {
  requested: "warning",
  approved: "success",
  rejected: "error",
  refunded: "default",
};

export default async function AdminReturnsPage() {
  const returns = await prisma.return.findMany({
    include: { order: true, orderItem: true, customer: true },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Returns & Refunds
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {returns.length} return requests
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Update</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {returns.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontFamily: "monospace" }}>{r.order.orderNumber}</TableCell>
                <TableCell>{r.customer.name}</TableCell>
                <TableCell>{r.orderItem.productName}</TableCell>
                <TableCell sx={{ maxWidth: 240 }}>
                  <Typography variant="body2" noWrap title={r.reason}>
                    {r.reason}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={r.status} size="small" color={STATUS_COLOR[r.status]} />
                </TableCell>
                <TableCell align="right">
                  <Stack
                    component="form"
                    action={updateReturnStatusAction}
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: "flex-end" }}
                  >
                    <input type="hidden" name="returnId" value={r.id} />
                    <ControlledSelectField
                      name="status"
                      size="small"
                      defaultValue={r.status}
                      options={RETURN_STATUS_OPTIONS}
                      sx={{ minWidth: 140 }}
                    />
                    <Button type="submit" size="small" variant="outlined">
                      Update
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {returns.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No return requests yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
