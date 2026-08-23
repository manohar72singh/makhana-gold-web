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
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import { prisma } from "@/lib/db";
import { BannerDialog } from "./BannerDialog";
import { deleteHeroBannerAction, toggleHeroBannerAction } from "../actions";

export default async function AdminBannersPage() {
  const banners = await prisma.heroBanner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Hero Slider Banners
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage dynamic homepage hero carousel banners, promotional badges, headlines, and call-to-actions.
          </Typography>
        </Box>
        <BannerDialog />
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Slide &amp; Preview</TableCell>
              <TableCell>Headline &amp; Badge</TableCell>
              <TableCell>Primary CTA</TableCell>
              <TableCell>Theme</TableCell>
              <TableCell align="center">Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banners.map((b) => (
              <TableRow key={b.id} hover>
                <TableCell sx={{ minWidth: 200 }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Box
                      component="img"
                      src={b.bgImage}
                      alt={b.title}
                      sx={{
                        width: 72,
                        height: 44,
                        borderRadius: 1.5,
                        objectFit: "cover",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "grey.100",
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {b.slideKey}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {b.showMarketplaces ? "Includes App Logos" : "Standard Slide"}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Chip
                    label={b.badge}
                    size="small"
                    sx={{ mb: 0.5, fontSize: "10px", height: 20, maxWidth: "100%" }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {b.title}{" "}
                    <span style={{ color: "#d97706" }}>{b.highlightTitle}</span>
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {b.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {b.ctaText}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                    {b.ctaLink}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={b.theme}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "capitalize", fontSize: "11px" }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip label={b.sortOrder} size="small" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell>
                  <form action={toggleHeroBannerAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="isActive" value={String(b.isActive)} />
                    <Chip
                      component="button"
                      type="submit"
                      label={b.isActive ? "Active" : "Hidden"}
                      color={b.isActive ? "success" : "default"}
                      size="small"
                      clickable
                      sx={{ fontWeight: 600, cursor: "pointer" }}
                    />
                  </form>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                    <BannerDialog banner={b} />
                    <form action={deleteHeroBannerAction} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={b.id} />
                      <Button
                        type="submit"
                        size="small"
                        color="error"
                        sx={{ minWidth: 32, p: 0.5 }}
                        title="Delete Banner"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </form>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {banners.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hero banners found. Click &ldquo;Add Hero Banner&rdquo; to publish your first carousel slide.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
