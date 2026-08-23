"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

export interface BlogFormData {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  authorName: string;
  authorRole: string;
  isPublished: boolean;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
}

const CATEGORIES = [
  "Health & Nutrition",
  "Superfood Recipes",
  "Fitness & Protein",
  "Harvest Stories",
  "Weight Loss & Lifestyle",
];

const PRESET_COVERS = [
  { label: "Makhana Harvest", url: "/images/vibrant/hero.jpg" },
  { label: "Pink Salt Makhana", url: "/images/vibrant/pink-salt.jpg" },
  { label: "Black Truffle Makhana", url: "/images/vibrant/truffle.jpg" },
  { label: "Chana Sattu Pouch", url: "/images/products/sattu_chana_pack.jpg" },
  { label: "Sattu Sharbat Drink", url: "/images/products/sattu_sharbat_drink.jpg" },
  { label: "Litti Sattu Special", url: "/images/products/sattu_litti_mix.jpg" },
  { label: "Red Rice Poha", url: "/images/products/poha_red_rice.jpg" },
  { label: "Thick Batata Poha", url: "/images/products/poha_thick_batata.jpg" },
  { label: "Roasted Poha Chivda", url: "/images/products/poha_chivda_snack.jpg" },
];

export function BlogEditorStudio({
  initialData,
  onSubmitAction,
}: {
  initialData?: BlogFormData;
  onSubmitAction: (formData: FormData) => void;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "/images/vibrant/hero.jpg");
  const [category, setCategory] = useState(initialData?.category || "Health & Nutrition");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [authorName, setAuthorName] = useState(initialData?.authorName || "Dr. Ananya Sharma");
  const [authorRole, setAuthorRole] = useState(initialData?.authorRole || "Senior Clinical Nutritionist & Food Biochemist");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [metaKeywords, setMetaKeywords] = useState(initialData?.metaKeywords || "");

  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug from title if not custom
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!initialData?.id) {
      const generatedSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  // Insert markdown snippet at cursor
  const insertText = (before: string, after: string = "", defaultPlaceholder: string = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultPlaceholder;
    const replacement = before + selected + after;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  // Upload image from computer directly to blog content
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        insertText(`\n![${file.name.replace(/\.[^/.]+$/, "")}](${data.url})\n`);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const effectiveMetaTitle = metaTitle || `${title || "Article Title"} | Makhana Gold`;
  const effectiveMetaDesc = metaDescription || excerpt || "Read comprehensive health benefits, culinary recipes, and nutrition breakdown from Makhana Gold.";
  const effectiveSlug = slug || "article-slug";
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Box component="form" action={onSubmitAction} sx={{ pb: 10 }}>
      {/* Hidden form fields */}
      <input type="hidden" name="coverImage" value={coverImage} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="isPublished" value={isPublished ? "true" : "false"} />
      <input type="hidden" name="featured" value={featured ? "true" : "false"} />

      {/* Top Header Bar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 4 }}
      >
        <div>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
            <Link href="/admin/blogs" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                ← Back to Blogs
              </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary">•</Typography>
            <Typography variant="caption" sx={{ bgcolor: "#FAF6EE", px: 1, py: 0.5, borderRadius: 1, fontWeight: 700 }}>
              {readTime} min read (~{wordCount} words)
            </Typography>
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {initialData?.id ? "✏️ Edit Blog Article" : "✍️ Create New Google SEO Blog Article"}
          </Typography>
        </div>

        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                color="success"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {isPublished ? "🟢 Published" : "🟡 Draft"}
              </Typography>
            }
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#D84315",
              "&:hover": { bgcolor: "#BF360C" },
              borderRadius: 2.5,
              fontWeight: 800,
              px: 4,
              py: 1.2,
              boxShadow: "0 8px 20px -4px rgba(216, 67, 21, 0.4)",
            }}
          >
            {initialData?.id ? "Update & Sync SEO" : "🚀 Publish & Sync Google Sitemap"}
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2.2fr 1fr" }, gap: 4 }}>
        {/* LEFT COLUMN: Main Editor & Live Preview */}
        <Stack spacing={3}>
          {/* Title & Slug */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <TextField
              fullWidth
              label="Article Title (H1 Headline)"
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. 10 Proven Health Benefits of Fox Nuts (Makhana) for Weight Loss"
              required
              sx={{
                mb: 2.5,
                "& .MuiInputBase-input": { fontSize: "1.1rem", fontWeight: 700 },
              }}
            />

            <TextField
              fullWidth
              label="URL Slug (Permanent Link for Google)"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="health-benefits-of-makhana-fox-nuts"
              required
              helperText={`Live URL: https://makhanagold.com/blog/${effectiveSlug}`}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Short Excerpt (Summary for Cards & RSS)"
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A captivating 1-2 sentence hook that explains why readers need this superfood article..."
            />
          </Paper>

          {/* Rich Content Editor Studio */}
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            {/* Editor Tabs & Toolbar */}
            <Box sx={{ bgcolor: "#FAF6EE", borderBottom: "1px solid rgba(120, 53, 15, 0.1)", px: 2, pt: 1 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                  <Tab label="✍️ Write Markdown" sx={{ fontWeight: 800, textTransform: "none" }} />
                  <Tab label="👁️ Live Article Preview" sx={{ fontWeight: 800, textTransform: "none" }} />
                </Tabs>

                {activeTab === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Markdown &amp; Rich Formatting Supported
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Visual Action Toolbar (Visible in Write Mode) */}
            {activeTab === 0 && (
              <Box sx={{ p: 1.5, bgcolor: "#FFF8F0", borderBottom: "1px solid rgba(120, 53, 15, 0.1)", display: "flex", flexWrap: "wrap", gap: 0.8, alignItems: "center" }}>
                <Tooltip title="Heading 2">
                  <Button size="small" variant="outlined" onClick={() => insertText("\n## ", "\n", "Heading Title")} sx={{ minWidth: 36, fontWeight: 800 }}>
                    H2
                  </Button>
                </Tooltip>

                <Tooltip title="Heading 3">
                  <Button size="small" variant="outlined" onClick={() => insertText("\n### ", "\n", "Sub-heading Title")} sx={{ minWidth: 36, fontWeight: 800 }}>
                    H3
                  </Button>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                <Tooltip title="Bold Text">
                  <Button size="small" variant="outlined" onClick={() => insertText("**", "**", "Bold text")} sx={{ minWidth: 36, fontWeight: 800 }}>
                    B
                  </Button>
                </Tooltip>

                <Tooltip title="Italic Text">
                  <Button size="small" variant="outlined" onClick={() => insertText("*", "*", "Italic text")} sx={{ minWidth: 36, fontStyle: "italic", fontWeight: 700 }}>
                    I
                  </Button>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                <Tooltip title="Bullet List">
                  <Button size="small" variant="outlined" onClick={() => insertText("\n- ", "\n- Item 2\n- Item 3\n", "Item 1")} sx={{ textTransform: "none", fontWeight: 700 }}>
                    • List
                  </Button>
                </Tooltip>

                <Tooltip title="Numbered List">
                  <Button size="small" variant="outlined" onClick={() => insertText("\n1. ", "\n2. Step 2\n3. Step 3\n", "Step 1")} sx={{ textTransform: "none", fontWeight: 700 }}>
                    1. List
                  </Button>
                </Tooltip>

                <Tooltip title="Quote Box">
                  <Button size="small" variant="outlined" onClick={() => insertText("\n> ", "\n", "Inspiring health quote or expert statement...")} sx={{ textTransform: "none", fontWeight: 700 }}>
                    &ldquo; Quote
                  </Button>
                </Tooltip>

                <Tooltip title="Callout Tip Box">
                  <Button size="small" variant="outlined" onClick={() => insertText("\n> [!TIP]\n> ", "\n", "Pro Tip: Always choose slow dry-roasted makhana...")} sx={{ textTransform: "none", fontWeight: 700 }}>
                    💡 Tip
                  </Button>
                </Tooltip>

                <Tooltip title="Nutrition Table Template">
                  <Button size="small" variant="outlined" onClick={() => insertText("\n| Nutrient | Quantity | Daily Value |\n| :--- | :--- | :--- |\n| Protein | 9.7 g | 19% |\n| Dietary Fiber | 14.5 g | 52% |\n| Calcium | 60 mg | 6% |\n")} sx={{ textTransform: "none", fontWeight: 700 }}>
                    📊 Table
                  </Button>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* 📷 1-Click Computer Image Inserter */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleInlineImageUpload}
                  style={{ display: "none" }}
                />
                <Button
                  size="small"
                  variant="contained"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    bgcolor: "#2E7D32",
                    "&:hover": { bgcolor: "#1B5E20" },
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                >
                  {uploadingImage ? <CircularProgress size={16} sx={{ color: "white", mr: 1 }} /> : "📷 Insert Image from PC"}
                </Button>
              </Box>
            )}

            {/* Tab 0: Textarea */}
            {activeTab === 0 && (
              <Box sx={{ p: 2 }}>
                <textarea
                  ref={contentTextareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your rich blog article in Markdown... Use the buttons above for instant headings, nutrition tables, quotes, and direct photo uploads."
                  rows={20}
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: "14px",
                    lineHeight: "1.7",
                    color: "#1C150C",
                    resize: "vertical",
                    minHeight: "450px",
                    background: "transparent",
                  }}
                />
              </Box>
            )}

            {/* Tab 1: Live Article Visual Preview */}
            {activeTab === 1 && (
              <Box sx={{ p: 4, bgcolor: "#FAF6EE", minHeight: "450px" }}>
                <div className="prose prose-amber max-w-none">
                  <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2B1B04", marginBottom: "1rem" }}>
                    {title || "Article Title Preview"}
                  </h1>
                  <p style={{ fontSize: "1.1rem", color: "#5C4D3C", fontStyle: "italic", marginBottom: "2rem" }}>
                    {excerpt || "Excerpt summary preview..."}
                  </p>
                  <div
                    style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "15px", color: "#2B1B04" }}
                  >
                    {content || "No content written yet. Switch to 'Write Markdown' tab to write."}
                  </div>
                </div>
              </Box>
            )}
          </Paper>

          {/* 🌟 360° LIVE GOOGLE SERP SEARCH PREVIEW BOX */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#F8F9FA", borderColor: "#DADCE0" }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#202124", display: "flex", alignItems: "center", gap: 1 }}>
                <span>🔍</span>
                <span>Live Google Search Snippet Preview</span>
              </Typography>
              <Chip label="Google Rank Preview" size="small" sx={{ bgcolor: "#E8F0FE", color: "#1967D2", fontWeight: 700 }} />
            </Stack>

            {/* Google SERP Simulated Card */}
            <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, border: "1px solid #DFE1E5", boxShadow: "0 1px 6px rgba(32,33,36,0.1)", mb: 3 }}>
              <Typography variant="caption" sx={{ color: "#202124", display: "block", mb: 0.5 }}>
                https://makhanagold.com › blog › <span style={{ color: "#5F6368" }}>{effectiveSlug}</span>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#1A0DAB",
                  fontWeight: 600,
                  fontSize: "1.2rem",
                  lineHeight: 1.3,
                  mb: 0.5,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {effectiveMetaTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: "#4D5156", fontSize: "13px", lineHeight: 1.5 }}>
                <span style={{ color: "#70757A", fontWeight: 600 }}>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — </span>
                {effectiveMetaDesc.length > 160 ? effectiveMetaDesc.substring(0, 160) + "..." : effectiveMetaDesc}
              </Typography>
            </Box>

            {/* Meta Title & Description Custom Inputs */}
            <Stack spacing={2}>
              <div>
                <TextField
                  fullWidth
                  label="SEO Meta Title (Title tag for Google)"
                  name="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={effectiveMetaTitle}
                  helperText={`${effectiveMetaTitle.length}/60 characters (Optimal: 50–60)`}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="SEO Meta Description (Snippet for Google)"
                  name="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={effectiveMetaDesc}
                  helperText={`${effectiveMetaDesc.length}/160 characters (Optimal: 120–160)`}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  label="SEO Keywords (Comma separated)"
                  name="metaKeywords"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="makhana benefits, fox nuts weight loss, chana sattu protein, organic poha"
                />
              </div>
            </Stack>
          </Paper>
        </Stack>

        {/* RIGHT COLUMN: Sidebar Settings, Cover Image & Author */}
        <Stack spacing={3}>
          {/* Publishing & Category Settings */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              ⚙️ Article Settings
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Tags (Comma separated)"
                name="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Makhana, Sattu, High Protein, Diabetes"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ⭐ Spotlight Featured Article
                  </Typography>
                }
              />
            </Stack>
          </Paper>

          {/* Cover Photo Selector */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              🖼️ Featured Cover Photo
            </Typography>

            {/* Current Cover Preview */}
            <Box sx={{ position: "relative", width: "100%", height: 180, borderRadius: 2, overflow: "hidden", mb: 2, bgcolor: "#FAF6EE", border: "1px solid rgba(120, 53, 15, 0.15)" }}>
              <Image
                src={coverImage}
                alt="Cover Preview"
                fill
                className="object-cover"
              />
            </Box>

            <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 1, color: "text.secondary" }}>
              Choose from High-Res Harvest Presets:
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {PRESET_COVERS.map((preset) => (
                <Chip
                  key={preset.url}
                  label={preset.label}
                  size="small"
                  onClick={() => setCoverImage(preset.url)}
                  variant={coverImage === preset.url ? "filled" : "outlined"}
                  color={coverImage === preset.url ? "primary" : "default"}
                  sx={{ fontWeight: 700, fontSize: "11px", cursor: "pointer" }}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Custom Image URL or Path"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
          </Paper>

          {/* Author Details */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              👤 Author Attribution
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Author Name"
                name="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />

              <TextField
                fullWidth
                size="small"
                label="Author Role / Title"
                name="authorRole"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
              />
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
