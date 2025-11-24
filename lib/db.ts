import fs from "fs/promises";
import path from "path";
import { Commission } from "@/types";

const DB_PATH = path.join(process.cwd(), "data", "commissions.json");

export async function readDb(): Promise<Commission[]> {
  try {
    await fs.access(DB_PATH);
  } catch (error) {
    // If file doesn't exist, create it with empty array
    await fs.writeFile(DB_PATH, "[]", "utf-8");
    return [];
  }

  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data) as Commission[];
  } catch (error) {
    console.error("Error reading database:", error);
    // If file is corrupted or empty, return empty array
    return [];
  }
}

export async function writeDb(data: Commission[]): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database:", error);
    throw new Error("Failed to save data");
  }
}
