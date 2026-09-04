import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { adminAuth } from "@/lib/auth-admin";

export async function POST(req: NextRequest) {
  try {
    const session = await adminAuth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const requestedFolder = (formData.get("folder") as string) || "products";
    // Strip any path separators/traversal so this can't escape public/uploads.
    const folder = requestedFolder.replace(/[^a-zA-Z0-9_-]/g, "") || "products";
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const allFiles: File[] = [];
    if (files && files.length > 0) {
      allFiles.push(...files);
    } else if (singleFile) {
      allFiles.push(singleFile);
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/jpg",
      "image/avif",
      "application/pdf",
    ];
    const targetDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(targetDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of allFiles) {
      if (!allowedTypes.includes(file.type)) {
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".jpg";
      const cleanName = path
        .basename(file.name, ext)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_");
      const filename = `${cleanName}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`;

      const filePath = path.join(targetDir, filename);
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${folder}/${filename}`;
      uploadedUrls.push(publicUrl);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid files could be processed. Please upload JPG, PNG, WEBP, GIF, or PDF under 15MB." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
