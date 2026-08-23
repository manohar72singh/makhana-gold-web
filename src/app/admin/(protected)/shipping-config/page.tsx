import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { prisma } from "@/lib/db";
import { createWarehouseAction } from "./actions";

export default async function AdminShippingConfigPage() {
  const warehouses = await prisma.warehouse.findMany({ include: { inventoryStock: true } });

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Shipping Configurations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage fulfillment warehouses.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            {warehouses.map((w) => (
              <Paper key={w.id} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {w.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {[w.addressLine1, w.city, w.state].filter(Boolean).join(", ") || "No address set"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {w.inventoryStock.length} SKUs stocked here
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add Warehouse
            </Typography>
            <Stack component="form" action={createWarehouseAction} spacing={2}>
              <TextField name="name" label="Warehouse Name" required fullWidth />
              <TextField name="addressLine1" label="Address" fullWidth />
              <TextField name="city" label="City" fullWidth />
              <TextField name="state" label="State" fullWidth />
              <Button type="submit" variant="contained">
                Add Warehouse
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
