import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
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
import { CertificationDialog } from "./CertificationDialog";
import { deleteCertificationAction, toggleCertificationAction } from "../actions";

export default async function AdminCertificationsPage() {
  const certifications = await prisma.certification.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 3 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Certifications &amp; Licenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the certificate cards shown on the storefront &ldquo;Certifications &amp; Quality&rdquo; page (FSSAI, ISO, lab accreditations, etc.).
          </Typography>
        </Box>
        <CertificationDialog />
      </Stack>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Issuing Body</TableCell>
              <TableCell>Certificate #</TableCell>
              <TableCell>Valid Until</TableCell>
              <TableCell align="center">Sort Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certifications.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell sx={{ fontWeight: 600, maxWidth: 220 }}>{c.name}</TableCell>
                <TableCell sx={{ maxWidth: 260 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "13px" }}>
                    {c.issuingBody}
                  </Typography>
                </TableCell>
                <TableCell>
                  {c.certificateNumber || (
                    <Typography variant="caption" color="text.disabled">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {c.validUntil ? (
                    new Date(c.validUntil).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Chip label={c.sortOrder} size="small" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell>
                  <form action={toggleCertificationAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="isActive" value={String(c.isActive)} />
                    <Chip
                      component="button"
                      type="submit"
                      label={c.isActive ? "Active" : "Hidden"}
                      color={c.isActive ? "success" : "default"}
                      size="small"
                      clickable
                      sx={{ fontWeight: 600, cursor: "pointer" }}
                    />
                  </form>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                    <CertificationDialog certification={{ ...c, validUntil: c.validUntil?.toISOString().slice(0, 10) ?? null }} />
                    <form action={deleteCertificationAction} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={c.id} />
                      <Button
                        type="submit"
                        size="small"
                        color="error"
                        sx={{ minWidth: 32, p: 0.5 }}
                        title="Delete Certification"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </form>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {certifications.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No certifications added yet. Click &ldquo;Add Certification&rdquo; above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
