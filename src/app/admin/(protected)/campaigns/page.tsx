import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { prisma } from "@/lib/db";
import { createCampaignAction } from "./actions";

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    include: { coupons: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Campaigns
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {campaigns.length} campaigns
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            {campaigns.map((c) => (
              <Paper key={c.id} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {c.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.type} • {c.coupons.length} linked coupon{c.coupons.length === 1 ? "" : "s"}
                    </Typography>
                  </div>
                  <Chip label={c.status} size="small" color={c.status === "active" ? "success" : "default"} />
                </Stack>
              </Paper>
            ))}
            {campaigns.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No campaigns yet — create one to the right.
              </Typography>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              New Campaign
            </Typography>
            <Stack component="form" action={createCampaignAction} spacing={2}>
              <TextField name="name" label="Campaign Name" required fullWidth />
              <TextField name="type" label="Type" defaultValue="seasonal" fullWidth />
              <Button type="submit" variant="contained">
                Create Campaign
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
