import Link from "next/link";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { prisma } from "@/lib/db";
import { deleteBlogPostAction } from "./actions";

export default async function AdminBlogsPage() {
  const blogs = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalBlogs = blogs.length;
  const publishedCount = blogs.filter((b) => b.isPublished).length;
  const draftCount = totalBlogs - publishedCount;
  const featuredCount = blogs.filter((b) => b.featured).length;

  return (
    <Box sx={{ maxWidth: "100%", pb: 8 }}>
      {/* 👑 Top Header Banner */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          mb: 3.5,
          pb: 2.5,
          borderBottom: "1px solid rgba(120, 53, 15, 0.1)",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#1C150C", letterSpacing: "-0.02em" }}>
            ✍️ Blog CMS &amp; Google SEO Suite
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            Publish organic health guides, rank on Google keywords, and drive superfood sales.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ width: { xs: "100%", md: "auto" } }}>
          <Link href="/blog" target="_blank" style={{ textDecoration: "none" }}>
            <Button
              variant="outlined"
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                borderColor: "rgba(120, 53, 15, 0.25)",
                color: "#5C4D3C",
                bgcolor: "white",
                "&:hover": { bgcolor: "#FAF6EE", borderColor: "#D84315" },
                px: 2,
                py: 1,
              }}
            >
              👁️ View Live Hub ↗
            </Button>
          </Link>

          <Link href="/admin/blogs/new" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              size="small"
              sx={{
                bgcolor: "#D84315",
                "&:hover": { bgcolor: "#BF360C" },
                borderRadius: 2,
                fontWeight: 800,
                textTransform: "none",
                px: 2.5,
                py: 1,
                boxShadow: "0 4px 12px rgba(216, 67, 21, 0.25)",
              }}
            >
              + Write New Article
            </Button>
          </Link>
        </Stack>
      </Stack>

      {/* 📊 Top Metric KPI Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3.5,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "white" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", fontSize: "10px" }}>
            Total Articles
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#1C150C", mt: 0.3 }}>
            {totalBlogs}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "11px" }}>
            In database
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "#F4FBEF", borderColor: "#C8E6C9" }}>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "#2E7D32", fontSize: "10px" }}>
            🟢 Live &amp; Indexed
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#2E7D32", mt: 0.3 }}>
            {publishedCount}
          </Typography>
          <Typography variant="caption" sx={{ color: "#388E3C", fontSize: "11px" }}>
            Syncing in sitemap.xml
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "#FFFDF6", borderColor: "#FFE082" }}>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "#F57F17", fontSize: "10px" }}>
            🟡 Draft Articles
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#F57F17", mt: 0.3 }}>
            {draftCount}
          </Typography>
          <Typography variant="caption" sx={{ color: "#F57F17", fontSize: "11px" }}>
            Unpublished
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "#F7F5FC", borderColor: "#D1C4E9" }}>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "#512DA8", fontSize: "10px" }}>
            ⭐ Spotlight Featured
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#512DA8", mt: 0.3 }}>
            {featuredCount}
          </Typography>
          <Typography variant="caption" sx={{ color: "#512DA8", fontSize: "11px" }}>
            Hero banner spotlight
          </Typography>
        </Paper>
      </Box>

      {/* 📋 Responsive Table Container */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflowX: "auto",
          bgcolor: "white",
        }}
      >
        <Table sx={{ minWidth: 780 }}>
          <TableHead sx={{ bgcolor: "#FAF6EE" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: "#1C150C", fontSize: "12px", width: "40%" }}>
                Article &amp; SEO Slug
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#1C150C", fontSize: "12px", width: "16%" }}>
                Category
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#1C150C", fontSize: "12px", width: "16%" }}>
                Author
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#1C150C", fontSize: "12px", width: "10%" }}>
                Read Time
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: "#1C150C", fontSize: "12px", width: "10%" }}>
                Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: "#1C150C", fontSize: "12px", width: "8%", whiteSpace: "nowrap" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary", mb: 1 }}>
                    No blog articles written yet.
                  </Typography>
                  <Link href="/admin/blogs/new" style={{ textDecoration: "none" }}>
                    <Button variant="contained" size="small" sx={{ bgcolor: "#D84315", textTransform: "none", fontWeight: 700 }}>
                      Write Your First Article
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((b) => (
                <TableRow key={b.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  {/* Article Title & Thumbnail */}
                  <TableCell>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Avatar
                        src={b.coverImage || "/images/vibrant/hero.jpg"}
                        variant="rounded"
                        sx={{ width: 44, height: 44, bgcolor: "#FAF6EE", border: "1px solid rgba(0,0,0,0.06)", shrink: 0 }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Link href={`/admin/blogs/${b.id}`} style={{ textDecoration: "none" }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "#1C150C",
                              lineHeight: 1.3,
                              "&:hover": { color: "#D84315" },
                            }}
                          >
                            {b.title}
                          </Typography>
                        </Link>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.4 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "10px" }}>
                            /blog/{b.slug}
                          </Typography>
                          {b.featured && (
                            <Chip label="⭐ Spotlight" size="small" sx={{ height: 16, fontSize: "8.5px", bgcolor: "#512DA8", color: "white", fontWeight: 800 }} />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Chip
                      label={b.category}
                      size="small"
                      sx={{ bgcolor: "#FAF6EE", fontWeight: 700, fontSize: "11px", color: "#5D4037" }}
                    />
                  </TableCell>

                  {/* Author */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "12px", color: "#1C150C" }}>
                      {b.authorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "10px", display: "block" }}>
                      {b.authorRole}
                    </Typography>
                  </TableCell>

                  {/* Read Time */}
                  <TableCell>
                    <Typography variant="caption" sx={{ fontWeight: 700, bgcolor: "#FAF6EE", px: 1, py: 0.4, borderRadius: 1, fontSize: "11px", whiteSpace: "nowrap" }}>
                      ⏱️ {b.readingTimeMinutes} min
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={b.isPublished ? "Published" : "Draft"}
                      size="small"
                      color={b.isPublished ? "success" : "warning"}
                      sx={{ fontWeight: 700, fontSize: "11px" }}
                    />
                  </TableCell>

                  {/* Actions Buttons */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                      <Tooltip title="View Live Article">
                        <Link href={`/blog/${b.slug}`} target="_blank" style={{ textDecoration: "none" }}>
                          <Button size="small" sx={{ minWidth: 32, px: 1, textTransform: "none", fontWeight: 700, color: "#1C150C" }}>
                            View ↗
                          </Button>
                        </Link>
                      </Tooltip>

                      <Tooltip title="Edit Article">
                        <Link href={`/admin/blogs/${b.id}`} style={{ textDecoration: "none" }}>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              minWidth: 36,
                              px: 1.2,
                              py: 0.4,
                              textTransform: "none",
                              fontWeight: 700,
                              borderRadius: 1.5,
                              fontSize: "11px",
                              borderColor: "rgba(120,53,15,0.2)",
                            }}
                          >
                            Edit
                          </Button>
                        </Link>
                      </Tooltip>

                      <form action={deleteBlogPostAction.bind(null, b.id)}>
                        <Tooltip title="Delete Article">
                          <Button
                            size="small"
                            type="submit"
                            color="error"
                            sx={{
                              minWidth: 32,
                              px: 1,
                              py: 0.4,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "11px",
                            }}
                          >
                            Delete
                          </Button>
                        </Tooltip>
                      </form>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
