// One-time tooling script: crawl every mockup's code.html, extract every
// AI-generated image reference (both <img src="..."> and inline
// background-image:url(...)), download the exact image locally, and write a
// manifest mapping source URL -> local public path -> screens -> alt text.
//
// Usage: node scripts/download-images.mjs

import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const MOCKUPS_DIR = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "stitch_makhana_gold_design_system"
);
const OUT_DIR = path.resolve(import.meta.dirname, "..", "public", "images");
const MANIFEST_PATH = path.resolve(
  import.meta.dirname,
  "image-manifest.json"
);

const IMG_SRC_RE =
  /<img\b[^>]*?\bsrc="(https:\/\/lh3\.googleusercontent\.com\/[^"]+)"[^>]*?(?:\bdata-alt="([^"]*)")?[^>]*>/gis;
const IMG_SRC_RE_ALT_FIRST =
  /<img\b[^>]*?\bdata-alt="([^"]*)"[^>]*?\bsrc="(https:\/\/lh3\.googleusercontent\.com\/[^"]+)"[^>]*>/gis;
const BG_IMAGE_RE =
  /data-alt="([^"]*)"[^>]*?style="[^"]*background-image:\s*url\(['"]?(https:\/\/lh3\.googleusercontent\.com\/[^'")]+)['"]?\)/gis;
const BG_IMAGE_RE_STYLE_FIRST =
  /style="[^"]*background-image:\s*url\(['"]?(https:\/\/lh3\.googleusercontent\.com\/[^'")]+)['"]?\)[^>]*?data-alt="([^"]*)"/gis;

function slugify(text, fallback) {
  const s = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || fallback;
}

function shortHash(str) {
  return crypto.createHash("sha1").update(str).digest("hex").slice(0, 8);
}

async function extractFromFile(filePath, screenSlug) {
  const html = await readFile(filePath, "utf8");
  /** @type {{url: string, alt: string}[]} */
  const found = [];

  for (const re of [IMG_SRC_RE, IMG_SRC_RE_ALT_FIRST]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(html))) {
      const isAltFirst = re === IMG_SRC_RE_ALT_FIRST;
      const url = isAltFirst ? m[2] : m[1];
      const alt = isAltFirst ? m[1] : m[2];
      found.push({ url, alt: alt || "" });
    }
  }

  for (const re of [BG_IMAGE_RE, BG_IMAGE_RE_STYLE_FIRST]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(html))) {
      const isStyleFirst = re === BG_IMAGE_RE_STYLE_FIRST;
      const url = isStyleFirst ? m[1] : m[2];
      const alt = isStyleFirst ? m[2] : m[1];
      found.push({ url, alt: alt || "" });
    }
  }

  // De-dupe within a single file (both regex variants often match the same
  // <img> once each, since data-alt can appear before or after src). Prefer
  // whichever match actually captured non-empty alt text.
  const byUrlInFile = new Map();
  for (const f of found) {
    const existing = byUrlInFile.get(f.url);
    if (!existing || (!existing.alt && f.alt)) {
      byUrlInFile.set(f.url, f);
    }
  }
  return [...byUrlInFile.values()];
}

async function downloadTo(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(destPath), { recursive: true });
  await writeFile(destPath, buf);
  return buf.length;
}

async function main() {
  const entries = await readdir(MOCKUPS_DIR, { withFileTypes: true });
  const screenDirs = entries.filter((e) => e.isDirectory());

  /** @type {Map<string, {localPath: string, altTexts: Set<string>, screens: Set<string>}>} */
  const byUrl = new Map();

  for (const dir of screenDirs) {
    const screenSlug = dir.name;
    const codeHtmlPath = path.join(MOCKUPS_DIR, screenSlug, "code.html");
    if (!existsSync(codeHtmlPath)) continue;

    const refs = await extractFromFile(codeHtmlPath, screenSlug);
    for (const { url, alt } of refs) {
      if (!byUrl.has(url)) {
        const altSlug = slugify(alt, `img-${shortHash(url)}`);
        const localPath = `images/${screenSlug}/${altSlug}-${shortHash(url)}.jpg`;
        byUrl.set(url, {
          localPath,
          altTexts: new Set(alt ? [alt] : []),
          screens: new Set(),
        });
      }
      byUrl.get(url).screens.add(screenSlug);
      if (alt) byUrl.get(url).altTexts.add(alt);
    }
  }

  console.log(`Found ${byUrl.size} unique image URLs across ${screenDirs.length} screens.`);

  let downloaded = 0;
  let failed = 0;
  for (const [url, meta] of byUrl) {
    const destAbs = path.join(OUT_DIR, "..", meta.localPath); // public/images/...
    if (existsSync(destAbs)) {
      continue; // already downloaded on a previous run
    }
    try {
      const bytes = await downloadTo(url, destAbs);
      downloaded++;
      console.log(`OK  ${meta.localPath} (${bytes} bytes)`);
    } catch (err) {
      failed++;
      console.error(`FAIL ${url}: ${err.message}`);
    }
  }

  const manifest = Object.fromEntries(
    [...byUrl.entries()].map(([url, meta]) => [
      url,
      {
        localPath: `/${meta.localPath}`,
        alt: [...meta.altTexts][0] || "",
        screens: [...meta.screens],
      },
    ])
  );
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(
    `\nDone. Downloaded ${downloaded}, skipped (already present) ${
      byUrl.size - downloaded - failed
    }, failed ${failed}.`
  );
  console.log(`Manifest written to ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
