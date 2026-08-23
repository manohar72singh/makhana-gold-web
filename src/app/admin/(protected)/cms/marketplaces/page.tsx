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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { prisma } from "@/lib/db";
import { MarketplaceDialog } from "./MarketplaceDialog";
import { deleteMarketplaceLinkAction, toggleMarketplaceLinkAction } from "../actions";

export default async function AdminMarketplacesPage() {
  const marketplaces = await prisma.marketplaceLink.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Marketplaces &amp; Quick-Commerce
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage official external selling channels (Amazon Prime, Flipkart Assured, Blinkit, Zepto, Swiggy Instamart).
          </Typography>
        </Box>
        <MarketplaceDialog />
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Platform Name</TableCell>
              <TableCell>Platform Key</TableCell>
              <TableCell>Badge / Feature</TableCell>
              <TableCell>External Storefront URL</TableCell>
              <TableCell align="center">Sort Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marketplaces.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{m.name}</TableCell>
                <TableCell>
                  <Chip
                    label={m.platformKey}
                    size="small"
                    sx={{ fontFamily: "monospace", fontSize: "11px" }}
                  />
                </TableCell>
                <TableCell>
                  {m.badgeText && <Chip label={m.badgeText} size="small" variant="outlined" />}
                </TableCell>
                <TableCell sx={{ maxWidth: 280 }}>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      color: "#b45309",
                      textDecoration: "none",
                      fontSize: "13px",
                      wordBreak: "break-all",
                    }}
                  >
                    {m.url} <OpenInNewIcon sx={{ fontSize: 13 }} />
                  </a>
                </TableCell>
                <TableCell align="center">
                  <Chip label={m.sortOrder} size="small" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell>
                  <form action={toggleMarketplaceLinkAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="isActive" value={String(m.isActive)} />
                    <Chip
                      component="button"
                      type="submit"
                      label={m.isActive ? "Active" : "Hidden"}
                      color={m.isActive ? "success" : "default"}
                      size="small"
                      clickable
                      sx={{ fontWeight: 600, cursor: "pointer" }}
                    />
                  </form>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                    <MarketplaceDialog marketplace={m} />
                    <form action={deleteMarketplaceLinkAction} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={m.id} />
                      <Button
                        type="submit"
                        size="small"
                        color="error"
                        sx={{ minWidth: 32, p: 0.5 }}
                        title="Delete Partner"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </form>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {marketplaces.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No marketplace channels added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
