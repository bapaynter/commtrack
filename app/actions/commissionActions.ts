"use server";

import { Commission } from "@/types";
import { readDb, writeDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export async function fetchCommissions(): Promise<Commission[]> {
  const commissions = await readDb();
  return commissions.sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return b.createdAt - a.createdAt;
  });
}

export async function batchUpdateCommissions(
  updates: Partial<Commission>[]
): Promise<void> {
  const commissions = await readDb();
  const now = Date.now();
  let changed = false;

  for (const update of updates) {
    if (!update.id) continue;
    const index = commissions.findIndex((c) => c.id === update.id);
    if (index !== -1) {
      commissions[index] = {
        ...commissions[index],
        ...update,
        updatedAt: now,
      } as Commission;
      changed = true;
    }
  }

  if (changed) {
    await writeDb(commissions);
    revalidatePath("/");
  }
}

export async function persistCommission(
  data: Partial<Commission>
): Promise<Commission> {
  const commissions = await readDb();
  const now = Date.now();

  let savedCommission: Commission;

  if (data.id) {
    // Update existing
    const index = commissions.findIndex((c) => c.id === data.id);
    if (index === -1) {
      throw new Error(`Commission with ID ${data.id} not found`);
    }

    savedCommission = {
      ...commissions[index],
      ...data,
      updatedAt: now,
    } as Commission;

    commissions[index] = savedCommission;
  } else {
    // Create new
    savedCommission = {
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      order: data.order ?? 0,
      // Ensure images structure exists if not provided
      images: data.images || { references: [], drafts: [], finals: [] },
    } as Commission;

    commissions.push(savedCommission);
  }

  await writeDb(commissions);
  revalidatePath("/");
  return savedCommission;
}

export async function deleteCommission(id: string): Promise<void> {
  const commissions = await readDb();
  const commission = commissions.find((c) => c.id === id);

  if (!commission) {
    throw new Error(`Commission with ID ${id} not found`);
  }

  // Delete associated images from filesystem
  const allImages = [
    ...commission.images.references,
    ...commission.images.drafts,
    ...commission.images.finals,
  ];

  for (const url of allImages) {
    // Handle both old (/uploads/) and new (/api/uploads/) paths
    if (url.startsWith("/uploads/") || url.startsWith("/api/uploads/")) {
      try {
        const filename = url.split("/").pop();
        if (filename) {
          const filePath = path.join(process.cwd(), "uploads", filename);
          await fs.unlink(filePath);
        }
      } catch (error) {
        console.error(`Failed to delete file: ${url}`, error);
      }
    }
  }

  const filteredCommissions = commissions.filter((c) => c.id !== id);

  await writeDb(filteredCommissions);
  revalidatePath("/");
}
