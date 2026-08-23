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
import { prisma } from "@/lib/db";
import { PillarDialog } from "./PillarDialog";
import { deleteFeaturePillarAction, toggleFeaturePillarAction } from "../actions";

export default async function AdminPillarsPage() {
  const pillars = await prisma.featurePillar.findMany({
    orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
  });

  const trustBadges = pillars.filter((p) => p.section === "trust_badge");
  const healthBenefits = pillars.filter((p) => p.section === "health_benefit");
  const others = pillars.filter((p) => p.section !== "trust_badge" && p.section !== "health_benefit");

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Trust Badges &amp; Feature Pillars
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the top Trust Badges ribbon and the Health Benefits superfood bento box on the homepage.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <PillarDialog defaultSection="trust_badge" />
          <PillarDialog defaultSection="health_benefit" />
        </Stack>
      </Stack>

      {/* 1. Trust Badges Table */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1.5, fontWeight: 700 }}>
        🛡️ Trust Badges Ribbon (Homepage Top Strip)
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", mb: 5 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Icon &amp; Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Sort Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trustBadges.map((badge) => (
              <TableRow key={badge.id} hover>
                <TableCell sx={{ minWidth: 200 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "grey.100",
                        color: "primary.main",
                        fontFamily: "Material Symbols Outlined",
                        fontSize: 20,
                      }}
                    >
                      {badge.icon}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {badge.title}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ maxWidth: 350 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "13px" }}>
                    {badge.description}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip label={badge.sortOrder} size="small" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell>
                  <form action={toggleFeaturePillarAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={badge.id} />
                    <input type="hidden" name="isActive" value={String(badge.isActive)} />
                    <Chip
                      component="button"
                      type="submit"
                      label={badge.isActive ? "Active" : "Hidden"}
                      color={badge.isActive ? "success" : "default"}
                      size="small"
                      clickable
                      sx={{ fontWeight: 600, cursor: "pointer" }}
                    />
                  </form>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                    <PillarDialog pillar={badge} />
                    <form action={deleteFeaturePillarAction} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={badge.id} />
                      <Button
                        type="submit"
                        size="small"
                        color="error"
                        sx={{ minWidth: 32, p: 0.5 }}
                        title="Delete Pillar"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </form>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {trustBadges.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  No trust badges found. Click &ldquo;Add Trust Badge&rdquo; above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* 2. Health Benefits Bento Table */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1.5, fontWeight: 700 }}>
        🌿 Functional Health Benefits (Superfood Bento Grid)
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Icon &amp; Title</TableCell>
              <TableCell>Tag / Value</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Sort Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {healthBenefits.map((benefit) => (
              <TableRow key={benefit.id} hover>
                <TableCell sx={{ minWidth: 200 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "grey.100",
                        color: "primary.main",
                        fontFamily: "Material Symbols Outlined",
                        fontSize: 20,
                      }}
                    >
                      {benefit.icon}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {benefit.title}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  {benefit.value && (
                    <Chip label={benefit.value} size="small" color="primary" variant="outlined" />
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 350 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "13px" }}>
                    {benefit.description}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip label={benefit.sortOrder} size="small" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell>
                  <form action={toggleFeaturePillarAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={benefit.id} />
                    <input type="hidden" name="isActive" value={String(benefit.isActive)} />
                    <Chip
                      component="button"
                      type="submit"
                      label={benefit.isActive ? "Active" : "Hidden"}
                      color={benefit.isActive ? "success" : "default"}
                      size="small"
                      clickable
                      sx={{ fontWeight: 600, cursor: "pointer" }}
                    />
                  </form>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                    <PillarDialog pillar={benefit} />
                    <form action={deleteFeaturePillarAction} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={benefit.id} />
                      <Button
                        type="submit"
                        size="small"
                        color="error"
                        sx={{ minWidth: 32, p: 0.5 }}
                        title="Delete Benefit"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </form>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {healthBenefits.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  No health benefits found. Click &ldquo;Add Health Benefit&rdquo; above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
