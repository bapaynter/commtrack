"use server";

import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadImage(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds the 100MB limit.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  // Sanitize filename to prevent directory traversal or weird characters
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${timestamp}_${safeName}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
}
