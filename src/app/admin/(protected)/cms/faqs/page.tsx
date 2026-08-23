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
import { FaqDialog } from "./FaqDialog";
import { deleteFaqItemAction, toggleFaqItemAction } from "../actions";

export default async function AdminFaqsPage() {
  const faqs = await prisma.faqItem.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            FAQ Knowledge Base
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage customer frequently asked questions, categorized by Orders, Sourcing, Quality, and Corporate.
          </Typography>
        </Box>
        <FaqDialog />
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell align="center">Sort Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faqs.map((f) => (
              <TableRow key={f.id} hover>
                <TableCell>
                  <Chip
                    label={f.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, maxWidth: 280 }}>{f.question}</TableCell>
                <TableCell sx={{ maxWidth: 360 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: "13px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {f.answer}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip label={f.sortOrder} size="small" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell>
                  <form action={toggleFaqItemAction} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="isActive" value={String(f.isActive)} />
                    <Chip
                      component="button"
                      type="submit"
                      label={f.isActive ? "Active" : "Hidden"}
                      color={f.isActive ? "success" : "default"}
                      size="small"
                      clickable
                      sx={{ fontWeight: 600, cursor: "pointer" }}
                    />
                  </form>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                    <FaqDialog faq={f} />
                    <form action={deleteFaqItemAction} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={f.id} />
                      <Button
                        type="submit"
                        size="small"
                        color="error"
                        sx={{ minWidth: 32, p: 0.5 }}
                        title="Delete FAQ"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </form>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {faqs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No FAQs found. Click &ldquo;Add FAQ Item&rdquo; above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
