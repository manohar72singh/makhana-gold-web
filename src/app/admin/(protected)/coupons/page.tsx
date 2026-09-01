import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import { prisma } from "@/lib/db";
import { createCouponAction, toggleCouponAction } from "./actions";
import { ControlledSelectField } from "@/components/admin/ControlledSelectField";

const COUPON_TYPE_OPTIONS = [
  { value: "percent", label: "Percentage" },
  { value: "fixed", label: "Fixed Amount" },
];

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Coupons & Offers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {coupons.length} coupons
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Min Order</TableCell>
                  <TableCell>Used</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 600 }}>{c.code}</TableCell>
                    <TableCell>{c.type === "percent" ? `${c.value}%` : `₹${c.value}`}</TableCell>
                    <TableCell>₹{c.minOrderValue.toString()}</TableCell>
                    <TableCell>{c.usageCount}</TableCell>
                    <TableCell>
                      <Chip
                        label={c.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={c.isActive ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <form action={toggleCouponAction}>
                        <input type="hidden" name="couponId" value={c.id} />
                        <input type="hidden" name="isActive" value={String(c.isActive)} />
                        <Button type="submit" size="small">
                          {c.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create Coupon
            </Typography>
            <Stack component="form" action={createCouponAction} spacing={2}>
              <TextField name="code" label="Coupon Code" required fullWidth />
              <ControlledSelectField
                name="type"
                label="Type"
                defaultValue="percent"
                options={COUPON_TYPE_OPTIONS}
                fullWidth
              />
              <TextField name="value" label="Value" type="number" required fullWidth />
              <TextField name="minOrderValue" label="Minimum Order Value (₹)" type="number" defaultValue={0} fullWidth />
              <Button type="submit" variant="contained">
                Create Coupon
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
